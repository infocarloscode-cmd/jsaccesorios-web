import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { categoriasDe } from "../data/categories";
import { iconFor } from "../data/categoryIcons";
import { useProducts } from "../hooks/useProducts";
import { useCatalogUI } from "../context/CatalogUIContext";
import ProductThumb from "./ProductThumb";

const VELOCIDAD_PX_POR_SEGUNDO = 22; // entre más bajo, más lento se desliza

function irAlCatalogo() {
  document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HeroMarquee() {
  const { products } = useProducts();
  const { openDetail, activeCategory, setActiveCategory } = useCatalogUI();
  const conFoto = useMemo(() => products.filter((p) => p.image), [products]);
  // Dos copias seguidas: al llegar a la mitad, el loop vuelve al inicio sin salto.
  const track = useMemo(() => [...conFoto, ...conFoto], [conFoto]);
  const categorias = categoriasDe(products).filter((c) => products.some((p) => p.category === c));
  const [paused, setPaused] = useState(false);
  const [duracion, setDuracion] = useState(120);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!trackRef.current || conFoto.length === 0) return;
    setDuracion(trackRef.current.scrollWidth / 2 / VELOCIDAD_PX_POR_SEGUNDO);
  }, [conFoto]);

  if (conFoto.length === 0) return null;

  const elegirCategoria = (category) => {
    setActiveCategory(category);
    irAlCatalogo();
  };

  return (
    <div className="w-full mt-8 sm:mt-10">
      <div
        className="relative overflow-hidden select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex marquee-track border-l-2 border-gray-300"
          style={{
            animationPlayState: paused ? "paused" : "running",
            animationDuration: `${duracion}s`,
          }}
        >
          {track.map((product, i) => (
            <button
              key={`${product.id}-${i}`}
              type="button"
              onClick={() => openDetail(product)}
              aria-label={`Ver ${product.name}`}
              tabIndex={i < conFoto.length ? 0 : -1}
              className="group shrink-0 w-32 sm:w-48 lg:w-56 border-y-2 border-r-2 border-gray-300 bg-white"
            >
              <ProductThumb
                product={product}
                lazy={false}
                imgClassName="transition-transform duration-700 group-hover:scale-110"
                className="w-full aspect-square"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5 flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto scrollbar-none px-4">
        <button
          type="button"
          onClick={() => elegirCategoria("todos")}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap tracking-[0.2em] uppercase transition ${
            activeCategory === "todos"
              ? "gold-gradient text-white shadow-sm"
              : "bg-white text-ink border border-gold-200 hover:border-gold-400"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Todos
        </button>
        {categorias.map((category) => {
          const Icon = iconFor(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => elegirCategoria(category)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap tracking-[0.2em] uppercase transition ${
                activeCategory === category
                  ? "gold-gradient text-white shadow-sm"
                  : "bg-white text-ink border border-gold-200 hover:border-gold-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
