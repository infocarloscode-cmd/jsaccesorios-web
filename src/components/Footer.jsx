import { SITE } from "../data/site";
import BusinessHours from "./BusinessHours";
import { useWhatsapp } from "../utils/whatsapp";
import InstagramIcon from "./icons/InstagramIcon";
import WhatsappIcon from "./icons/WhatsappIcon";
import Logo from "./Logo";

export default function Footer() {
  const { contactUrl } = useWhatsapp();
  return (
    <footer id="contacto" className="bg-white border-t border-gold-200/60 py-12">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center">
        <Logo size={56} className="mb-4" />
        <h2 className="font-display font-medium text-4xl sm:text-5xl leading-tight tracking-[0.05em] gold-text-gradient px-2">
          {SITE.shortName}
        </h2>
        <p className="font-sans font-light text-[10px] tracking-[0.4em] text-gold-600 uppercase mt-1 mb-4">
          {SITE.byline}
        </p>
        <p className="text-xs text-gray-500 mb-4 max-w-sm font-light tracking-wide">
          Escríbenos por WhatsApp o Instagram para pedidos, dudas o disponibilidad de piezas.
        </p>
        <BusinessHours />

        <div className="flex justify-center gap-4 mb-8">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            title={`@${SITE.instagramHandle}`}
            aria-label="Instagram"
            className="grid place-items-center w-10 h-10 rounded-full bg-gold-50 hover:bg-gold-500 hover:text-white text-gold-600 border border-gold-200 transition"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>
          <a
            href={contactUrl()}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            aria-label="WhatsApp"
            className="grid place-items-center w-10 h-10 rounded-full bg-gold-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-gold-200 transition"
          >
            <WhatsappIcon className="w-4 h-4" />
          </a>
        </div>

        <div className="w-16 h-px bg-gold-200 mx-auto mb-6" />
        <p className="text-[10px] uppercase font-semibold tracking-[0.3em] text-gray-400">
          © {new Date().getFullYear()} {SITE.shortName}. Todos los derechos reservados.
        </p>
        <p className="text-[10px] text-gray-400 mt-3 tracking-wide">
          Hecho por{" "}
          <a
            href="https://instagram.com/carloscode_"
            target="_blank"
            rel="noreferrer"
            className="text-gold-600 font-semibold hover:text-gold-500 transition-colors"
          >
            Carloscode_
          </a>
        </p>
      </div>
    </footer>
  );
}
