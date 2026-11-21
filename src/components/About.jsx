import { Gem, Heart, Truck } from "lucide-react";
import { SITE } from "../data/site";

const FEATURES = [
  {
    icon: Gem,
    title: "Piezas seleccionadas",
    text: "Cada accesorio se elige a mano cuidando el detalle y la calidad.",
  },
  {
    icon: Heart,
    title: "Hecho con cariño",
    text: "Un negocio familiar que crece pieza a pieza junto a sus clientas.",
  },
  {
    icon: Truck,
    title: "Coordinamos la entrega",
    text: "Finalizas tu pedido por WhatsApp y coordinamos envío o retiro.",
  },
];

export default function About() {
  return (
    <section id="nosotros" className="bg-gold-50 border-y border-gold-200/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-serif font-black uppercase tracking-tight text-3xl sm:text-4xl text-ink">Nosotros</h2>
          <p className="text-xs sm:text-sm text-gray-600 font-light tracking-wide leading-relaxed mt-3">
            Somos {SITE.name}: nos apasiona ayudarte a encontrar el accesorio
            perfecto para cada ocasión, con estilo y calidez venezolana.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="product-card bg-white rounded-2xl border border-gold-200/60 p-6 text-center flex flex-col items-center gap-3"
            >
              <span className="grid place-items-center w-12 h-12 rounded-full gold-gradient text-white">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="font-serif font-black text-lg text-ink">{title}</h3>
              <p className="text-xs text-gray-600 font-light leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
