import type { Handler } from "@netlify/functions";
import { CAL_USERNAME } from "../../src/data/content";
import { getCurrentMiamiTourRange, verifyFirebaseIdToken } from "./_lib/shared";

// Solo lectura, protegida con el login del panel de Admin: consulta las
// fechas de la gira Miami configuradas hoy en Cal.com. No escribe nada.
// (La versión pública, sin login, para mostrar el aviso en el sitio, es
// public-miami-tour-status.ts.)

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
    const range = await getCurrentMiamiTourRange(apiKey, CAL_USERNAME);
    return { statusCode: 200, body: JSON.stringify(range ?? { startDate: null, endDate: null }) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido." }),
    };
  }
};
