import { Router } from "express";
import { findCommuteRequestById } from "../models/commuteRequests.js";
import { findMatchByRequestId } from "../models/matches.js";
import { upsertSelection } from "../models/rideSelections.js";

export const rideSelectionsRouter = Router();

interface SelectDriverBody {
  selectorRequestId?: string;
  selectedRequestId?: string;
}

rideSelectionsRouter.post("/matches/:matchId/select-driver", async (req, res) => {
  const { matchId } = req.params;
  const { selectorRequestId, selectedRequestId } = req.body as SelectDriverBody;

  if (!selectorRequestId || !selectedRequestId) {
    return res.status(400).json({ error: "selectorRequestId and selectedRequestId are required" });
  }
  if (selectorRequestId === selectedRequestId) {
    return res.status(400).json({ error: "You can't select yourself as the driver" });
  }

  const selectorRequest = await findCommuteRequestById(selectorRequestId);
  const selectedRequest = await findCommuteRequestById(selectedRequestId);
  if (!selectorRequest || !selectedRequest) {
    return res.status(404).json({ error: "Commute request not found" });
  }

  const match = await findMatchByRequestId(selectorRequestId);
  if (!match || match.id !== matchId) {
    return res.status(404).json({ error: "Match not found for this request" });
  }
  if (!match.request_ids.includes(selectedRequestId)) {
    return res.status(400).json({ error: "That rider isn't part of this match" });
  }

  const selection = await upsertSelection(matchId, selectorRequestId, selectedRequestId);
  res.status(201).json({ selection });
});
