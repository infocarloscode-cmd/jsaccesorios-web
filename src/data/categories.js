// Categorías base del catálogo, en el orden en que se muestran en la tienda.
// Las que no tienen productos no se muestran.
export const CATEGORIES = [
  "Collares",
  "Pulseras",
  "Argollas & Zarcillos",
  "Splash & Perfumes",
  "Combos",
];

// Las categorías base más las creadas desde el admin, que no tienen tabla
// propia: existen porque algún producto las usa.
export function categoriasDe(products) {
  const creadas = products.map((p) => p.category).filter((c) => c && !CATEGORIES.includes(c));
  return [...new Set([...CATEGORIES, ...creadas])];
}
