import { SITE } from "../data/site";
import InstagramIcon from "./icons/InstagramIcon";
import Logo from "./Logo";
import HeroMarquee from "./HeroMarquee";
import HeroCollage from "./HeroCollage";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative bg-white pb-6 border-b border-gold-100/80 overflow-hidden"
    >
      <div className="relative">
        <HeroCollage />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-2 flex flex-col items-center text-center">
        <Logo size={120} className="mb-4" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 border border-gold-200/60 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
          <span className="text-gold-700 uppercase text-[10px] tracking-[0.3em] font-bold">
            Colección {new Date().getFullYear()}
          </span>
        </div>

        <h1 className="font-playfair font-medium text-[2.6rem] sm:text-6xl lg:text-7xl text-ink mb-4 leading-[1.05]">
          Accesorios con <br className="hidden sm:inline" />
          <span className="italic gold-text-gradient pr-1">brillo propio</span>
        </h1>

        <p className="max-w-xl mx-auto font-lato font-light text-[15px] sm:text-base text-gray-600 mb-7 tracking-[0.03em] leading-relaxed">
          Collares, pulseras, perfumes y combos únicos, elegidos con cariño para
          acompañarte en cada momento especial.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#catalogo"
            className="gold-gradient text-white hover:opacity-90 px-9 py-4 rounded-full text-xs font-bold tracking-[0.25em] uppercase transition shadow-md hover:shadow-xl"
          >
            Ver catálogo
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-gold-600 hover:text-gold-500 transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />@{SITE.instagramHandle}
          </a>
        </div>
      </div>
      </div>

      <div className="relative z-10">
        <HeroMarquee />
      </div>

    </section>
  );
}
