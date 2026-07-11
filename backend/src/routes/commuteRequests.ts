import { Router } from "express";
import { geocodeAddress, GeocodeError } from "../services/geocode.js";
import { findOrCreateUser } from "../models/users.js";
import { createCommuteRequest } from "../models/commuteRequests.js";

export const commuteRequestsRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@(deanza\.edu|fhda\.edu)$/i;

interface CreateCommuteRequestBody {
  name?: string;
  email?: string;
  originAddress?: string;
  destAddress?: string;
  departureTime?: string;
  flexibilityMinutes?: number;
}

commuteRequestsRouter.post("/commute-requests", async (req, res) => {
  const body = req.body as CreateCommuteRequestBody;
  const { name, email, originAddress, destAddress, departureTime } = body;
  const flexibilityMinutes = Number(body.flexibilityMinutes ?? 0);

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: "a valid @deanza.edu or @fhda.edu email is required" });
  }
  if (!originAddress || typeof originAddress !== "string") {
    return res.status(400).json({ error: "originAddress is required" });
  }
  if (!destAddress || typeof destAddress !== "string") {
    return res.status(400).json({ error: "destAddress is required" });
  }
  if (!departureTime || isNaN(Date.parse(departureTime))) {
    return res.status(400).json({ error: "departureTime must be a valid date/time" });
  }
  if (!Number.isFinite(flexibilityMinutes) || flexibilityMinutes < 0) {
    return res.status(400).json({ error: "flexibilityMinutes must be a non-negative number" });
  }

  try {
    const [origin, dest] = await Promise.all([
      geocodeAddress(originAddress),
      geocodeAddress(destAddress),
    ]);

    const user = await findOrCreateUser(name.trim(), email.trim().toLowerCase());

    const commuteRequest = await createCommuteRequest({
      userId: user.id,
      originLat: origin.lat,
      originLng: origin.lng,
      originAddress: origin.displayName,
      destLat: dest.lat,
      destLng: dest.lng,
      destAddress: dest.displayName,
      departureTime: new Date(departureTime).toISOString(),
      flexibilityMinutes,
    });

    res.status(201).json({ user, commuteRequest });
  } catch (err) {
    if (err instanceof GeocodeError) {
      return res.status(422).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create commute request" });
  }
});
