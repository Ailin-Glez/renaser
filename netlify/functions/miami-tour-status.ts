import type { Handler } from "@netlify/functions";
import { CAL_USERNAME, THERAPIES, calSlugFor } from "../../src/data/content";
import { CAL_API_BASE, calHeaders, listCalEventTypes, verifyFirebaseIdToken } from "./_lib/shared";

// Solo lectura: consulta las fechas de la gira Miami configuradas hoy en
// Cal.com (el bookingWindow de un evento "-miami" cualquiera, ya que la
// herramienta de Admin los mantiene todos sincronizados). No escribe nada.

interface BookingWindow {
  type: string;
  value?: [string, string] | number;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
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
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta CAL_API_KEY en Netlify." }) };
  }

  try {
    const allEventTypes = await listCalEventTypes(apiKey, CAL_USERNAME);

    const firstMiamiSlug = THERAPIES.find((t) => t.pricing.miami)
      ? calSlugFor(THERAPIES.find((t) => t.pricing.miami)!.id, "miami")
      : null;
    const target = firstMiamiSlug ? allEventTypes.find((e) => e.slug === firstMiamiSlug) : null;

    if (!target) {
      return { statusCode: 200, body: JSON.stringify({ startDate: null, endDate: null }) };
    }

    const res = await fetch(`${CAL_API_BASE}/event-types/${target.id}`, { headers: calHeaders(apiKey) });
    if (!res.ok) {
      throw new Error(`No se pudo leer el evento "${firstMiamiSlug}" (HTTP ${res.status})`);
    }
    const json = await res.json();
    const bookingWindow: BookingWindow | undefined = json?.data?.bookingWindow;

    if (bookingWindow?.type === "range" && Array.isArray(bookingWindow.value)) {
      const [startDate, endDate] = bookingWindow.value;
      return { statusCode: 200, body: JSON.stringify({ startDate, endDate }) };
    }

    return { statusCode: 200, body: JSON.stringify({ startDate: null, endDate: null }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido." }),
    };
  }
};
