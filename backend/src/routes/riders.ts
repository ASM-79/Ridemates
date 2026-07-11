import { Router } from "express";
import { findUserByEmail } from "../models/users.js";
import {
  findCommuteRequestsByUserId,
  findCommuteRequestsByIdsWithRider,
} from "../models/commuteRequests.js";
import { findMatchByRequestId } from "../models/matches.js";
import { buildTransitSuggestion } from "../services/transit.js";

export const ridersRouter = Router();

ridersRouter.get("/riders/:email/dashboard", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "No rider found for that email" });
  }

  const commuteRequests = await findCommuteRequestsByUserId(user.id);

  const requests = await Promise.all(
    commuteRequests.map(async (commuteRequest) => {
      if (commuteRequest.status === "matched") {
        const match = await findMatchByRequestId(commuteRequest.id);
        if (match) {
          const riders = await findCommuteRequestsByIdsWithRider(match.request_ids);
          return {
            commuteRequest,
            status: "matched" as const,
            match: {
              id: match.id,
              explanation: match.explanation,
              carbonSavingsKg: match.carbon_savings_kg,
              riders: riders.map((r) => ({
                requestId: r.id,
                name: r.rider_name,
                originAddress: r.origin_address,
              })),
            },
          };
        }
      }

      return {
        commuteRequest,
        status: "pending" as const,
        transitSuggestion: buildTransitSuggestion(commuteRequest),
      };
    })
  );

  res.json({ user, requests });
});
