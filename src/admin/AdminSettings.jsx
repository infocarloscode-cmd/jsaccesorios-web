import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useSettings } from "../context/SettingsContext";
import { HoursStatus } from "../components/BusinessHours";
import AdminUsers from "./AdminUsers";
import { DAY_NAMES, DEFAULT_SCHEDULE, WEEK_ORDER, isValidSchedule, nowInVenezuela } from "../utils/hours";

const inputClass =
  "rounded-lg border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400";

function horaVenezuela() {
  const { minutes } = nowInVenezuela();
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? "a.m." : "p.m."}`;
}

export default function AdminSettings() {
  const { whatsappNumber, businessHours, loading, refetch } = useSettings();
  const [numero, setNumero] = useState("");
  const [mostrarHorario, setMostrarHorario] = useState(false);
  const [horario, setHorario] = useState(DEFAULT_SCHEDULE);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (loading) return;
    setNumero(whatsappNumber);
    setMostrarHorario(!!businessHours);
    setHorario(businessHours ?? DEFAULT_SCHEDULE);
  }, [loading, whatsappNumber, businessHours]);

  const soloDigitos = numero.replace(/\D/g, "");
  const numeroValido = soloDigitos.length >= 10 && soloDigitos.length <= 15;
  const horarioValido = !mostrarHorario || isValidSchedule(horario);

  const cambiarDia = (i, campo, valor) =>
    setHorario((h) => h.map((d, j) => (j === i ? { ...d, [campo]: valor } : d)));

  const copiarLunes = () => setHorario((h) => h.map((d, j) => (j === 0 ? d : { ...h[1] })));

  const guardar = async (e) => {
    e.preventDefault();
    if (!numeroValido || !horarioValido) return;
    setGuardando(true);
    setMensaje(null);
    const { error } = await supabase.from("settings").upsert({
      id: 1,
      whatsapp_number: soloDigitos,
      business_hours: mostrarHorario ? horario : null,
      updated_at: new Date().toISOString(),
    });
    setGuardando(false);
    if (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.code === "42P01" || error.code === "PGRST205"
            ? "Falta crear la tabla de configuración en Supabase (ver supabase_setup.sql)."
            : `No se pudo guardar: ${error.message}`,
      });
      return;
    }
    await refetch();
    setMensaje({ tipo: "ok", texto: "Configuración guardada. La tienda ya usa estos datos." });
  };

  if (loading) return <p className="text-ink-soft">Cargando...</p>;

  return (
    <div className="max-w-xl flex flex-col gap-10">
    <form onSubmit={guardar} className="flex flex-col gap-6">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink w-fit">
        <ArrowLeft className="w-4 h-4" /> Volver a productos
      </Link>

      <h1 className="font-serif text-2xl text-ink">Configuración de la tienda</h1>

      <section className="flex flex-col gap-1">
        <label htmlFor="whatsapp" className="text-sm font-medium text-ink">
          Número de WhatsApp
        </label>
        <input
          id="whatsapp"
          required
          inputMode="tel"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="584121234567"
          className={inputClass}
        />
        <p className={`text-xs ${numero && !numeroValido ? "text-red-600" : "text-ink-soft"}`}>
          Con código de país y sin el 0 inicial. Ej.: 0412-123-4567 se escribe 584121234567.
        </p>
        {numeroValido && (
          <a
            href={`https://wa.me/${soloDigitos}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-700 hover:underline w-fit"
          >
            Probar este número en WhatsApp →
          </a>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink">Horario de atención</span>
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarHorario}
              onChange={(e) => setMostrarHorario(e.target.checked)}
              className="accent-gold-500"
            />
            Mostrar en la tienda
          </label>
        </div>
        <p className="text-xs text-ink-soft">
          Hora de Venezuela (UTC−4). Ahora mismo allá son las <strong>{horaVenezuela()}</strong>.
        </p>

        {mostrarHorario && (
          <>
            <div className="border border-gold-200/60 rounded-xl bg-white divide-y divide-gold-100">
              {WEEK_ORDER.map((i) => {
                const d = horario[i];
                const malo = !d.closed && d.open >= d.close;
                return (
                  <div key={i} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span className="w-24 text-sm text-ink">{DAY_NAMES[i]}</span>
                    <label className="flex items-center gap-1.5 text-xs text-ink-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!d.closed}
                        onChange={(e) => cambiarDia(i, "closed", !e.target.checked)}
                        className="accent-gold-500"
                      />
                      Abierto
                    </label>
                    {d.closed ? (
                      <span className="text-xs text-gray-400">Cerrado</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <input
                          type="time"
                          value={d.open}
                          onChange={(e) => cambiarDia(i, "open", e.target.value)}
                          className={`${inputClass} py-1`}
                          aria-label={`Abre ${DAY_NAMES[i]}`}
                        />
                        <span className="text-xs text-ink-soft">a</span>
                        <input
                          type="time"
                          value={d.close}
                          onChange={(e) => cambiarDia(i, "close", e.target.value)}
                          className={`${inputClass} py-1 ${malo ? "border-red-400" : ""}`}
                          aria-label={`Cierra ${DAY_NAMES[i]}`}
                        />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={copiarLunes}
              className="inline-flex items-center gap-1.5 text-xs text-gold-700 hover:text-gold-600 w-fit"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar el horario del lunes a martes–sábado
            </button>
            {!horarioValido && (
              <p className="text-xs text-red-600">La hora de cierre debe ser después de la de apertura.</p>
            )}
          </>
        )}

        {businessHours && (
          <p className="text-xs text-ink-soft">
            Estado guardado: <HoursStatus className="font-medium text-ink" />
          </p>
        )}
      </section>

      {mensaje && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            mensaje.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando || !numeroValido || !horarioValido}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 hover:bg-gold-500 disabled:opacity-50 transition-colors text-white font-medium px-6 py-3 text-sm w-fit"
      >
        <Check className="w-4 h-4" />
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>

    <AdminUsers />
    </div>
  );
}
