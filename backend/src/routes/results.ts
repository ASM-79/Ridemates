import { Router } from "express";
import {
  findCommuteRequestById,
  findCommuteRequestsByIdsWithRider,
} from "../models/commuteRequests.js";
import { findMatchByRequestId } from "../models/matches.js";
import { buildTransitSuggestion } from "../services/transit.js";

export const resultsRouter = Router();

resultsRouter.get("/commute-requests/:id/result", async (req, res) => {
  const { id } = req.params;

  const commuteRequest = await findCommuteRequestById(id);
  if (!commuteRequest) {
    return res.status(404).json({ error: "Commute request not found" });
  }

  if (commuteRequest.status === "matched") {
    const match = await findMatchByRequestId(id);
    if (match) {
      const riders = await findCommuteRequestsByIdsWithRider(match.request_ids);
      return res.json({
        status: "matched",
        match: {
          id: match.id,
          explanation: match.explanation,
          carbonSavingsKg: match.carbon_savings_kg,
          riders: riders.map((r) => ({
            requestId: r.id,
            name: r.rider_name,
            originAddress: r.origin_address,
            originLat: r.origin_lat,
            originLng: r.origin_lng,
            destAddress: r.dest_address,
            destLat: r.dest_lat,
            destLng: r.dest_lng,
          })),
        },
      });
    }
  }

  return res.json({
    status: "unmatched",
    transitSuggestion: buildTransitSuggestion(commuteRequest),
    commuteRequest: {
      originAddress: commuteRequest.origin_address,
      originLat: commuteRequest.origin_lat,
      originLng: commuteRequest.origin_lng,
      destAddress: commuteRequest.dest_address,
      destLat: commuteRequest.dest_lat,
      destLng: commuteRequest.dest_lng,
    },
  });
});
