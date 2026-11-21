import { useMemo } from "react";
import { useProducts } from "../hooks/useProducts";

// Piezas elegidas a mano para el fondo, con el punto donde está el dije
// (x, y en fracción de la foto) y cuánto acercarse. Así se ve la pieza y su
// brillo, no solo la cadena. Si alguna se borra del catálogo, simplemente no aparece.
const SELECCION = [
  { id: "21fb43f3-e3f1-4bb7-852f-d8e3144c851f", x: 0.51, y: 0.59, zoom: 2.4 }, // corazón de brillantes
  { id: "7cc2ea2f-af02-4596-b30c-d1aaadc350b7", x: 0.5, y: 0.5, zoom: 1.1 }, // zarcillos sol radiante
  { id: "9ad0d080-73ff-45f2-bf93-d83789b8211b", x: 0.41, y: 0.6, zoom: 1.9 }, // pulsera ojo turco y candado
  { id: "e6152dcc-4d73-4571-b1f8-db5ac0cb5d24", x: 0.46, y: 0.62, zoom: 2.2 }, // medalla milagrosa
  { id: "9eff9b15-e294-489d-867d-f5290c241811", x: 0.46, y: 0.63, zoom: 2.4 }, // fresa
  { id: "a17eb9b1-bf0f-4021-afd3-9d71959ea7c0", x: 0.5, y: 0.6, zoom: 1.2 }, // zarcillos corazón rojo
  { id: "9fd29d37-bc43-42cb-9e86-bb641515bd94", x: 0.5, y: 0.63, zoom: 2.4 }, // avión de brillantes
  { id: "8dd88816-aa43-46f8-bfef-c4f52698dc0f", x: 0.5, y: 0.57, zoom: 1.8 }, // pulsera gatito
  { id: "e83f5bc3-ea4d-4e3f-84fc-0a214e6cb755", x: 0.5, y: 0.59, zoom: 2.4 }, // cerezas de brillantes
  { id: "47e7cd65-2252-49ef-a330-fe2b9a39ee8e", x: 0.46, y: 0.58, zoom: 2.2 }, // corazón radiante
  { id: "32a0524c-dfa1-46b0-8d25-6fb5bb9bf9a0", x: 0.51, y: 0.55, zoom: 2.0 }, // estrella dorada
  { id: "946ebf78-ff99-45bd-a136-deb695e5abb5", x: 0.46, y: 0.565, zoom: 2.0 }, // perrito globo
  { id: "8cf9af87-c74a-4af3-adeb-840f1bf78c4b", x: 0.51, y: 0.52, zoom: 2.4 }, // estrella roja
  { id: "4b8a9d89-261b-4408-a872-8cb30ef717bd", x: 0.46, y: 0.58, zoom: 2.2 }, // estrella calada
  { id: "d5c82a28-0595-429b-ba79-4a085e637bf8", x: 0.53, y: 0.5, zoom: 2.2 }, // corazón filigrana
];

const CASILLAS = 30; // se repiten para cubrir todo el fondo en cualquier pantalla

// Fondo decorativo de la portada: collage de piezas del catálogo, suave y
// transparente, con un velo blanco al centro para que el texto se lea bien.
export default function HeroCollage() {
  const { products } = useProducts();

  const fotos = useMemo(() => {
    const porId = new Map(products.filter((p) => p.image).map((p) => [p.id, p]));
    const elegidas = SELECCION.filter((s) => porId.has(s.id)).map((s) => ({ ...s, image: porId.get(s.id).image }));
    if (elegidas.length === 0) return [];
    // Segunda vuelta en orden inverso para que no queden repetidas una junto a otra.
    const vuelta = [...elegidas, ...[...elegidas].reverse()];
    return Array.from({ length: CASILLAS }, (_, i) => vuelta[i % vuelta.length]);
  }, [products]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fotos pegadas: las líneas de 2px entre ellas son el fondo gris del grid, inclinado en diagonal */}
      {fotos.length > 0 && (
        <div className="absolute -inset-x-[8%] top-1/2 -translate-y-1/2 grid grid-cols-3 sm:grid-cols-5 gap-[2px] bg-gray-500 -rotate-6 opacity-[0.45] grayscale-[10%]">
          {fotos.map((f, i) => {
            const punto = `${f.x * 100}% ${f.y * 100}%`;
            return (
              <div key={`${f.id}-${i}`} className="relative aspect-square overflow-hidden bg-white">
                <img
                  src={f.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: punto, transformOrigin: punto, transform: `scale(${f.zoom})` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Velo: blanco casi sólido al centro, se abre hacia los bordes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.35) 80%, rgba(255,255,255,0.15) 100%)",
        }}
      />
      {/* Fundido arriba y abajo para unir con el encabezado y la vitrina */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
