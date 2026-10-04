// Script de un solo uso: configura la "Redirect URL" de TODOS tus tipos de
// evento en Cal.com para que, al reservar, el cliente llegue a la ficha de
// paciente. No es parte del sitio — se corre manualmente desde la terminal
// cada vez que crees nuevos eventos (ej. al agregar una terapia nueva).
//
// Uso:
//   1. En Cal.com: Settings → Developer → API Keys → crea una API key.
//   2. CAL_API_KEY="tu-api-key" node scripts/set-cal-redirect-urls.mjs
//
// Por defecto apunta a https://casarenaser.com/ficha-paciente — cambia
// REDIRECT_URL abajo si tu dominio es otro.

const API_KEY = process.env.CAL_API_KEY;
const REDIRECT_URL = process.env.REDIRECT_URL || "https://casarenaser.com/ficha-paciente";
const CAL_USERNAME = process.env.CAL_USERNAME || "renaser";
const API_VERSION = "2026-06-12";

if (!API_KEY) {
  console.error("Falta la variable de entorno CAL_API_KEY.");
  console.error('Uso: CAL_API_KEY="tu-api-key" node scripts/set-cal-redirect-urls.mjs');
  process.exit(1);
}

async function listEventTypes() {
  const res = await fetch(`https://api.cal.com/v2/event-types?username=${CAL_USERNAME}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "cal-api-version": API_VERSION,
    },
  });
  if (!res.ok) {
    throw new Error(`No se pudo listar los tipos de evento: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.data ?? [];
}

async function setRedirectUrl(eventTypeId, slug) {
  const res = await fetch(`https://api.cal.com/v2/event-types/${eventTypeId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "cal-api-version": API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ successRedirectUrl: REDIRECT_URL }),
  });

  if (!res.ok) {
    console.error(`✗ ${slug} (${eventTypeId}): ${res.status} ${await res.text()}`);
    return false;
  }
  console.log(`✓ ${slug} (${eventTypeId})`);
  return true;
}

const eventTypes = await listEventTypes();
console.log(`Encontrados ${eventTypes.length} tipos de evento. Configurando redirect a: ${REDIRECT_URL}\n`);

let ok = 0;
for (const et of eventTypes) {
  const success = await setRedirectUrl(et.id, et.slug);
  if (success) ok++;
}

console.log(`\nListo: ${ok}/${eventTypes.length} actualizados correctamente.`);
