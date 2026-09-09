// Verifica, contra el Cal.com real (sin mocks), que cada evento de reserva
// tiene configurada la dirección correcta y el depósito correcto según lo
// que muestra la web — para cada terapia individual (no grupal) y ciudad.
//
// Se generan los casos directamente desde THERAPIES/LOCATIONS de content.ts,
// así que si agregas una terapia o cambias un precio, los tests se ajustan
// solos sin tocar este archivo.
//
// Requiere conexión a internet real (golpea https://cal.com). Si un evento
// todavía no existe en Cal.com, o le falta el pago/dirección, el test
// correspondiente falla — esa es justamente la señal que buscamos.

import { describe, expect, it } from "vitest";
import { CAL_USERNAME, LOCATIONS, THERAPIES, calSlugFor, calSlugForAdmin, type LocationKey } from "../src/data/content";

const TEST_TIMEOUT = 20_000;

// Direcciones físicas reales de cada sede — deben coincidir exactamente con
// lo cargado en la ubicación ("Location") de cada evento en Cal.com.
const ADDRESSES: Record<LocationKey, string> = {
  "las-vegas": "7105 Trading Post Ln, Las Vegas, NV 89128, USA",
  miami: "10021 SW 84th Ave, Miami, FL, USA",
};

// Las terapias grupales se cobran "por persona" (Cal.com no soporta cobrar
// por asistente automáticamente), así que ahí no hay un depósito fijo que
// verificar — se excluyen del set de pruebas, tal como se pidió.
function isGroupPricing(price: string): boolean {
  return price.includes("por persona");
}

function dollarsToCents(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return Number(digits) * 100;
}

interface CalEventConfig {
  status: number;
  address: string | null;
  depositCents: number | null;
  currency: string | null;
}

async function fetchCalEventConfig(slug: string): Promise<CalEventConfig> {
  const res = await fetch(`https://cal.com/${CAL_USERNAME}/${slug}`);
  const html = await res.text();

  // El HTML trae el JSON de la página escapado (comillas precedidas de \),
  // por eso se busca ese patrón literal en vez de parsear JSON normal.
  const addressMatch = html.match(/\\"type\\":\\"inPerson\\",\\"address\\":\\"([^"\\]*)\\"/);

  let depositCents: number | null = null;
  let currency: string | null = null;
  const stripeIdx = html.indexOf('\\"stripe\\":{\\"enabled\\":true');
  if (stripeIdx !== -1) {
    const window = html.slice(stripeIdx, stripeIdx + 300);
    const priceMatch = window.match(/\\"price\\":(\d+)/);
    const currencyMatch = window.match(/\\"currency\\":\\"([a-z]+)\\"/);
    depositCents = priceMatch ? Number(priceMatch[1]) : null;
    currency = currencyMatch ? currencyMatch[1] : null;
  }

  return { status: res.status, address: addressMatch?.[1] ?? null, depositCents, currency };
}

interface TestCase {
  therapyName: string;
  therapyId: string;
  location: LocationKey;
  locationName: string;
  slug: string;
  expectedAddress: string;
  expectedDepositCents: number | null; // null = no debería cobrar depósito automático
}

const cases: TestCase[] = [];
for (const location of LOCATIONS) {
  for (const therapy of THERAPIES) {
    const pricing = therapy.pricing[location.key];
    if (!pricing) continue; // esta terapia no se ofrece en esta ciudad
    if (isGroupPricing(pricing.price)) continue; // excluidas: son grupales

    cases.push({
      therapyName: therapy.name,
      therapyId: therapy.id,
      location: location.key,
      locationName: location.name,
      slug: calSlugFor(therapy.id, location.key),
      expectedAddress: ADDRESSES[location.key],
      expectedDepositCents: pricing.depositPrice ? dollarsToCents(pricing.depositPrice) : null,
    });
  }
}

describe("Cal.com: dirección y depósito por terapia (excluye grupales)", () => {
  it("hay al menos un caso de prueba generado desde content.ts", () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  for (const c of cases) {
    it(
      `${c.therapyName} · ${c.locationName} (cal.com/${CAL_USERNAME}/${c.slug})`,
      async () => {
        const config = await fetchCalEventConfig(c.slug);

        expect(config.status, `el evento "${c.slug}" debería existir en Cal.com (HTTP 200)`).toBe(200);

        expect(config.address, `dirección configurada para "${c.slug}"`).toBe(c.expectedAddress);

        if (c.expectedDepositCents !== null) {
          expect(
            config.depositCents,
            `"${c.slug}" debería cobrar un depósito de $${(c.expectedDepositCents / 100).toFixed(2)} al reservar (opción de pago vía Stripe)`
          ).toBe(c.expectedDepositCents);
          expect(config.currency, `moneda del depósito en "${c.slug}"`).toBe("usd");
        } else {
          expect(
            config.depositCents,
            `"${c.slug}" es de precio a cotizar/depósito manual — no debería tener un cobro automático configurado`
          ).toBeNull();
        }
      },
      TEST_TIMEOUT
    );
  }
});

// Duplicados "-manual" para el panel de admin: el cliente paga aparte
// (Zelle/efectivo), así que estos eventos deben existir pero SIN pago
// automático configurado en Cal.com — sin importar el depósito que tenga
// la versión pública. Solo aplica a terapias con cobro automático; las de
// depósito manual (grupales, Espacio en Armonía) reutilizan el evento
// normal y ya quedan cubiertas por el describe de arriba.
const manualCases = cases
  .filter((c) => c.expectedDepositCents !== null)
  .map((c) => {
    const therapy = THERAPIES.find((t) => t.id === c.therapyId)!;
    return {
      ...c,
      manualSlug: calSlugForAdmin(therapy, c.location),
    };
  });

describe("Cal.com: duplicados -manual del admin (sin cobro automático)", () => {
  it("hay al menos un caso -manual esperado (terapias con cobro automático)", () => {
    expect(manualCases.length).toBeGreaterThan(0);
  });

  for (const c of manualCases) {
    it(
      `${c.therapyName} · ${c.locationName} (cal.com/${CAL_USERNAME}/${c.manualSlug})`,
      async () => {
        expect(c.manualSlug, "el slug manual debe llevar el sufijo -manual").toBe(`${c.slug}-manual`);

        const config = await fetchCalEventConfig(c.manualSlug);

        expect(config.status, `el evento "${c.manualSlug}" debería existir en Cal.com (HTTP 200)`).toBe(200);

        expect(
          config.depositCents,
          `"${c.manualSlug}" es para reservas manuales del admin — no debe tener pago automático configurado`
        ).toBeNull();
      },
      TEST_TIMEOUT
    );
  }
});
