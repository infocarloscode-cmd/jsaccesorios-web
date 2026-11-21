import { useEffect, useState } from "react";
import { Sparkle } from "lucide-react";
import { useCart } from "../context/CartContext";

function FlyingDot({ item, onDone }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMoved(true));
    const timeout = setTimeout(onDone, 600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dx = item.to.x - item.from.x;
  const dy = item.to.y - item.from.y;

  return (
    <div
      className="fixed z-[60] pointer-events-none w-9 h-9 rounded-full bg-gold-400 grid place-items-center text-white shadow-lg transition-all duration-500 ease-[cubic-bezier(.32,.9,.4,1)]"
      style={{
        left: item.from.x,
        top: item.from.y,
        transform: moved ? `translate(${dx}px, ${dy}px) scale(0.25)` : "translate(0, 0) scale(1)",
        opacity: moved ? 0 : 1,
      }}
    >
      <Sparkle className="w-4 h-4" />
    </div>
  );
}

export default function FlyToCartLayer() {
  const { flyingItems, removeFlyingItem } = useCart();

  return (
    <>
      {flyingItems.map((item) => (
        <FlyingDot key={item.key} item={item} onDone={() => removeFlyingItem(item.key)} />
      ))}
    </>
  );
}
