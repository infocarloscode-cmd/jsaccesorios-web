import { useSettings } from "../context/SettingsContext";
import { SITE } from "../data/site";
import { formatPrice, formatTotal } from "./price";

export function buildOrderMessage(cart, totalPrice) {
  const lines = cart.map(
    (item) =>
      `• ${item.qty}x ${item.name} — ${item.price > 0 ? formatPrice(item.qty * item.price) : "precio por consultar"}`
  );
  const message = [
    `¡Hola ${SITE.shortName}! 👋 Quiero hacer este pedido:`,
    "",
    ...lines,
    "",
    `Total: ${formatTotal(cart, totalPrice)}`,
  ].join("\n");
  return message;
}

function waUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// Enlaces de WhatsApp con el número configurado en el admin.
export function useWhatsapp() {
  const { whatsappNumber } = useSettings();
  return {
    orderUrl: (cart, totalPrice) => waUrl(whatsappNumber, buildOrderMessage(cart, totalPrice)),
    productUrl: (product) =>
      waUrl(
        whatsappNumber,
        `¡Hola ${SITE.shortName}! Quisiera encargar: *${product.name}* (${formatPrice(product.price)}). ¿Tienen disponibilidad?`
      ),
    contactUrl: () => waUrl(whatsappNumber, `¡Hola ${SITE.shortName}! Me interesa consultar su catálogo.`),
  };
}
