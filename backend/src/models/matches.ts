import { pool } from "../db/pool.js";

export interface Match {
  id: string;
  request_ids: string[];
  explanation: string | null;
  carbon_savings_kg: number | null;
  created_at: string;
}

export interface CreateMatchInput {
  requestIds: string[];
  explanation: string;
  carbonSavingsKg: number;
}

export async function findMatchByRequestId(requestId: string): Promise<Match | null> {
  const result = await pool.query<Match>(
    "SELECT * FROM matches WHERE $1 = ANY(request_ids) ORDER BY created_at DESC LIMIT 1",
    [requestId]
  );
  return result.rows[0] ?? null;
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const result = await pool.query<Match>(
    `INSERT INTO matches (request_ids, explanation, carbon_savings_kg)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.requestIds, input.explanation, input.carbonSavingsKg]
  );
  return result.rows[0];
}
