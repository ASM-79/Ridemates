import { Router } from "express";
import { runMatching } from "../services/matching.js";
import { GradientError } from "../ai/gradient.js";

export const matchRouter = Router();

matchRouter.post("/api/match", async (_req, res) => {
  try {
    const result = await runMatching();
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof GradientError) {
      return res.status(502).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to run matching" });
  }
});
