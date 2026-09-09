// Verifica la automatización de la gira Miami (netlify/functions/update-miami-tour.ts)
// contra Cal.com real — sin mocks, y sin escribir nunca sobre las fechas
// reales de la gira en curso. Dos partes:
//
// 1) Lógica de la función en modo de prueba (dryRun: true): confirma que
//    detecta TODOS los eventos "-miami" y sus copias "-manual" del admin,
//    y que calcula el bloqueo completo del rango para Las Vegas. No escribe
//    nada — usa fechas ficticias muy lejanas (2099) que nunca chocan con
//    una gira real.
// 2) Verificación en vivo, de solo lectura: consulta la gira que esté
//    configurada AHORA MISMO en Cal.com y comprueba, con el endpoint
//    público de horarios disponibles, que Las Vegas no tiene huecos
//    reservables esos días y que Miami sí los tiene.
//
// Requiere CAL_API_KEY (y para la parte 1, además CAL_LAS_VEGAS_SCHEDULE_ID
// y CAL_MIAMI_SCHEDULE_ID) como variables de entorno locales — si faltan,
// estas pruebas se omiten en vez de fallar.

import { describe, expect, it } from "vitest";
import { CAL_USERNAME, THERAPIES, calSlugFor, calSlugForAdmin } from "../src/data/content";
import { applyScheduleOverrides, datesInRange, updateMiamiEventDates } from "../netlify/functions/update-miami-tour";
import { calHeaders, listCalEventTypes } from "../netlify/functions/_lib/shared";

const TEST_TIMEOUT = 20_000;

const apiKey = process.env.CAL_API_KEY;
const lasVegasScheduleId = process.env.CAL_LAS_VEGAS_SCHEDULE_ID;
const miamiScheduleId = process.env.CAL_MIAMI_SCHEDULE_ID;

// Rango ficticio, muy en el futuro, solo para probar la LÓGICA en modo de
// prueba — nunca se manda un PATCH real, así que da igual que no exista
// ninguna gira ahí.
const FAKE_RANGE = { startDate: "2099-06-01", endDate: "2099-06-03" };

describe.skipIf(!apiKey || !lasVegasScheduleId || !miamiScheduleId)(
  "update-miami-tour: lógica en modo de prueba (no escribe nada)",
  () => {
    it(
      "detecta todos los eventos -miami, incluidos los duplicados -manual del admin",
      async () => {
        const expectedSlugs = new Set<string>();
        for (const t of THERAPIES) {
          if (!t.pricing.miami) continue;
          expectedSlugs.add(calSlugFor(t.id, "miami"));
          expectedSlugs.add(calSlugForAdmin(t, "miami"));
        }

        const results = await updateMiamiEventDates(apiKey!, FAKE_RANGE.startDate, FAKE_RANGE.endDate, true);
        const foundSlugs = new Set(results.map((r) => r.slug));

        for (const slug of expectedSlugs) {
          expect(foundSlugs.has(slug), `falta el evento "${slug}" en Cal.com`).toBe(true);
        }
        expect(results.every((r) => r.ok)).toBe(true);
        expect(results.every((r) => r.dryRun)).toBe(true);
      },
      TEST_TIMEOUT
    );

    it(
      "calcula el bloqueo del rango completo para el horario de Las Vegas",
      async () => {
        const range = datesInRange(FAKE_RANGE.startDate, FAKE_RANGE.endDate);
        const overrides = range.map((date) => ({ date, startTime: "00:00", endTime: "00:00" }));

        const result = await applyScheduleOverrides(apiKey!, lasVegasScheduleId!, overrides, true);

        expect(result.changedDays).toBe(range.length);
        expect(result.dryRun).toBe(true);
      },
      TEST_TIMEOUT
    );
  }
);

async function getCurrentMiamiTourRange(): Promise<{ startDate: string; endDate: string } | null> {
  const firstMiamiTherapy = THERAPIES.find((t) => t.pricing.miami);
  if (!firstMiamiTherapy) return null;
  const slug = calSlugFor(firstMiamiTherapy.id, "miami");

  const allEventTypes = await listCalEventTypes(apiKey!, CAL_USERNAME);
  const target = allEventTypes.find((e) => e.slug === slug);
  if (!target) return null;

  const res = await fetch(`https://api.cal.com/v2/event-types/${target.id}`, { headers: calHeaders(apiKey!) });
  if (!res.ok) return null;
  const json = await res.json();
  const bookingWindow = json?.data?.bookingWindow;
  if (bookingWindow?.type === "range" && Array.isArray(bookingWindow.value)) {
    return { startDate: bookingWindow.value[0], endDate: bookingWindow.value[1] };
  }
  return null;
}

// Endpoint público de Cal.com (sin autenticación) que devuelve los horarios
// reservables de un evento en un rango de fechas. Un día bloqueado devuelve
// un arreglo vacío para esa fecha.
async function fetchAvailableSlots(slug: string, startDate: string, endDate: string): Promise<Record<string, unknown[]>> {
  const url =
    `https://api.cal.com/v2/slots/available?eventTypeSlug=${slug}&usernameList[]=${CAL_USERNAME}` +
    `&startTime=${startDate}T00:00:00.000Z&endTime=${endDate}T00:00:00.000Z`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo consultar horarios de "${slug}" (HTTP ${res.status})`);
  const json = await res.json();
  return json?.data?.slots ?? {};
}

describe.skipIf(!apiKey)("Cal.com: verificación en vivo de la gira configurada ahora mismo (solo lectura)", () => {
  it(
    "Las Vegas no tiene horarios disponibles durante la gira Miami actual",
    async () => {
      const tour = await getCurrentMiamiTourRange();
      if (!tour) {
        console.warn("No hay ninguna gira con fechas configuradas — se omite esta verificación.");
        return;
      }

      const slots = await fetchAvailableSlots("lnt-reconexion", tour.startDate, tour.endDate);
      const totalSlots = Object.values(slots).flat().length;

      expect(
        totalSlots,
        `Las Vegas tiene ${totalSlots} horario(s) disponible(s) durante la gira (${tour.startDate} a ${tour.endDate}) — debería estar bloqueado`
      ).toBe(0);
    },
    TEST_TIMEOUT
  );

  it(
    "Miami sí tiene horarios disponibles durante su propia gira actual",
    async () => {
      const tour = await getCurrentMiamiTourRange();
      if (!tour) {
        console.warn("No hay ninguna gira con fechas configuradas — se omite esta verificación.");
        return;
      }

      const slots = await fetchAvailableSlots("lnt-reconexion-miami", tour.startDate, tour.endDate);
      const totalSlots = Object.values(slots).flat().length;

      expect(
        totalSlots,
        `Miami no tiene ningún horario disponible durante su propia gira (${tour.startDate} a ${tour.endDate})`
      ).toBeGreaterThan(0);
    },
    TEST_TIMEOUT
  );
});
