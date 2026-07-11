import type { CommuteRequest } from "../models/commuteRequests.js";

export interface TransitSuggestion {
  plannerUrl: string;
  line: string;
  summary: string;
  estimatedDurationMin: number;
}

const VTA_TRIP_PLANNER_URL = "https://www.vta.org/go";

const AVG_BUS_SPEED_MPH = 14;
const WAIT_AND_WALK_BUFFER_MIN = 15;

const EARTH_RADIUS_MILES = 3958.8;

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

// Real-time VTA routing requires a live trip-planning API we don't have
// access to. This produces a plausible, distance-scaled suggestion (bus vs.
// light rail, rough duration) and links out to VTA's actual trip planner
// for a precise itinerary — good enough for a "don't have a carpool match
// yet? here's your transit fallback" nudge.
export function buildTransitSuggestion(request: CommuteRequest): TransitSuggestion {
  const distanceMiles = haversineMiles(
    request.origin_lat,
    request.origin_lng,
    request.dest_lat,
    request.dest_lng
  );

  const line = distanceMiles > 8 ? "VTA Light Rail (Orange Line) + connecting bus" : "VTA Local Bus";
  const estimatedDurationMin = Math.round(
    (distanceMiles / AVG_BUS_SPEED_MPH) * 60 + WAIT_AND_WALK_BUFFER_MIN
  );

  const plannerUrl = `${VTA_TRIP_PLANNER_URL}?origin=${encodeURIComponent(
    request.origin_address
  )}&destination=${encodeURIComponent(request.dest_address)}`;

  const summary = `No carpool match yet — try ${line} from ${request.origin_address} to ${request.dest_address}. Estimated ~${estimatedDurationMin} min door-to-door, free with your VTA SmartPass. Check exact times on VTA's trip planner.`;

  return { plannerUrl, line, summary, estimatedDurationMin };
}
