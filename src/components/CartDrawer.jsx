import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { HoursStatus } from "./BusinessHours";
import { useCart } from "../context/CartContext";
import { useWhatsapp } from "../utils/whatsapp";
import ProductThumb from "./ProductThumb";
import { formatPrice, formatTotal } from "../utils/price";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
    totalPrice,
  } = useCart();
  const { orderUrl } = useWhatsapp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-sm bg-cream shadow-xl flex flex-col animate-in">
        <div className="flex items-center justify-between px-5 h-16 border-b border-gold-200/60">
          <h2 className="font-serif text-lg text-ink flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Tu carrito
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="grid place-items-center w-9 h-9 rounded-full hover:bg-gold-100"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {cart.length === 0 && (
            <p className="text-ink-soft text-sm text-center mt-10">
              Tu carrito está vacío. ¡Agrega alguna pieza del catálogo!
            </p>
          )}

          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 items-center">
              <ProductThumb product={item} className="w-16 h-16 shrink-0 rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {item.name}
                </p>
                <p className="text-sm text-gold-600 font-extrabold">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="grid place-items-center w-6 h-6 rounded-full border border-gold-300 hover:bg-gold-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm w-5 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="grid place-items-center w-6 h-6 rounded-full border border-gold-300 hover:bg-gold-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="grid place-items-center w-8 h-8 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-500"
                aria-label="Quitar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-gold-200/60 flex flex-col gap-3">
            <div className="flex items-center justify-between font-medium text-ink">
              <span>Total</span>
              <span className="font-serif text-xl">
                {formatTotal(cart, totalPrice)}
              </span>
            </div>
            <a
              href={orderUrl(cart, totalPrice)}
              target="_blank"
              rel="noreferrer"
              className="text-center rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold tracking-[0.15em] uppercase px-6 py-3.5 text-xs"
            >
              Finalizar pedido por WhatsApp
            </a>
            <HoursStatus className="justify-center text-[11px] text-ink-soft" />
          </div>
        )}
      </aside>
    </div>
  );
}
