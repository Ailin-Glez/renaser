import type { Handler } from "@netlify/functions";
import { CAL_USERNAME } from "../../src/data/content";
import { getCurrentMiamiTourRange } from "./_lib/shared";

// Solo lectura, SIN login — cualquier visitante del sitio puede consultar
// esto (es la misma información que ya es pública en las páginas de reserva
// de Cal.com, solo la mostramos también acá para explicar por qué Las Vegas
// no tiene citas disponibles en esas fechas). No escribe nada.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falta CAL_API_KEY en Netlify." }) };
  }

  try {
    const range = await getCurrentMiamiTourRange(apiKey, CAL_USERNAME);
    return {
      statusCode: 200,
      headers: { "Cache-Control": "public, max-age=300" },
      body: JSON.stringify(range ?? { startDate: null, endDate: null }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido." }),
    };
  }
};
