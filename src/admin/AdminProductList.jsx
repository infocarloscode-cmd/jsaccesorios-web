import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { supabase } from "../lib/supabase";
import { deleteProductImages } from "../lib/uploadImage";
import { categoriasDe } from "../data/categories";
import { normalize } from "../utils/text";
import { formatPrice } from "../utils/price";

const selectClass =
  "flex-1 sm:flex-none min-w-[170px] rounded-full border border-gold-200 bg-white px-4 py-2 text-sm text-ink focus:outline-none focus:border-gold-400 cursor-pointer";

const PRECIOS = [
  { id: "todos", label: "Todos los precios" },
  { id: "con", label: "Con precio" },
  { id: "sin", label: "Sin precio (por consultar)" },
];

function TarjetaProducto({ p, onBorrar, borrando }) {
  return (
    <div className="border border-gold-200/60 rounded-xl p-3 flex gap-3 items-start bg-white">
      <Link
        to={`/admin/productos/${p.id}`}
        className="w-20 h-20 shrink-0 rounded-lg bg-gold-50 overflow-hidden grid place-items-center"
      >
        {p.image ? (
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-gold-300">sin foto</span>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink leading-snug break-words">{p.name}</p>
        <p className="text-[11px] text-ink-soft mt-0.5">{p.category}</p>
        <p className={`text-sm font-medium mt-1 ${p.price > 0 ? "text-gold-600" : "text-ink-soft italic"}`}>
          {formatPrice(p.price)}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Link
          to={`/admin/productos/${p.id}`}
          className="grid place-items-center w-8 h-8 rounded-full hover:bg-gold-100 text-ink-soft"
          aria-label={`Editar ${p.name}`}
          title="Editar"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => onBorrar(p)}
          disabled={borrando}
          className="grid place-items-center w-8 h-8 rounded-full hover:bg-red-50 text-ink-soft hover:text-red-500 disabled:opacity-40"
          aria-label={`Borrar ${p.name}`}
          title="Borrar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminProductList() {
  const { products, loading, error, refetch } = useProducts();
  const [borrandoId, setBorrandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [precio, setPrecio] = useState("todos");

  const conteo = useMemo(() => {
    const c = {};
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const q = normalize(busqueda.trim());
  const filtrados = products.filter(
    (p) =>
      (categoria === "todas" || p.category === categoria) &&
      (precio === "todos" || (precio === "con" ? p.price > 0 : !(p.price > 0))) &&
      (!q || normalize(p.name).includes(q))
  );

  // Agrupados por categoría, en el mismo orden que la tienda.
  const grupos = categoriasDe(products).map((c) => ({ category: c, items: filtrados.filter((p) => p.category === c) })).filter(
    (g) => g.items.length > 0
  );

  const hayFiltros = q || categoria !== "todas" || precio !== "todos";
  const limpiar = () => {
    setBusqueda("");
    setCategoria("todas");
    setPrecio("todos");
  };

  const borrar = async (producto) => {
    if (!confirm(`¿Borrar "${producto.name}"? Esta acción no se puede deshacer.`)) return;
    setBorrandoId(producto.id);
    const { error } = await supabase.from("products").delete().eq("id", producto.id);
    if (error) {
      setBorrandoId(null);
      alert("No se pudo borrar: " + error.message);
      return;
    }
    // Si fallara el borrado de fotos, el producto ya no se ve en la tienda;
    // solo quedarían archivos sueltos en el almacenamiento.
    await deleteProductImages([producto.image, ...(producto.gallery ?? [])]).catch(() => {});
    setBorrandoId(null);
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-ink">
          Productos <span className="text-base text-ink-soft font-sans">({products.length})</span>
        </h1>
        <Link
          to="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-full bg-gold-400 hover:bg-gold-500 transition-colors text-white font-medium px-5 py-2.5 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      {loading && <p className="text-ink-soft">Cargando productos...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {!loading && products.length === 0 && (
        <p className="text-ink-soft">
          Todavía no hay productos. Toca "Nuevo producto" para agregar el primero.
        </p>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="sticky top-16 z-[5] -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-cream/95 backdrop-blur border-b border-gold-200/60 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre..."
                aria-label="Buscar producto por nombre"
                className="w-full rounded-full border border-gold-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                aria-label="Filtrar por categoría"
                className={selectClass}
              >
                <option value="todas">Todas las categorías ({products.length})</option>
                {categoriasDe(products).filter((c) => conteo[c]).map((c) => (
                  <option key={c} value={c}>
                    {c} ({conteo[c]})
                  </option>
                ))}
              </select>
              <select
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                aria-label="Filtrar por precio"
                className={selectClass}
              >
                {PRECIOS.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.label}
                  </option>
                ))}
              </select>
              {hayFiltros && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-ink-soft hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" /> Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-ink-soft -mt-2">
            {filtrados.length === products.length
              ? `Mostrando los ${products.length} productos`
              : `${filtrados.length} de ${products.length} productos`}
          </p>

          {grupos.length === 0 ? (
            <p className="text-ink-soft text-center py-10">Ningún producto coincide con la búsqueda.</p>
          ) : (
            grupos.map((g) => (
              <section key={g.category} className="flex flex-col gap-3">
                <h2 className="font-serif text-lg text-ink">
                  {g.category} <span className="text-sm text-ink-soft font-sans">({g.items.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.items.map((p) => (
                    <TarjetaProducto key={p.id} p={p} onBorrar={borrar} borrando={borrandoId === p.id} />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}
