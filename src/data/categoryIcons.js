import { CircleDot, Droplet, Gem, Gift, Sparkle } from "lucide-react";

export const CATEGORY_ICONS = {
  Collares: Gem,
  Pulseras: CircleDot,
  "Argollas & Zarcillos": Sparkle,
  "Splash & Perfumes": Droplet,
  Combos: Gift,
};

export function iconFor(category) {
  return CATEGORY_ICONS[category] ?? Gem;
}
