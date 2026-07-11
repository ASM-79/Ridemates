import type { CommuteRequest } from "../models/commuteRequests.js";
import { haversineMiles } from "./geo.js";

export interface TransitSuggestion {
  plannerUrl: string;
  line: string;
  summary: string;
  estimatedDurationMin: number;
}

const VTA_TRIP_PLANNER_URL = "https://www.vta.org/go";

const AVG_BUS_SPEED_MPH = 14;
const WAIT_AND_WALK_BUFFER_MIN = 15;

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
