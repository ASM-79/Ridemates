import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_COOKIE_NAME = "dacarpool_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function requireJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return JWT_SECRET;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateVerificationToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  return { token, expiresAt };
}

export interface SessionPayload {
  userId: string;
  email: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, requireJwtSecret(), { expiresIn: SESSION_TTL_SECONDS });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, requireJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS };
