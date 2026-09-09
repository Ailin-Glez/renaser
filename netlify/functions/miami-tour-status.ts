import type { Handler } from "@netlify/functions";
import { CAL_USERNAME, THERAPIES, calSlugFor, calSlugForAdmin } from "../../src/data/content";
import { listCalEventTypes, verifyFirebaseIdToken } from "./_lib/shared";

// Solo lectura: consulta las fechas de la gira Miami configuradas hoy en
// Cal.com, leyendo periodType/periodStartDate/periodEndDate directo del
// listado de eventos (ya vienen ahí, sin llamadas extra por evento). Revisa
// TODOS los eventos "-miami" (y sus copias "-manual") hasta encontrar el
// primero con un rango configurado — no basta con mirar uno solo, porque no
// siempre todos se configuran a la vez. No escribe nada.

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

    const miamiSlugs = new Set<string>();
    for (const t of THERAPIES) {
      if (!t.pricing.miami) continue;
      miamiSlugs.add(calSlugFor(t.id, "miami"));
      miamiSlugs.add(calSlugForAdmin(t, "miami"));
    }

    const target = allEventTypes.find(
      (e) =>
        miamiSlugs.has(e.slug) &&
        e.periodType === "RANGE" &&
        typeof e.periodStartDate === "string" &&
        typeof e.periodEndDate === "string"
    );

    if (!target || !target.periodStartDate || !target.periodEndDate) {
      return { statusCode: 200, body: JSON.stringify({ startDate: null, endDate: null }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        startDate: target.periodStartDate.slice(0, 10),
        endDate: target.periodEndDate.slice(0, 10),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido." }),
    };
  }
};
