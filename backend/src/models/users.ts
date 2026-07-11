import { pool } from "../db/pool.js";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT id, name, email, role FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] ?? null;
}

export async function findOrCreateUser(name: string, email: string): Promise<User> {
  const existing = await pool.query<User>("SELECT id, name, email, role FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const inserted = await pool.query<User>(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, role",
    [name, email]
  );
  return inserted.rows[0];
}
