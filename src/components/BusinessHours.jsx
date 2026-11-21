import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { getStatus, summarize } from "../utils/hours";

// Recalcula cada minuto para que "Abierto/Cerrado" cambie sin recargar la página.
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function HoursStatus({ className = "" }) {
  const { businessHours } = useSettings();
  const now = useNow();
  const status = getStatus(businessHours, now);
  if (!status) return null;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${status.open ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
      />
      {status.text}
    </span>
  );
}

export default function BusinessHours() {
  const { businessHours } = useSettings();
  const lineas = summarize(businessHours);
  if (lineas.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 bg-gold-50 border border-gold-200 rounded-2xl px-5 py-4 mb-8">
      <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-gold-700">
        <Clock className="w-3.5 h-3.5" /> Horario de atención
      </span>
      <HoursStatus className="text-xs font-semibold text-ink" />
      <ul className="text-xs text-gray-600 font-light space-y-0.5">
        {lineas.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <span className="text-[10px] text-gray-400">Hora de Venezuela</span>
    </div>
  );
}
