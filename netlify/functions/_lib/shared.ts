import { createRemoteJWKSet, jwtVerify } from "jose";

// Compartido entre las funciones de Netlify que hablan con Cal.com — no es
// una función en sí (el prefijo "_" hace que Netlify no la trate como una).

export const CAL_API_BASE = "https://api.cal.com/v2";
export const EVENT_TYPES_VERSION = "2024-06-14";
export const SCHEDULES_VERSION = "2024-06-11";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

// Protegido con el mismo login de Firebase que usa el panel de Admin: el
// navegador manda el ID token del usuario ya logueado, y esto lo verifica
// contra las claves públicas de Google (sin necesitar ningún secreto extra).
export async function verifyFirebaseIdToken(authHeader: string | undefined, projectId: string): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length);
  try {
    await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return true;
  } catch {
    return false;
  }
}

export function calHeaders(apiKey: string, version?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (version) headers["cal-api-version"] = version;
  return headers;
}

export interface CalEventTypeSummary {
  id: number;
  slug: string;
  // Presentes en la respuesta de /event-types (listado) sin necesitar
  // ningún header de versión especial.
  periodType?: string;
  periodStartDate?: string | null;
  periodEndDate?: string | null;
}

export async function listCalEventTypes(apiKey: string, username: string): Promise<CalEventTypeSummary[]> {
  const res = await fetch(`${CAL_API_BASE}/event-types?username=${username}`, { headers: calHeaders(apiKey) });
  if (!res.ok) {
    throw new Error(`No se pudo listar los eventos de Cal.com (HTTP ${res.status})`);
  }
  const json = await res.json();
  return (
    json?.data?.eventTypeGroups?.flatMap((g: { eventTypes: CalEventTypeSummary[] }) => g.eventTypes) ?? []
  );
}
