// Horario de atención por día, siempre en hora de Venezuela.
// schedule: arreglo de 7 días (0 = domingo) con { closed, open: "HH:MM", close: "HH:MM" }.

export const TIMEZONE = "America/Caracas";
export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
// Orden en que se muestra la semana: de lunes a domingo.
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const DEFAULT_SCHEDULE = DAY_NAMES.map((_, i) => ({
  closed: i === 0,
  open: "09:00",
  close: "18:00",
}));

export function isValidSchedule(schedule) {
  return (
    Array.isArray(schedule) &&
    schedule.length === 7 &&
    schedule.every((d) => d && (d.closed || (toMinutes(d.open) < toMinutes(d.close))))
  );
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  const suf = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suf}`;
}

// Día de la semana y minutos transcurridos del día, en Caracas.
export function nowInVenezuela(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

// { open: true, text: "Abierto ahora · cierra 6:00 p.m." } o
// { open: false, text: "Cerrado · abre mañana 9:00 a.m." }
export function getStatus(schedule, date = new Date()) {
  if (!isValidSchedule(schedule)) return null;
  const { day, minutes } = nowInVenezuela(date);
  const today = schedule[day];

  if (!today.closed && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, text: `Abierto ahora · cierra ${formatTime(today.close)}` };
  }

  for (let offset = 0; offset < 7; offset++) {
    const d = (day + offset) % 7;
    const s = schedule[d];
    if (s.closed) continue;
    if (offset === 0 && minutes >= toMinutes(s.open)) continue; // ya pasó la apertura de hoy
    const cuando = offset === 0 ? "hoy" : offset === 1 ? "mañana" : `el ${DAY_NAMES[d].toLowerCase()}`;
    return { open: false, text: `Cerrado · abre ${cuando} ${formatTime(s.open)}` };
  }
  return { open: false, text: "Cerrado" };
}

// Agrupa días seguidos con el mismo horario: ["Lun – Sáb: 9:00 a.m. – 6:00 p.m.", "Dom: cerrado"]
export function summarize(schedule) {
  if (!isValidSchedule(schedule)) return [];
  const label = (d) => (d.closed ? "cerrado" : `${formatTime(d.open)} – ${formatTime(d.close)}`);
  const groups = [];
  for (const i of WEEK_ORDER) {
    const text = label(schedule[i]);
    const last = groups[groups.length - 1];
    if (last && last.text === text) last.to = i;
    else groups.push({ from: i, to: i, text });
  }
  return groups.map(({ from, to, text }) =>
    `${DAY_SHORT[from]}${from !== to ? ` – ${DAY_SHORT[to]}` : ""}: ${text}`
  );
}
