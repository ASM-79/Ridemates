import { pool } from "../db/pool.js";

export interface Route {
  id: string;
  driver_user_id: string;
  start_lat: number;
  start_lng: number;
  start_address: string;
  end_lat: number;
  end_lng: number;
  end_address: string;
  schedule: unknown;
  seats_available: number;
  created_at: string;
}

export interface CreateRouteInput {
  driverUserId: string;
  startLat: number;
  startLng: number;
  startAddress: string;
  endLat: number;
  endLng: number;
  endAddress: string;
  schedule: unknown;
  seatsAvailable: number;
}

export async function createRoute(input: CreateRouteInput): Promise<Route> {
  const result = await pool.query<Route>(
    `INSERT INTO routes
      (driver_user_id, start_lat, start_lng, start_address, end_lat, end_lng, end_address, schedule, seats_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.driverUserId,
      input.startLat,
      input.startLng,
      input.startAddress,
      input.endLat,
      input.endLng,
      input.endAddress,
      JSON.stringify(input.schedule),
      input.seatsAvailable,
    ]
  );
  return result.rows[0];
}

export async function findRoutesByDriverUserId(driverUserId: string): Promise<Route[]> {
  const result = await pool.query<Route>(
    "SELECT * FROM routes WHERE driver_user_id = $1 ORDER BY created_at DESC",
    [driverUserId]
  );
  return result.rows;
}

export async function findRouteById(id: string): Promise<Route | null> {
  const result = await pool.query<Route>("SELECT * FROM routes WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}
