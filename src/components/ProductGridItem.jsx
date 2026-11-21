import { Eye, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCatalogUI } from "../context/CatalogUIContext";
import ProductThumb from "./ProductThumb";
import { formatPrice } from "../utils/price";

export default function ProductGridItem({ product }) {
  const { addToCart } = useCart();
  const { openDetail } = useCatalogUI();

  return (
    <div className="product-card group bg-white rounded-2xl overflow-hidden border border-gold-200/60 flex flex-col">
      <button
        type="button"
        onClick={() => openDetail(product)}
        className="relative block w-full cursor-pointer"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <ProductThumb product={product} imgClassName="product-img" className="w-full aspect-square" />
        <span className="absolute bottom-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-white/95 text-gold-600 shadow-md border border-gold-100 opacity-0 group-hover:opacity-100 transition duration-300">
          <Eye className="w-3.5 h-3.5" />
        </span>
      </button>

      <div className="p-3.5 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-[9px] uppercase font-bold text-gold-600 tracking-[0.25em] block mb-1 truncate">
            {product.category}
          </span>
          <h3
            onClick={() => openDetail(product)}
            className="font-serif text-sm sm:text-base font-black text-ink break-words cursor-pointer hover:text-gold-600 transition mb-3 leading-snug"
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-gold-600 font-extrabold text-sm sm:text-base">{formatPrice(product.price)}</p>
          <button
            type="button"
            onClick={(e) => addToCart(product, e.currentTarget)}
            className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl gold-gradient hover:opacity-90 text-white transition shadow-sm"
            aria-label={`Agregar ${product.name} al carrito`}
            title="Agregar al carrito"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
