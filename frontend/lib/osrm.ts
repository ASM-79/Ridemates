// OSRM's free public demo routing API — same OpenStreetMap ecosystem as the
// geocoding (Nominatim) and tiles already in use. No API key, but it's a
// shared demo server: fine for dev/low-volume use, not a production SLA.
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

export interface LatLng {
  lat: number;
  lng: number;
}

interface OsrmResponse {
  code: string;
  routes?: { geometry: { coordinates: [number, number][] } }[];
}

// Returns the road-following path as [lat, lng] pairs, or null if OSRM
// can't produce a route (network failure, no road path found, etc.) so
// callers can fall back to a straight line.
export async function getDrivingRoute(points: LatLng[]): Promise<[number, number][] | null> {
  if (points.length < 2) return null;

  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as OsrmResponse;
    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}
