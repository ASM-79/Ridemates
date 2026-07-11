import { pool } from "../db/pool.js";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserWithAuth extends User {
  password_hash: string;
  email_verified: boolean;
}

const PUBLIC_FIELDS = "id, name, email, role";

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(`SELECT ${PUBLIC_FIELDS} FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] ?? null;
}

export async function findUserByEmailWithAuth(email: string): Promise<UserWithAuth | null> {
  const result = await pool.query<UserWithAuth>(
    `SELECT ${PUBLIC_FIELDS}, password_hash, email_verified FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] ?? null;
}

export interface CreateVerifiedUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

// Email verification is skipped for now (no email provider configured) —
// accounts are created already verified so signup logs straight in.
export async function createVerifiedUser(input: CreateVerifiedUserInput): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, email_verified)
     VALUES ($1, $2, $3, true)
     RETURNING ${PUBLIC_FIELDS}`,
    [input.name, input.email, input.passwordHash]
  );
  return result.rows[0];
}

export async function findOrCreateUser(name: string, email: string): Promise<User> {
  const existing = await pool.query<User>(`SELECT ${PUBLIC_FIELDS} FROM users WHERE email = $1`, [
    email,
  ]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // These users are created without a password (via the request/route forms,
  // not signup) — password_hash is NOT NULL, so pass an empty placeholder.
  // They simply can't log in with a password unless they later sign up properly.
  const inserted = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, '') RETURNING ${PUBLIC_FIELDS}`,
    [name, email]
  );
  return inserted.rows[0];
}
