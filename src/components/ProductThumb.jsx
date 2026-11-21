import { iconFor } from "../data/categoryIcons";

export default function ProductThumb({ product, className = "", imgClassName = "", lazy = true }) {
  const Icon = iconFor(product.category);

  return (
    <div className={`relative bg-gold-50 overflow-hidden ${className}`}>
      {product.image ? (
        // object-cover: las fotos vienen de WhatsApp con tamaños y fondos
        // distintos; recortarlas al cuadro deja la cuadrícula pareja.
        <img
          src={product.image}
          alt={product.name}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Icon className="w-8 h-8 text-gold-300" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}
