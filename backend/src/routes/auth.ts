import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "../db.js";
import { hashPassword, verifyPassword, signToken } from "../auth.js";
import { requireAuth } from "../middleware.js";
import { loginLimiter, signupLimiter } from "../rateLimit.js";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1).max(100),
  role: z.enum(["organizer", "attendee"]),
});

router.post("/signup", signupLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password, displayName, role } = parsed.data;

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(password);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)`
  ).run(id, email, passwordHash, displayName, role);

  const token = signToken({ userId: id, email, role });
  res.status(201).json({
    token,
    user: { id, email, displayName, role, photoUrl: null },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { email, password } = parsed.data;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  // Deliberately identical error for "no such user" and "wrong password" --
  // returning a different message for each leaks which emails are registered
  // (a real, documented security anti-pattern called a user-enumeration bug).
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      photoUrl: user.photo_url,
    },
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user!.userId) as any;
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    photoUrl: user.photo_url,
  });
});

export default router;
