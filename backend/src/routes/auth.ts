import { Router } from "express";
import { isCollegeEmail } from "../services/emailValidation.js";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "../services/authTokens.js";
import {
  createVerifiedUser,
  findUserByEmail,
  findUserByEmailWithAuth,
  findUserById,
} from "../models/users.js";

export const authRouter = Router();

const MIN_PASSWORD_LENGTH = 8;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function setSessionCookie(res: import("express").Response, token: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    // Backend and frontend live on different subdomains in production (both
    // under the ondigitalocean.app public suffix, so browsers treat them as
    // different sites) — cross-origin fetch with credentials only sends the
    // cookie back if SameSite=None, which itself requires Secure.
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

interface SignupBody {
  name?: string;
  email?: string;
  password?: string;
}

authRouter.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body as SignupBody;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!email || !isCollegeEmail(email)) {
    return res.status(400).json({ error: "a valid email address is required" });
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await hashPassword(password);

  const user = await createVerifiedUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const sessionToken = signSessionToken({ userId: user.id, email: user.email });
  setSessionCookie(res, sessionToken);

  res.status(201).json({ user });
});

interface LoginBody {
  email?: string;
  password?: string;
}

authRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await findUserByEmailWithAuth(email.trim().toLowerCase());
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  const sessionToken = signSessionToken({ userId: user.id, email: user.email });
  setSessionCookie(res, sessionToken);

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

authRouter.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
  });
  res.status(204).end();
});

authRouter.get("/auth/me", async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await findUserById(req.userId);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({ user });
});
