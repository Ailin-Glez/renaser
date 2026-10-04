// Autocompletar de direcciones usando Nominatim (OpenStreetMap) — API pública
// y gratuita, sin API key ni cuenta. Su política de uso pide no pasar de ~1
// petición por segundo, de sobra para un formulario de pacientes con tráfico
// bajo. Si en algún momento se necesita algo más rápido/pulido, se puede
// cambiar a Mapbox Geocoding sin tocar el resto del formulario.
export interface AddressSuggestion {
  displayName: string;
  streetAddress: string;
  city: string;
  stateEnName: string;
}

interface NominatimResult {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
  };
}

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&limit=5&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const results: NominatimResult[] = await res.json();

  return results.map((r) => {
    const addr = r.address ?? {};
    return {
      displayName: r.display_name,
      streetAddress: [addr.house_number, addr.road].filter(Boolean).join(" "),
      city: addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? "",
      stateEnName: addr.state ?? "",
    };
  });
}
