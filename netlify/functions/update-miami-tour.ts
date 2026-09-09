import type { Handler } from "@netlify/functions";
import { CAL_USERNAME, THERAPIES, calSlugFor, calSlugForAdmin } from "../../src/data/content";
import {
  CAL_API_BASE,
  EVENT_TYPES_VERSION,
  SCHEDULES_VERSION,
  calHeaders,
  listCalEventTypes,
  verifyFirebaseIdToken,
} from "./_lib/shared";

// Automatiza lo que antes se hacía a mano, evento por evento en Cal.com:
// 1) Abre las fechas de la gira en todos los eventos "-miami"
//    (bookingWindow tipo "range").
// 2) Bloquea esos mismos días en el horario de Las Vegas (los terapeutas
//    están físicamente en Miami esos días) — el rango completo, sin
//    excepciones, aunque tengan un día libre en Miami.
// 3) Opcionalmente, aplica excepciones dentro del horario de Miami: días
//    libres completos o con horario reducido (ej. solo la mañana).
//
// Protegido con el mismo login de Firebase que usa el panel de Admin: el
// navegador manda el ID token del usuario ya logueado, y esta función lo
// verifica contra las claves públicas de Google (sin necesitar ningún
// secreto extra ni contraseña separada).
//
// Requiere variables de entorno en Netlify (nunca en el repo):
//   CAL_API_KEY               — API key de Cal.com (Settings → Developer)
//   CAL_LAS_VEGAS_SCHEDULE_ID — id numérico del horario "Las Vegas" en Cal.com
//   CAL_MIAMI_SCHEDULE_ID     — id numérico del horario "Miami" en Cal.com
//   VITE_FIREBASE_PROJECT_ID  — el mismo que ya usa el sitio (Firebase)

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

