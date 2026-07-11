import { groupRiders } from "../ai/groupRiders.js";
import { findPendingCommuteRequests, markCommuteRequestsMatched } from "../models/commuteRequests.js";
import { createMatch, type Match } from "../models/matches.js";
import { estimateCarbonSavingsKg } from "./carbon.js";
import { buildTransitSuggestion, type TransitSuggestion } from "./transit.js";
import type { CommuteRequest } from "../models/commuteRequests.js";

export interface UnmatchedRequest {
  commuteRequest: CommuteRequest;
  transitSuggestion: TransitSuggestion;
}

export interface MatchingResult {
  matches: Match[];
  unmatched: UnmatchedRequest[];
}

export async function runMatching(): Promise<MatchingResult> {
  const pendingRequests = await findPendingCommuteRequests();
  const groups = await groupRiders(pendingRequests);

  const requestsById = new Map<string, CommuteRequest>(pendingRequests.map((r) => [r.id, r]));

  const matches: Match[] = [];
  for (const group of groups) {
    const groupRequests = group.requestIds
      .map((id) => requestsById.get(id))
      .filter((r): r is CommuteRequest => r !== undefined);

    if (groupRequests.length < 2) continue;

    const carbonSavingsKg = estimateCarbonSavingsKg(groupRequests);
    const match = await createMatch({
      requestIds: group.requestIds,
      explanation: group.explanation,
      carbonSavingsKg,
    });
    matches.push(match);
  }

  const matchedRequestIds = new Set(matches.flatMap((m) => m.request_ids));
  await markCommuteRequestsMatched([...matchedRequestIds]);

  const unmatched: UnmatchedRequest[] = pendingRequests
    .filter((r) => !matchedRequestIds.has(r.id))
    .map((commuteRequest) => ({
      commuteRequest,
      transitSuggestion: buildTransitSuggestion(commuteRequest),
    }));

  return { matches, unmatched };
}
