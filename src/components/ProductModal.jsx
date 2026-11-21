import { useEffect, useState } from "react";
import { Gift, Minus, Plus, Share2, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useCatalogUI } from "../context/CatalogUIContext";
import { useCart } from "../context/CartContext";
import { iconFor } from "../data/categoryIcons";
import { formatPrice } from "../utils/price";
import { useWhatsapp } from "../utils/whatsapp";
import { shareOrCopy } from "../utils/share";
import WhatsappIcon from "./icons/WhatsappIcon";

export default function ProductModal() {
  const { detailProduct, closeDetail, showToast } = useCatalogUI();
  const { addToCart } = useCart();
  const { productUrl } = useWhatsapp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [qty, setQty] = useState(1);

  // Bloquea el scroll de la página mientras el modal está abierto y permite cerrar con Escape.
  useEffect(() => {
    if (!detailProduct) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailProduct]);

  if (!detailProduct) return null;

  const product = detailProduct;
  const images = product.image ? [product.image, ...(product.gallery ?? [])] : (product.gallery ?? []);
  const Icon = iconFor(product.category);

  function handleClose() {
    closeDetail();
    setActiveIndex(0);
    setQty(1);
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    handleClose();
  };

  const handleShare = () =>
    shareOrCopy(
      {
        title: product.name,
        text: `Mira esta pieza: ${product.name} - ${formatPrice(product.price)}`,
        url: window.location.origin,
      },
      showToast,
      "¡Información copiada!"
    );

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar detalles"
        onClick={handleClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
      />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="pointer-events-auto relative bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row border border-gold-300/40 animate-fade-up">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-20 grid place-items-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ink shadow border border-gold-200 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-full md:w-1/2 bg-gold-50/50 flex flex-col">
            <div className="relative aspect-square overflow-hidden">
              {images.length > 0 ? (
                <>
                  {/* Fondo difuminado de la misma foto para no dejar franjas vacías */}
                  <img
                    src={images[activeIndex]}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
                  />
                  <img
                    src={images[activeIndex]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <Icon className="w-16 h-16 text-gold-300" strokeWidth={1.25} />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      i === activeIndex ? "border-gold-400" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover bg-gold-50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-7 flex flex-col justify-between md:overflow-y-auto md:max-h-[90vh]">
            <div>
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.3em] block mb-1">
                {product.category}
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink mb-2 leading-snug pr-8">
                {product.name}
              </h2>
              <p className="text-gold-600 font-extrabold text-2xl mb-5">{formatPrice(product.price)}</p>
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-light whitespace-pre-line">
                  {product.description}
                </p>
              )}

              <div className="border-y border-gold-100 py-4 mb-6 space-y-2.5 text-xs text-gray-700 font-medium">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Piezas seleccionadas con cuidado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-gold-500 shrink-0" />
                  <span>Entrega o envío coordinado por WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid place-items-center w-9 h-9 rounded-full border border-gold-300 hover:bg-gold-50"
                    aria-label="Restar cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="grid place-items-center w-9 h-9 rounded-full border border-gold-300 hover:bg-gold-50"
                    aria-label="Sumar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 gold-gradient hover:opacity-90 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase transition shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" /> Agregar
                </button>
              </div>

              <a
                href={productUrl(product)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2.5 text-xs tracking-[0.2em] uppercase transition shadow-md"
              >
                <WhatsappIcon className="w-4 h-4" /> Pedir por WhatsApp
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="w-full bg-gold-50 hover:bg-gold-100 text-gold-700 text-xs py-3 rounded-full font-bold transition flex items-center justify-center gap-2 border border-gold-200/80"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir esta pieza
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
