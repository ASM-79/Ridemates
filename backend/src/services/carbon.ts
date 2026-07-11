import type { CommuteRequest } from "../models/commuteRequests.js";

const EARTH_RADIUS_MILES = 3958.8;
const KG_CO2_PER_SOLO_MILE = 0.404;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

// Estimates CO2 saved by a carpool group vs. everyone driving solo.
// Approximation: each rider's trip distance is the straight-line distance
// from their origin to their destination. If N riders share a ride, one
// still drives, so N-1 solo trips are avoided. We use the average trip
// distance across the group as the per-avoided-trip distance.
export function estimateCarbonSavingsKg(requests: CommuteRequest[]): number {
  if (requests.length < 2) return 0;

  const distances = requests.map((r) =>
    haversineMiles(r.origin_lat, r.origin_lng, r.dest_lat, r.dest_lng)
  );
  const avgDistanceMiles = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const tripsAvoided = requests.length - 1;

  return Math.round(avgDistanceMiles * tripsAvoided * KG_CO2_PER_SOLO_MILE * 100) / 100;
}