function isoToHHMM(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function isoToDate(iso: string): string {
  return iso.slice(0, 10);
}

export function datesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cur = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  while (cur.getTime() <= end.getTime()) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

interface CalWorkingHour {
  days: number[];
  startTime: number;
  endTime: number;
}

interface CalDateOverride {
  ranges: { start: string; end: string }[];
}

interface CalSchedule {
  id: number;
  name: string;
  timeZone: string;
  workingHours: CalWorkingHour[];
  dateOverrides: CalDateOverride[];
}

export async function updateMiamiEventDates(
  apiKey: string,
  startDate: string,
  endDate: string,
  dryRun: boolean
) {
  const allEventTypes = await listCalEventTypes(apiKey, CAL_USERNAME);

  // Todas las terapias que se ofrecen en Miami (incluidas las grupales —
  // esto es sobre disponibilidad de fechas, no sobre precios/depósitos),
  // más su copia "-manual" (la que usa Reservar cita manualmente en el
  // admin cuando la terapia cobra depósito automático).
  const miamiSlugs = new Set<string>();
  for (const t of THERAPIES) {
    if (!t.pricing.miami) continue;
    miamiSlugs.add(calSlugFor(t.id, "miami"));
    miamiSlugs.add(calSlugForAdmin(t, "miami"));
  }

  const targets = allEventTypes.filter((e) => miamiSlugs.has(e.slug));
  if (targets.length === 0) {
    throw new Error("No se encontró ningún evento de Miami en Cal.com para actualizar.");
  }

  const results: { slug: string; ok: boolean; error?: string; dryRun?: boolean }[] = [];

  for (const eventType of targets) {
    if (dryRun) {
      results.push({ slug: eventType.slug, ok: true, dryRun: true });
      continue;
    }
    const res = await fetch(`${CAL_API_BASE}/event-types/${eventType.id}`, {
      method: "PATCH",
      headers: calHeaders(apiKey, EVENT_TYPES_VERSION),
      body: JSON.stringify({
        bookingWindow: { type: "range", value: [startDate, endDate] },
      }),
    });
    if (res.ok) {
      results.push({ slug: eventType.slug, ok: true });
    } else {
      results.push({ slug: eventType.slug, ok: false, error: await res.text() });
    }
  }

  return results;
}

export interface DateOverrideInput {
  date: string; // YYYY-MM-DD
  startTime: string; // "HH:MM" — "00:00"-"00:00" = día completo bloqueado
  endTime: string;
}

// Aplica overrides de fecha a un horario de Cal.com, preservando los que ya
// existan (el PATCH de Cal.com reemplaza la lista completa, así que primero
// leemos los actuales y les sumamos/reemplazamos solo las fechas nuevas).
export async function applyScheduleOverrides(
  apiKey: string,
  scheduleId: string,
  newOverrides: DateOverrideInput[],
  dryRun: boolean
) {
  const res = await fetch(`${CAL_API_BASE}/schedules/${scheduleId}`, { headers: calHeaders(apiKey) });
  if (!res.ok) {
    throw new Error(`No se pudo leer el horario ${scheduleId} (HTTP ${res.status})`);
  }
  const json = await res.json();
  const schedule: CalSchedule = json.data;

  // Salvaguarda: si algún día ya tiene más de un rango horario (ej. mañana
  // y tarde separadas por un corte), no seguimos — este script asume un
  // solo rango por día porque es lo único que existe hoy en los datos
  // reales, y preferimos fallar en vez de arriesgarnos a perder esa
  // configuración al reconstruir la lista completa.
  const complexOverride = schedule.dateOverrides.find((o) => o.ranges.length > 1);
  if (complexOverride) {
    throw new Error(
      `El horario "${schedule.name}" tiene un día con más de un rango horario — no se modificó nada, revísalo manualmente en Cal.com.`
    );
  }

  const availability = schedule.workingHours.map((wh) => ({
    days: wh.days.map((d) => DAY_NAMES[d]),
    startTime: minutesToHHMM(wh.startTime),
    endTime: minutesToHHMM(wh.endTime),
  }));

  const overridesByDate = new Map<string, DateOverrideInput>();
  for (const o of schedule.dateOverrides) {
    const range = o.ranges[0];
    const date = isoToDate(range.start);
    overridesByDate.set(date, { date, startTime: isoToHHMM(range.start), endTime: isoToHHMM(range.end) });
  }
  for (const override of newOverrides) {
    overridesByDate.set(override.date, override);
  }

  if (dryRun) {
    return {
      scheduleName: schedule.name,
      changedDays: newOverrides.length,
      totalOverrides: overridesByDate.size,
      dryRun: true,
    };
  }

  const patchRes = await fetch(`${CAL_API_BASE}/schedules/${scheduleId}`, {
    method: "PATCH",
    headers: calHeaders(apiKey, SCHEDULES_VERSION),
    body: JSON.stringify({
      name: schedule.name,
      timeZone: schedule.timeZone,
      availability,
      overrides: Array.from(overridesByDate.values()),
    }),
  });

  if (!patchRes.ok) {
    throw new Error(`No se pudo actualizar el horario "${schedule.name}": ${await patchRes.text()}`);
  }

  return { scheduleName: schedule.name, changedDays: newOverrides.length, totalOverrides: overridesByDate.size };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta VITE_FIREBASE_PROJECT_ID en Netlify." }) };
  }
  const authorized = await verifyFirebaseIdToken(event.headers.authorization, projectId);
  if (!authorized) {
    return { statusCode: 401, body: JSON.stringify({ error: "No autorizado. Vuelve a iniciar sesión en el panel." }) };
  }

  const apiKey = process.env.CAL_API_KEY;
  const lasVegasScheduleId = process.env.CAL_LAS_VEGAS_SCHEDULE_ID;
  const miamiScheduleId = process.env.CAL_MIAMI_SCHEDULE_ID;
  if (!apiKey || !lasVegasScheduleId || !miamiScheduleId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "Faltan variables de entorno en Netlify (CAL_API_KEY / CAL_LAS_VEGAS_SCHEDULE_ID / CAL_MIAMI_SCHEDULE_ID).",
      }),
    };
  }

  let payload: { startDate?: string; endDate?: string; exceptions?: DateOverrideInput[]; dryRun?: boolean };
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Body inválido." }) };
  }

  const { startDate, endDate, exceptions = [], dryRun = false } = payload;
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const timeRe = /^\d{2}:\d{2}$/;

  if (!startDate || !endDate || !dateRe.test(startDate) || !dateRe.test(endDate) || startDate >= endDate) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Fechas inválidas. Usa formato YYYY-MM-DD, con el último día posterior al primero.",
      }),
    };
  }

  for (const exc of exceptions) {
    if (!dateRe.test(exc.date) || !timeRe.test(exc.startTime) || !timeRe.test(exc.endTime)) {
      return { statusCode: 400, body: JSON.stringify({ error: `Excepción inválida: ${JSON.stringify(exc)}` }) };
    }
    if (exc.date < startDate || exc.date > endDate) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `La excepción del ${exc.date} está fuera del rango de la gira.` }),
      };
    }
  }

  try {
    const events = await updateMiamiEventDates(apiKey, startDate, endDate, dryRun);

    const lasVegasOverrides = datesInRange(startDate, endDate).map((date) => ({
      date,
      startTime: "00:00",
      endTime: "00:00",
    }));
    const lasVegas = await applyScheduleOverrides(apiKey, lasVegasScheduleId, lasVegasOverrides, dryRun);

    const miami =
      exceptions.length > 0 ? await applyScheduleOverrides(apiKey, miamiScheduleId, exceptions, dryRun) : null;

    return { statusCode: 200, body: JSON.stringify({ ok: true, dryRun, events, lasVegas, miami }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido." }),
    };
  }
};
