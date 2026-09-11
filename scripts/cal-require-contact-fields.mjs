#!/usr/bin/env node
// Marca "Email" y "Teléfono" como obligatorios en el formulario de reserva
// de TODOS los eventos de tu cuenta de Cal.com (no solo los de Miami).
//
// Es un ajuste de una sola vez — no vive en el panel de Admin porque no
// hace falta repetirlo seguido. Solo modifica esos dos campos; el resto de
// la configuración de cada evento se deja exactamente como está (se lee,
// se cambia solo lo necesario, y se manda de vuelta igual).
//
// Uso:
//   CAL_API_KEY=tu_api_key node scripts/cal-require-contact-fields.mjs --dry-run
//   CAL_API_KEY=tu_api_key node scripts/cal-require-contact-fields.mjs
//
// El modo de prueba (--dry-run) no escribe nada, solo muestra qué eventos
// cambiarían.

const API_KEY = process.env.CAL_API_KEY;
const CAL_USERNAME = process.env.CAL_USERNAME ?? "renaser";
const DRY_RUN = process.argv.includes("--dry-run");

const CAL_API_BASE = "https://api.cal.com/v2";
const EVENT_TYPES_VERSION = "2024-06-14";

if (!API_KEY) {
  console.error("Falta CAL_API_KEY. Corre: CAL_API_KEY=tu_api_key node scripts/cal-require-contact-fields.mjs");
  process.exit(1);
}

function headers(version) {
  const h = { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" };
  if (version) h["cal-api-version"] = version;
  return h;
}

async function listAllEventTypes() {
  const res = await fetch(`${CAL_API_BASE}/event-types?username=${CAL_USERNAME}`, { headers: headers() });
  if (!res.ok) throw new Error(`No se pudo listar los eventos (HTTP ${res.status})`);
  const json = await res.json();
  return json?.data?.eventTypeGroups?.flatMap((g) => g.eventTypes) ?? [];
}

async function requireContactFields(id, slug) {
  const res = await fetch(`${CAL_API_BASE}/event-types/${id}`, { headers: headers(EVENT_TYPES_VERSION) });
  if (!res.ok) {
    console.log(`✕ ${slug}: no se pudo leer (HTTP ${res.status})`);
    return;
  }
  const json = await res.json();
  const bookingFields = json?.data?.bookingFields;
  if (!Array.isArray(bookingFields)) {
    console.log(`✕ ${slug}: no tiene bookingFields, se omite`);
    return;
  }

  let changed = false;
  const updated = bookingFields.map((field) => {
    if ((field.slug === "email" || field.slug === "attendeePhoneNumber") && !field.required) {
      changed = true;
      return { ...field, required: true };
    }
    return field;
  });

  if (!changed) {
    console.log(`= ${slug}: ya tenía email y teléfono requeridos`);
    return;
  }

  if (DRY_RUN) {
    console.log(`(prueba) ${slug}: se marcarían requeridos email y/o teléfono`);
    return;
  }

  const patchRes = await fetch(`${CAL_API_BASE}/event-types/${id}`, {
    method: "PATCH",
    headers: headers(EVENT_TYPES_VERSION),
    body: JSON.stringify({ bookingFields: updated }),
  });

  if (patchRes.ok) {
    console.log(`✓ ${slug}: actualizado`);
  } else {
    console.log(`✕ ${slug}: error (HTTP ${patchRes.status}) ${await patchRes.text()}`);
  }
}

const events = await listAllEventTypes();
console.log(`Encontrados ${events.length} eventos.${DRY_RUN ? " (modo de prueba — no se escribe nada)" : ""}\n`);

for (const event of events) {
  await requireContactFields(event.id, event.slug);
}

console.log("\nListo.");
