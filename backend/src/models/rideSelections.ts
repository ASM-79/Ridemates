import { pool } from "../db/pool.js";

export interface RideSelection {
  id: string;
  match_id: string;
  selector_request_id: string;
  selected_request_id: string;
  created_at: string;
}

export async function upsertSelection(
  matchId: string,
  selectorRequestId: string,
  selectedRequestId: string
): Promise<RideSelection> {
  const result = await pool.query<RideSelection>(
    `INSERT INTO ride_selections (match_id, selector_request_id, selected_request_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (match_id, selector_request_id)
     DO UPDATE SET selected_request_id = EXCLUDED.selected_request_id, created_at = now()
     RETURNING *`,
    [matchId, selectorRequestId, selectedRequestId]
  );
  return result.rows[0];
}

export async function findSelectionBySelector(
  matchId: string,
  selectorRequestId: string
): Promise<RideSelection | null> {
  const result = await pool.query<RideSelection>(
    "SELECT * FROM ride_selections WHERE match_id = $1 AND selector_request_id = $2",
    [matchId, selectorRequestId]
  );
  return result.rows[0] ?? null;
}

export interface SelectionWithSelectorName extends RideSelection {
  selector_name: string;
}

// Everyone who picked this request as their preferred driver.
export async function findSelectionsForSelectedRequest(
  requestId: string
): Promise<SelectionWithSelectorName[]> {
  const result = await pool.query<SelectionWithSelectorName>(
    `SELECT rs.*, u.name AS selector_name
     FROM ride_selections rs
     JOIN commute_requests cr ON cr.id = rs.selector_request_id
     JOIN users u ON u.id = cr.user_id
     WHERE rs.selected_request_id = $1`,
    [requestId]
  );
  return result.rows;
}
