import { CircleCheck } from "lucide-react";
import { useCatalogUI } from "../context/CatalogUIContext";

export default function Toast() {
  const { toast } = useCatalogUI();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-ink text-white text-xs px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-gold-400/40 transition-all duration-300 ${
        toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <CircleCheck className="w-4 h-4 text-gold-400" />
      <span className="tracking-wide font-medium">{toast}</span>
    </div>
  );
}
