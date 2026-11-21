"""Reemplaza todo el catálogo de Supabase por los productos de un archivo JSON.

Uso (desde la raíz del proyecto):
    python scripts/cargar_catalogo.py fotos-whatsapp/catalogo.json            # solo revisa
    python scripts/cargar_catalogo.py fotos-whatsapp/catalogo.json --cargar   # borra y carga
    python scripts/cargar_catalogo.py fotos-whatsapp/lote-2/catalogo.json --agregar  # agrega sin borrar

El JSON es una lista de {"foto", "name", "category", "price", "description"?};
"foto" es relativa a la carpeta del JSON. Antes de borrar, guarda un respaldo
de los productos actuales junto al JSON.

Credenciales (en .env, que no se sube al repo): VITE_SUPABASE_URL y
VITE_SUPABASE_ANON_KEY, más SUPABASE_SERVICE_ROLE_KEY o bien
ADMIN_EMAIL + ADMIN_PASSWORD del usuario del panel.
"""

import io
import json
import sys
import uuid
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from PIL import Image, ImageOps

CATEGORIAS = ["Collares", "Pulseras", "Argollas & Zarcillos", "Splash & Perfumes", "Combos"]
BUCKET = "product-images"
MAX_SIZE = 1600  # igual que src/lib/uploadImage.js


def leer_env():
    env = {}
    for linea in Path(".env").read_text(encoding="utf-8").splitlines():
        if "=" in linea and not linea.lstrip().startswith("#"):
            k, v = linea.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    return env


def pedir(metodo, url, headers, cuerpo=None):
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            datos = r.read()
            return json.loads(datos) if datos else None
    except urllib.error.HTTPError as e:
        sys.exit(f"Error {e.code} en {metodo} {url}: {e.read().decode(errors='replace')}")


def token(env):
    if env.get("SUPABASE_SERVICE_ROLE_KEY"):
        return env["SUPABASE_SERVICE_ROLE_KEY"]
    if not (env.get("ADMIN_EMAIL") and env.get("ADMIN_PASSWORD")):
        sys.exit("Falta SUPABASE_SERVICE_ROLE_KEY o ADMIN_EMAIL/ADMIN_PASSWORD en .env")
    r = pedir(
        "POST",
        f"{env['VITE_SUPABASE_URL']}/auth/v1/token?grant_type=password",
        {"apikey": env["VITE_SUPABASE_ANON_KEY"], "Content-Type": "application/json"},
        json.dumps({"email": env["ADMIN_EMAIL"], "password": env["ADMIN_PASSWORD"]}).encode(),
    )
    return r["access_token"]


def reducir(ruta):
    im = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
    im.thumbnail((MAX_SIZE, MAX_SIZE))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=85, optimize=True)
    return buf.getvalue()


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    archivo = Path(sys.argv[1])
    agregar = "--agregar" in sys.argv
    cargar = "--cargar" in sys.argv or agregar
    productos = json.loads(archivo.read_text(encoding="utf-8"))

    problemas = []
    for i, p in enumerate(productos, 1):
        if not (archivo.parent / p["foto"]).is_file():
            problemas.append(f"#{i}: no existe la foto {p['foto']}")
        if p.get("category") not in CATEGORIAS:
            problemas.append(f"#{i}: categoría inválida {p.get('category')!r}")
        # 0 = sin precio todavía; la tienda muestra "Consultar precio"
        if not isinstance(p.get("price"), (int, float)) or p["price"] < 0:
            problemas.append(f"#{i} {p.get('name')}: precio inválido")
        if not p.get("name", "").strip():
            problemas.append(f"#{i}: falta el nombre")
    if problemas:
        sys.exit("No se puede cargar:\n  " + "\n  ".join(problemas))
    print(f"{len(productos)} productos revisados, todo en orden.")
    if not cargar:
        print("Modo revisión: no se cambió nada. Usa --cargar para reemplazar o --agregar para sumar.")
        return

    env = leer_env()
    base = env["VITE_SUPABASE_URL"]
    tok = token(env)
    if env.get("SUPABASE_SERVICE_ROLE_KEY"):
        # Las claves nuevas (sb_secret_...) no son JWT: van solo en "apikey".
        h = {"apikey": tok}
        if not tok.startswith("sb_"):
            h["Authorization"] = f"Bearer {tok}"
    else:
        h = {"apikey": env["VITE_SUPABASE_ANON_KEY"], "Authorization": f"Bearer {tok}"}

    # 1. Respaldo de lo que hay hoy
    actuales = pedir("GET", f"{base}/rest/v1/products?select=*", h)
    sello = datetime.now().strftime("%Y%m%d-%H%M%S")
    respaldo = archivo.parent / f"respaldo-productos-{sello}.json"
    respaldo.write_text(json.dumps(actuales, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Respaldo de {len(actuales)} productos en {respaldo}")

    if not agregar:
        # 2. Borrar productos actuales y sus fotos del bucket
        pedir("DELETE", f"{base}/rest/v1/products?id=not.is.null", h)
        marcador = f"/{BUCKET}/"
        viejas = [u.split(marcador, 1)[1] for p in actuales
                  for u in [p.get("image"), *(p.get("gallery") or [])] if u and marcador in u]
        if viejas:
            pedir("DELETE", f"{base}/storage/v1/object/{BUCKET}",
                  {**h, "Content-Type": "application/json"}, json.dumps({"prefixes": viejas}).encode())
        print(f"Borrados {len(actuales)} productos y {len(viejas)} fotos.")

    # 3. Subir fotos e insertar. created_at escalonado para respetar el orden del JSON.
    inicio = datetime.now(timezone.utc)
    filas = []
    for i, p in enumerate(productos):
        nombre = f"{uuid.uuid4()}.jpg"
        pedir("POST", f"{base}/storage/v1/object/{BUCKET}/{nombre}",
              {**h, "Content-Type": "image/jpeg"}, reducir(archivo.parent / p["foto"]))
        filas.append({
            "name": p["name"].strip(),
            "category": p["category"],
            "price": p["price"],
            "description": p.get("description") or None,
            "image": f"{base}/storage/v1/object/public/{BUCKET}/{nombre}",
            "gallery": None,
            "created_at": (inicio + timedelta(seconds=i)).isoformat(),
        })
        print(f"  [{i + 1}/{len(productos)}] {p['name']}")
    pedir("POST", f"{base}/rest/v1/products", {**h, "Content-Type": "application/json"},
          json.dumps(filas).encode())
    print(f"Listo: {len(filas)} productos cargados.")


if __name__ == "__main__":
    main()
