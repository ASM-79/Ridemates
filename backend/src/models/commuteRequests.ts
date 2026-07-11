import { pool } from "../db/pool.js";

export interface CommuteRequest {
  id: string;
  user_id: string;
  origin_lat: number;
  origin_lng: number;
  origin_address: string;
  dest_lat: number;
  dest_lng: number;
  dest_address: string;
  departure_time: string;
  flexibility_minutes: number;
  status: string;
  created_at: string;
}

export interface CreateCommuteRequestInput {
  userId: string;
  originLat: number;
  originLng: number;
  originAddress: string;
  destLat: number;
  destLng: number;
  destAddress: string;
  departureTime: string;
  flexibilityMinutes: number;
}

export async function findCommuteRequestById(id: string): Promise<CommuteRequest | null> {
  const result = await pool.query<CommuteRequest>("SELECT * FROM commute_requests WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ?? null;
}

export interface CommuteRequestWithRider extends CommuteRequest {
  rider_name: string;
}

export async function findCommuteRequestsByIdsWithRider(
  ids: string[]
): Promise<CommuteRequestWithRider[]> {
  if (ids.length === 0) return [];
  const result = await pool.query<CommuteRequestWithRider>(
    `SELECT cr.*, u.name AS rider_name
     FROM commute_requests cr
     JOIN users u ON u.id = cr.user_id
     WHERE cr.id = ANY($1::uuid[])`,
    [ids]
  );
  return result.rows;
}

export async function findCommuteRequestsByUserId(userId: string): Promise<CommuteRequest[]> {
  const result = await pool.query<CommuteRequest>(
    "SELECT * FROM commute_requests WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

export async function findPendingCommuteRequests(): Promise<CommuteRequest[]> {
  const result = await pool.query<CommuteRequest>(
    "SELECT * FROM commute_requests WHERE status = 'pending' ORDER BY departure_time ASC"
  );
  return result.rows;
}

export async function markCommuteRequestsMatched(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await pool.query("UPDATE commute_requests SET status = 'matched' WHERE id = ANY($1::uuid[])", [
    ids,
  ]);
}

export async function createCommuteRequest(
  input: CreateCommuteRequestInput
): Promise<CommuteRequest> {
  const result = await pool.query<CommuteRequest>(
    `INSERT INTO commute_requests
      (user_id, origin_lat, origin_lng, origin_address, dest_lat, dest_lng, dest_address, departure_time, flexibility_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.userId,
      input.originLat,
      input.originLng,
      input.originAddress,
      input.destLat,
      input.destLng,
      input.destAddress,
      input.departureTime,
      input.flexibilityMinutes,
    ]
  );
  return result.rows[0];
}
