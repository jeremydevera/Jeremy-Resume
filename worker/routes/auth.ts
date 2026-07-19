import { Hono } from "hono";
import type { AppEnv, Env } from "../types";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getSessionToken,
  getSessionUser,
  hashPassword,
  requireAuth,
  setSessionCookie,
  verifyPassword,
} from "../auth";

export const authRoutes = new Hono<AppEnv>();

// Rate limit: max 5 failed attempts per key per 15 minutes.
const MAX_ATTEMPTS = 5;
const WINDOW = "-15 minutes";

async function tooManyFailures(env: Env, key: string): Promise<boolean> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_attempts WHERE key = ? AND attempted_at > datetime('now', ?)`,
  )
    .bind(key, WINDOW)
    .first<{ n: number }>();
  return (row?.n ?? 0) >= MAX_ATTEMPTS;
}

authRoutes.post("/login", async (c) => {
  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);

  const ip = c.req.header("CF-Connecting-IP") || "local";
  const keys = [`ip:${ip}`, `email:${email}`];
  for (const key of keys) {
    if (await tooManyFailures(c.env, key)) {
      return c.json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
    }
  }

  const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: number; email: string; password_hash: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    const stmt = c.env.DB.prepare("INSERT INTO login_attempts (key) VALUES (?)");
    await c.env.DB.batch(keys.map((k) => stmt.bind(k)));
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Success: clear this user's failure history + stale rows.
  await c.env.DB.prepare(
    `DELETE FROM login_attempts WHERE key IN (?, ?) OR attempted_at <= datetime('now', ?)`,
  )
    .bind(keys[0], keys[1], WINDOW)
    .run();

  const token = await createSession(c.env, user.id);
  setSessionCookie(c, token);
  return c.json({ user: { id: user.id, email: user.email } });
});

authRoutes.post("/change-password", requireAuth, async (c) => {
  const user = c.get("user");
  let body: { current?: string; next?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const current = body.current || "";
  const next = body.next || "";
  if (next.length < 8) return c.json({ error: "New password must be at least 8 characters" }, 400);

  const row = await c.env.DB.prepare("SELECT password_hash FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ password_hash: string }>();
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return c.json({ error: "Current password is incorrect" }, 401);
  }

  const hash = await hashPassword(next);
  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(hash, user.id).run();
  // Invalidate every other session; keep this one.
  const token = getSessionToken(c);
  await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token != ?")
    .bind(user.id, token ?? "")
    .run();
  return c.json({ ok: true });
});

authRoutes.post("/logout", async (c) => {
  const token = getSessionToken(c);
  if (token) await deleteSession(c.env, token);
  clearSessionCookie(c);
  return c.json({ ok: true });
});

authRoutes.get("/me", async (c) => {
  const user = await getSessionUser(c);
  return c.json({ user });
});
