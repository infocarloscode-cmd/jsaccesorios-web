// Precio 0 significa "todavía sin precio": se muestra como "Consultar precio"
// y el pedido por WhatsApp lo indica para que la clienta lo cotice.
export function formatPrice(price) {
  return price > 0 ? `$${price.toFixed(2)}` : "Consultar precio";
}

export function formatTotal(cart, totalPrice) {
  const hayPorConsultar = cart.some((item) => !(item.price > 0));
  if (!hayPorConsultar) return `$${totalPrice.toFixed(2)}`;
  return totalPrice > 0 ? `$${totalPrice.toFixed(2)} + por consultar` : "Por consultar";
}
