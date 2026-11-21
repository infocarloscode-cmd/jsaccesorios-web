import { Gem } from "lucide-react";
import { categoriasDe } from "../data/categories";
import { normalize } from "../utils/text";
import { useProducts } from "../hooks/useProducts";
import { useCatalogUI } from "../context/CatalogUIContext";
import ProductGridItem from "./ProductGridItem";

export default function Catalog() {
  const { products, loading, error } = useProducts();
  const { activeCategory, searchQuery } = useCatalogUI();
  const categorias = categoriasDe(products).filter((c) => products.some((p) => p.category === c));

  const query = normalize(searchQuery.trim());
  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "todos" || p.category === activeCategory;
    const matchesSearch =
      !query ||
      normalize(p.name).includes(query) ||
      normalize(p.description ?? "").includes(query) ||
      normalize(p.category).includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="catalogo"
      className="scroll-mt-36 md:scroll-mt-32 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16"
    >
      {loading ? (
        <p className="text-center text-ink-soft text-sm py-16 tracking-wide">Cargando catálogo...</p>
      ) : error ? (
        <p className="text-center text-ink-soft text-sm py-16">
          No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.
        </p>
      ) : categorias.length === 0 ? (
        <p className="text-center text-ink-soft text-sm py-16">Muy pronto tendremos productos aquí.</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-4 pb-5 mb-8 sm:mb-10 border-b border-gold-100">
            <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink">
              {activeCategory === "todos" ? "Todo el catálogo" : activeCategory}
            </h2>
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] text-gold-600 whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
              {filtered.map((product) => (
                <ProductGridItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Gem className="w-12 h-12 text-gold-300 mx-auto mb-4 animate-bounce" strokeWidth={1.25} />
              <h3 className="font-serif font-black text-2xl text-ink">No encontramos resultados</h3>
              <p className="text-xs text-gray-500 mt-2 font-light">
                Prueba buscando con otro término o seleccionando otra categoría.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
