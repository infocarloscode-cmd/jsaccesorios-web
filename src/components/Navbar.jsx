import { useEffect, useRef, useState } from "react";
import { Search, Share2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCatalogUI } from "../context/CatalogUIContext";
import { SITE } from "../data/site";
import { useWhatsapp } from "../utils/whatsapp";
import { shareOrCopy } from "../utils/share";
import WhatsappIcon from "./icons/WhatsappIcon";
import Logo from "./Logo";

function SearchInput({ className = "", placeholder }) {
  const { searchQuery, setSearchQuery } = useCatalogUI();

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    // Si el catálogo aún no está a la vista, bajamos para mostrar los resultados.
    const catalogo = document.getElementById("catalogo");
    if (catalogo && catalogo.getBoundingClientRect().top > window.innerHeight * 0.6) {
      catalogo.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="search"
        value={searchQuery}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Buscar productos"
        className="w-full bg-cream border border-gold-200/80 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gold-400 focus:bg-white transition-all placeholder:text-gray-400 placeholder:font-light"
      />
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold-400" />
    </div>
  );
}

export default function Navbar() {
  const { totalItems, setCartOpen, cartIconRef } = useCart();
  const { showToast } = useCatalogUI();
  const { contactUrl } = useWhatsapp();
  const [bump, setBump] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 320);
    return () => clearTimeout(t);
  }, [totalItems]);

  const shareCatalog = () =>
    shareOrCopy(
      {
        title: SITE.shortName,
        text: `Descubre el catálogo de ${SITE.shortName}.`,
        url: window.location.origin,
      },
      showToast,
      "¡Enlace del catálogo copiado!"
    );

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gold-200/50">
      <div className="gold-gradient text-white text-[10px] sm:text-xs py-2 px-4 text-center font-semibold tracking-[0.25em] uppercase">
        ✨ {SITE.tagline} · Pedidos por WhatsApp
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24 gap-4">
          <a href="#inicio" className="flex items-center gap-3 shrink-0 group">
            <Logo size={44} />
            <span className="flex flex-col leading-none">
              <span className="font-display font-medium text-[1.6rem] sm:text-[2.2rem] leading-none tracking-[0.05em] gold-text-gradient pr-1 group-hover:opacity-80 transition duration-300">
                {SITE.shortName}
              </span>
              <span className="font-sans font-light text-[8px] sm:text-[9px] tracking-[0.4em] text-gold-600 uppercase border-t border-gold-300/60 pt-1.5 mt-1">
                {SITE.byline}
              </span>
            </span>
          </a>

          <SearchInput
            className="hidden md:block flex-1 max-w-xs mx-8"
            placeholder="Buscar collares, pulseras, perfumes..."
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={shareCatalog}
              className="grid place-items-center w-10 h-10 rounded-full text-ink hover:text-gold-600 hover:bg-gold-50 border border-transparent hover:border-gold-200 transition"
              title="Compartir catálogo"
              aria-label="Compartir catálogo"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <a
              href={contactUrl()}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-2.5 gold-gradient hover:opacity-95 text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition shadow-sm hover:shadow-md"
            >
              <WhatsappIcon className="w-4 h-4" /> WhatsApp
            </a>

            <button
              ref={cartIconRef}
              type="button"
              onClick={() => setCartOpen(true)}
              className={`relative grid place-items-center w-10 h-10 rounded-full text-ink hover:text-gold-600 hover:bg-gold-50 border border-gold-200 transition-transform ${
                bump ? "scale-110" : "scale-100"
              }`}
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full gold-gradient text-[10px] font-bold text-white grid place-items-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchInput placeholder="Buscar accesorios..." />
      </div>
    </header>
  );
}
