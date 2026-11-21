import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GripVertical, Plus, Star, Upload, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { uploadProductImage } from "../lib/uploadImage";
import { CATEGORIES, categoriasDe } from "../data/categories";
import { normalize } from "../utils/text";

const VACIO = { name: "", category: CATEGORIES[0], price: "", description: "", photos: [] };

function BotonSubirFoto({ texto, onChange, cargando }) {
  const inputRef = useRef(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={cargando}
        className="flex items-center gap-2 rounded-lg border border-dashed border-gold-300 hover:border-gold-400 hover:bg-gold-50 transition-colors px-4 py-2.5 text-sm text-ink-soft disabled:opacity-60"
      >
        <Upload className="w-4 h-4" />
        {cargando ? "Subiendo..." : texto}
      </button>
    </div>
  );
}

// Miniatura arrastrable. La primera del arreglo es siempre la foto
// principal del producto -- arrastrar y soltar reordena el arreglo. En el
// teléfono no se puede arrastrar, por eso también está "Hacer principal".
function FotoArrastrable({ url, index, esPrincipal, onSoltar, onQuitar, onPrincipal, arrastrando, setArrastrando }) {
  return (
    <div
      draggable
      onDragStart={() => setArrastrando(index)}
      onDragEnd={() => setArrastrando(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onSoltar(index)}
      className={`relative w-24 h-24 rounded-lg border-2 bg-gold-50 overflow-hidden cursor-grab active:cursor-grabbing transition-opacity ${
        esPrincipal ? "border-gold-400" : "border-gold-200/60"
      } ${arrastrando === index ? "opacity-40" : "opacity-100"}`}
    >
      <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />

      <div className="absolute top-1 left-1 grid place-items-center w-5 h-5 rounded-full bg-white/80 text-ink-soft">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {esPrincipal ? (
        <span className="absolute bottom-0 inset-x-0 bg-gold-400 text-white text-[10px] font-medium text-center py-0.5">
          Principal
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onPrincipal(index)}
          className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-1 bg-white/90 hover:bg-white text-ink text-[10px] font-medium py-0.5"
        >
          <Star className="w-3 h-3" />
          Hacer principal
        </button>
      )}

      <button
        type="button"
        onClick={() => onQuitar(index)}
        className="absolute -top-2 -right-2 grid place-items-center w-5 h-5 rounded-full bg-ink text-white"
        aria-label="Quitar foto"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function AdminProductForm() {
  const { id } = useParams();
  const esNuevo = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState(CATEGORIES);
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("category")
      .then(({ data }) => {
        if (data) setCategorias((actuales) => [...new Set([...categoriasDe(data), ...actuales])]);
      });
  }, []);

  useEffect(() => {
    if (esNuevo) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          const fotos = [data.image, ...(data.gallery ?? [])].filter(Boolean);
          setForm({ ...data, photos: fotos });
        }
        setCargando(false);
      });
  }, [id, esNuevo]);

  const actualizar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const opcionesCategoria = categorias.includes(form.category) ? categorias : [...categorias, form.category];

  const cerrarNuevaCategoria = () => {
    setCreandoCategoria(false);
    setNuevaCategoria("");
  };

  // Deja la categoría escrita seleccionada y la devuelve. Si ya existe (aunque
  // cambien mayúsculas o acentos) usa la existente para no duplicarla.
  const confirmarNuevaCategoria = () => {
    const nombre = nuevaCategoria.trim().replace(/\s+/g, " ");
    if (!nombre) return form.category;
    const elegida = opcionesCategoria.find((c) => normalize(c) === normalize(nombre)) ?? nombre;
    setCategorias((actuales) => (actuales.includes(elegida) ? actuales : [...actuales, elegida]));
    actualizar("category", elegida);
    cerrarNuevaCategoria();
    return elegida;
  };

  const agregarFotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSubiendoFotos(true);
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
    } catch (err) {
      alert("No se pudieron subir las fotos: " + err.message);
    }
    setSubiendoFotos(false);
    e.target.value = "";
  };

  const quitarFoto = (index) => {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const hacerPrincipal = (index) => {
    setForm((f) => {
      const fotos = [...f.photos];
      const [movida] = fotos.splice(index, 1);
      return { ...f, photos: [movida, ...fotos] };
    });
  };

  const soltarFoto = (indexDestino) => {
    if (arrastrando === null || arrastrando === indexDestino) return;
    setForm((f) => {
      const fotos = [...f.photos];
      const [movida] = fotos.splice(arrastrando, 1);
      fotos.splice(indexDestino, 0, movida);
      return { ...f, photos: fotos };
    });
    setArrastrando(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (form.photos.length === 0) {
      setError("Agrega al menos una foto del producto.");
      return;
    }
    setGuardando(true);
    setError("");
    // Por si escribió una categoría nueva y fue directo a "Guardar".
    const categoria = confirmarNuevaCategoria();

    const [principal, ...resto] = form.photos;
    const payload = {
      name: form.name.trim(),
      category: categoria,
      price: Number(form.price),
      description: form.description?.trim() || null,
      image: principal || null,
      gallery: resto.length ? resto : null,
    };

    const resultado = esNuevo
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);

    setGuardando(false);
    if (resultado.error) {
      setError("No se pudo guardar. Revisa tu conexión e intenta de nuevo. (" + resultado.error.message + ")");
    } else {
      navigate("/admin");
    }
  };

  if (cargando) return <p className="text-ink-soft">Cargando...</p>;

  return (
    <form onSubmit={guardar} className="max-w-xl flex flex-col gap-5">
      <h1 className="font-serif text-2xl text-ink">
        {esNuevo ? "Nuevo producto" : "Editar producto"}
      </h1>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-ink-soft">Nombre</label>
        <input
          required
          value={form.name}
          onChange={(e) => actualizar("name", e.target.value)}
          className="rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-ink-soft">Categoría</label>
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={(e) => actualizar("category", e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
          >
            {opcionesCategoria.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setCreandoCategoria(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gold-300 hover:border-gold-400 hover:bg-gold-50 transition-colors px-3 py-2 text-sm font-medium text-gold-600"
          >
            <Plus className="w-4 h-4" />
            Nueva categoría
          </button>
        </div>
        {creandoCategoria && (
          <div className="flex gap-2 mt-1">
            <input
              autoFocus
              maxLength={40}
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmarNuevaCategoria();
                }
              }}
              placeholder="Nombre de la categoría"
              aria-label="Nombre de la nueva categoría"
              className="flex-1 min-w-0 rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
            />
            <button
              type="button"
              onClick={confirmarNuevaCategoria}
              disabled={!nuevaCategoria.trim()}
              className="shrink-0 rounded-lg bg-gold-400 hover:bg-gold-500 transition-colors text-white font-medium px-4 py-2 text-sm disabled:opacity-60"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={cerrarNuevaCategoria}
              className="shrink-0 grid place-items-center w-9 rounded-lg text-ink-soft hover:text-ink"
              aria-label="Cancelar nueva categoría"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-ink-soft">Precio (USD)</label>
        <input
          required
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => actualizar("price", e.target.value)}
          className="rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-ink-soft">Descripción</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => actualizar("description", e.target.value)}
          className="rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-ink-soft">
          Fotos — la principal es la que se ve en el catálogo.
        </label>
        {form.photos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.photos.map((url, i) => (
              <FotoArrastrable
                key={url + i}
                url={url}
                index={i}
                esPrincipal={i === 0}
                onSoltar={soltarFoto}
                onQuitar={quitarFoto}
                onPrincipal={hacerPrincipal}
                arrastrando={arrastrando}
                setArrastrando={setArrastrando}
              />
            ))}
          </div>
        )}
        <BotonSubirFoto texto="Agregar fotos" onChange={agregarFotos} cargando={subiendoFotos} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={guardando || subiendoFotos}
          className="rounded-full bg-gold-400 hover:bg-gold-500 transition-colors text-white font-medium px-6 py-2.5 text-sm disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
