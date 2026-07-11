export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export class GeocodeError extends Error {}

// Nominatim usage policy requires a descriptive User-Agent and caps
// requests at 1/sec — fine for our low-volume, server-side use.
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "DACarpool/0.1 (De Anza College carpool matching app)",
    },
  });

  if (!res.ok) {
    throw new GeocodeError(`Nominatim request failed: ${res.status}`);
  }

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (results.length === 0) {
    throw new GeocodeError(`No geocoding match for address: "${address}"`);
  }

  const [result] = results;
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    displayName: result.display_name,
  };
}
