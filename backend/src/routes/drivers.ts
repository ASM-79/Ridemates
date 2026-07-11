import { Router } from "express";
import { geocodeAddress, GeocodeError } from "../services/geocode.js";
import { findOrCreateUser, findUserByEmail } from "../models/users.js";
import {
  createRoute,
  findRoutesByDriverUserId,
  findRouteById,
  setRouteOnlineStatus,
} from "../models/routes.js";
import {
  findPendingCommuteRequests,
  findCommuteRequestById,
  findCommuteRequestsByIdsWithRider,
  markCommuteRequestsMatched,
} from "../models/commuteRequests.js";
import { createMatch, findConfirmedMatchesByRouteId } from "../models/matches.js";
import { haversineMiles } from "../services/geo.js";
import { isCollegeEmail } from "../services/emailValidation.js";

export const driversRouter = Router();

const NEARBY_RADIUS_MILES = 3;
const KG_CO2_PER_SOLO_MILE = 0.404;

interface ScheduleRouteBody {
  name?: string;
  email?: string;
  startAddress?: string;
  endAddress?: string;
  schedule?: unknown;
  seatsAvailable?: number;
}

driversRouter.post("/routes", async (req, res) => {
  const body = req.body as ScheduleRouteBody;
  const { name, email, startAddress, endAddress, schedule } = body;
  const seatsAvailable = Number(body.seatsAvailable ?? 3);

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!email || !isCollegeEmail(email)) {
    return res.status(400).json({ error: "a valid email address is required" });
  }
  if (!startAddress || typeof startAddress !== "string") {
    return res.status(400).json({ error: "startAddress is required" });
  }
  if (!endAddress || typeof endAddress !== "string") {
    return res.status(400).json({ error: "endAddress is required" });
  }
  if (!Number.isFinite(seatsAvailable) || seatsAvailable < 1) {
    return res.status(400).json({ error: "seatsAvailable must be at least 1" });
  }

  try {
    const [start, end] = await Promise.all([
      geocodeAddress(startAddress),
      geocodeAddress(endAddress),
    ]);

    const driver = await findOrCreateUser(name.trim(), email.trim().toLowerCase());

    const route = await createRoute({
      driverUserId: driver.id,
      startLat: start.lat,
      startLng: start.lng,
      startAddress: start.displayName,
      endLat: end.lat,
      endLng: end.lng,
      endAddress: end.displayName,
      schedule: schedule ?? null,
      seatsAvailable,
    });

    res.status(201).json({ driver, route });
  } catch (err) {
    if (err instanceof GeocodeError) {
      return res.status(422).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to schedule route" });
  }
});

driversRouter.get("/drivers/:email/dashboard", async (req, res) => {
  const email = req.params.email.toLowerCase();
  const driver = await findUserByEmail(email);
  if (!driver) {
    return res.status(404).json({ error: "No driver found for that email" });
  }

  const routes = await findRoutesByDriverUserId(driver.id);
  const pendingRequests = await findPendingCommuteRequests();

  const routeSummaries = await Promise.all(
    routes.map(async (route) => {
      const confirmedMatches = await findConfirmedMatchesByRouteId(route.id);
      const confirmedRequestIds = confirmedMatches.flatMap((m) => m.request_ids);
      const confirmedRiders = await findCommuteRequestsByIdsWithRider(confirmedRequestIds);

      const nearbyPending = route.is_online
        ? pendingRequests.filter((r) => {
            const startDist = haversineMiles(r.origin_lat, r.origin_lng, route.start_lat, route.start_lng);
            const endDist = haversineMiles(r.dest_lat, r.dest_lng, route.end_lat, route.end_lng);
            return startDist <= NEARBY_RADIUS_MILES && endDist <= NEARBY_RADIUS_MILES;
          })
        : [];
      const nearbyPendingWithRider = await findCommuteRequestsByIdsWithRider(
        nearbyPending.map((r) => r.id)
      );

      return {
        route,
        isOnline: route.is_online,
        seatsAvailable: route.seats_available,
        confirmedCount: confirmedRiders.length,
        seatsRemaining: Math.max(route.seats_available - confirmedRiders.length, 0),
        confirmedRiders: confirmedRiders.map((r) => ({
          requestId: r.id,
          name: r.rider_name,
          originAddress: r.origin_address,
          destAddress: r.dest_address,
        })),
        pendingNearby: nearbyPendingWithRider.map((r) => ({
          requestId: r.id,
          name: r.rider_name,
          originAddress: r.origin_address,
          destAddress: r.dest_address,
          departureTime: r.departure_time,
        })),
      };
    })
  );

  res.json({ driver, routes: routeSummaries });
});

driversRouter.post("/routes/:routeId/confirm", async (req, res) => {
  const { routeId } = req.params;
  const { requestId } = req.body as { requestId?: string };

  if (!requestId) {
    return res.status(400).json({ error: "requestId is required" });
  }

  const route = await findRouteById(routeId);
  if (!route) {
    return res.status(404).json({ error: "Route not found" });
  }
  if (!route.is_online) {
    return res.status(409).json({ error: "Go online to confirm riders on this route" });
  }

  const commuteRequest = await findCommuteRequestById(requestId);
  if (!commuteRequest) {
    return res.status(404).json({ error: "Commute request not found" });
  }
  if (commuteRequest.status !== "pending") {
    return res.status(409).json({ error: "This rider is no longer pending" });
  }

  const confirmedMatches = await findConfirmedMatchesByRouteId(routeId);
  const confirmedCount = confirmedMatches.flatMap((m) => m.request_ids).length;
  if (confirmedCount >= route.seats_available) {
    return res.status(409).json({ error: "No seats remaining on this route" });
  }

  const distanceMiles = haversineMiles(
    commuteRequest.origin_lat,
    commuteRequest.origin_lng,
    commuteRequest.dest_lat,
    commuteRequest.dest_lng
  );
  const carbonSavingsKg = Math.round(distanceMiles * KG_CO2_PER_SOLO_MILE * 100) / 100;

  const match = await createMatch({
    requestIds: [requestId],
    explanation: `Confirmed by the driver for their scheduled route from ${route.start_address} to ${route.end_address}.`,
    carbonSavingsKg,
    routeId,
  });

  await markCommuteRequestsMatched([requestId]);

  res.status(201).json({ match });
});
