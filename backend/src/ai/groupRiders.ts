import { chatCompletion } from "./gradient.js";
import type { CommuteRequest } from "../models/commuteRequests.js";

export interface RiderGroup {
  requestIds: string[];
  explanation: string;
}

const SYSTEM_PROMPT = `You are a carpool matching assistant for De Anza College students.
You will be given a list of pending commute requests, each with an origin, destination,
departure time, and a flexibility window in minutes (how many minutes early/late the rider
can leave). Group riders into shared rides based on:
- Route overlap (similar origin and destination, or origins/destinations along the same path)
- Time-window compatibility (departure times fall within each other's flexibility windows)

Rules:
- Only group requests that are a genuinely good match. A rider with no good match should be
  left out of the "groups" array entirely (do not invent forced matches).
- A group must contain at least 2 request IDs.
- A request ID must appear in at most one group.
- Prefer groups of 2-4 riders over pairing everyone into one giant group.
- For each group, write a short, plain-language explanation (1-2 sentences) of why these
  riders were grouped together (e.g. shared route, compatible timing).

Respond with ONLY a JSON object in this exact shape, no other text:
{"groups": [{"requestIds": ["<uuid>", "<uuid>"], "explanation": "<text>"}]}`;

function buildUserPrompt(requests: CommuteRequest[]): string {
  const lines = requests.map((r) => {
    return `- id: ${r.id}
  origin: ${r.origin_address} (${r.origin_lat}, ${r.origin_lng})
  destination: ${r.dest_address} (${r.dest_lat}, ${r.dest_lng})
  departure_time: ${r.departure_time}
  flexibility_minutes: ${r.flexibility_minutes}`;
  });

  return `Here are the pending commute requests:\n\n${lines.join("\n\n")}`;
}

export async function groupRiders(requests: CommuteRequest[]): Promise<RiderGroup[]> {
  if (requests.length < 2) {
    return [];
  }

  const content = await chatCompletion([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(requests) },
  ]);

  const parsed = JSON.parse(content) as { groups?: RiderGroup[] };
  const groups = parsed.groups ?? [];

  const validIds = new Set(requests.map((r) => r.id));
  const seen = new Set<string>();

  return groups.filter((group) => {
    if (!Array.isArray(group.requestIds) || group.requestIds.length < 2) return false;
    for (const id of group.requestIds) {
      if (!validIds.has(id) || seen.has(id)) return false;
    }
    group.requestIds.forEach((id) => seen.add(id));
    return true;
  });
}
