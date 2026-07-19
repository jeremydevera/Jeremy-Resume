import { Hono } from "hono";
import type { AppEnv, Env } from "../types";
import { requireAuth } from "../auth";
import { uploadImage } from "../lib/images";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("*", requireAuth);

type ImageInput = { r2_key?: string; key?: string; alt?: string; sort_order?: number };

async function saveImages(env: Env, projectId: number, images: ImageInput[]) {
  await env.DB.prepare("DELETE FROM project_images WHERE project_id = ?").bind(projectId).run();
  if (!images.length) return;
  const stmt = env.DB.prepare(
    "INSERT INTO project_images (project_id, r2_key, alt, sort_order) VALUES (?, ?, ?, ?)",
  );
  await env.DB.batch(
    images
      .filter((im) => im.r2_key || im.key)
      .map((im, i) => stmt.bind(projectId, im.r2_key || im.key, im.alt ?? null, im.sort_order ?? i)),
  );
}

// ---- Uploads ----
adminRoutes.post("/upload", uploadImage);

// ---- Projects ----
adminRoutes.get("/projects", async (c) => {
  const r = await c.env.DB.prepare(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM projects p LEFT JOIN categories c ON p.category_id = c.id
     ORDER BY p.sort_order, p.created_at DESC`,
  ).all();
  return c.json(r.results);
});

adminRoutes.get("/projects/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const p = await c.env.DB.prepare("SELECT * FROM projects WHERE id = ?").bind(id).first();
  if (!p) return c.json({ error: "Not found" }, 404);
  const imgs = await c.env.DB.prepare(
    "SELECT id, r2_key, alt, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
  )
    .bind(id)
    .all();
  return c.json({ ...p, images: imgs.results });
});

adminRoutes.post("/projects", async (c) => {
  const b = await c.req.json();
  if (!b.title || !b.slug) return c.json({ error: "title and slug are required" }, 400);
  try {
    const res = await c.env.DB.prepare(
      `INSERT INTO projects
        (slug, title, category_id, tagline, summary, body_markdown, cover_image_key, link_url, status, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
      .bind(
        b.slug,
        b.title,
        b.category_id ?? null,
        b.tagline ?? null,
        b.summary ?? null,
        b.body_markdown ?? null,
        b.cover_image_key ?? null,
        b.link_url ?? "",
        b.status ?? "draft",
        b.sort_order ?? 0,
      )
      .run();
    const id = res.meta.last_row_id as number;
    await saveImages(c.env, id, b.images || []);
    return c.json({ id }, 201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "Slug already exists" }, 409);
    throw e;
  }
});

adminRoutes.put("/projects/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json();
  if (!b.title || !b.slug) return c.json({ error: "title and slug are required" }, 400);
  try {
    await c.env.DB.prepare(
      `UPDATE projects SET
        slug = ?, title = ?, category_id = ?, tagline = ?, summary = ?,
        body_markdown = ?, cover_image_key = ?, link_url = ?, status = ?, sort_order = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(
        b.slug,
        b.title,
        b.category_id ?? null,
        b.tagline ?? null,
        b.summary ?? null,
        b.body_markdown ?? null,
        b.cover_image_key ?? null,
        b.link_url ?? "",
        b.status ?? "draft",
        b.sort_order ?? 0,
        id,
      )
      .run();
    await saveImages(c.env, id, b.images || []);
    return c.json({ ok: true });
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "Slug already exists" }, 409);
    throw e;
  }
});

adminRoutes.delete("/projects/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---- Categories ----
adminRoutes.post("/categories", async (c) => {
  const b = await c.req.json();
  if (!b.name || !b.slug) return c.json({ error: "name and slug are required" }, 400);
  try {
    const res = await c.env.DB.prepare(
      "INSERT INTO categories (slug, name, sort_order) VALUES (?, ?, ?)",
    )
      .bind(b.slug, b.name, b.sort_order ?? 0)
      .run();
    return c.json({ id: res.meta.last_row_id }, 201);
  } catch (e) {
    if (String(e).includes("UNIQUE")) return c.json({ error: "Slug already exists" }, 409);
    throw e;
  }
});

adminRoutes.put("/categories/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json();
  await c.env.DB.prepare("UPDATE categories SET slug = ?, name = ?, sort_order = ? WHERE id = ?")
    .bind(b.slug, b.name, b.sort_order ?? 0, id)
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete("/categories/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---- Resume ----
adminRoutes.get("/resume", async (c) => {
  const r = await c.env.DB.prepare("SELECT * FROM resume_entries ORDER BY sort_order, id").all<Record<string, unknown>>();
  return c.json(r.results.map((row) => ({ ...row, skills: JSON.parse((row.skills as string) || "[]") })));
});

adminRoutes.post("/resume", async (c) => {
  const b = await c.req.json();
  if (!b.period || !b.role) return c.json({ error: "period and role are required" }, 400);
  const res = await c.env.DB.prepare(
    "INSERT INTO resume_entries (period, role, org, location, kind, description, skills, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      b.period,
      b.role,
      b.org ?? null,
      b.location ?? null,
      b.kind ?? "Full-time",
      b.description ?? "",
      JSON.stringify(b.skills ?? []),
      b.sort_order ?? 0,
    )
    .run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

adminRoutes.put("/resume/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE resume_entries SET period = ?, role = ?, org = ?, location = ?, kind = ?, description = ?, skills = ?, sort_order = ? WHERE id = ?",
  )
    .bind(
      b.period,
      b.role,
      b.org ?? null,
      b.location ?? null,
      b.kind ?? "Full-time",
      b.description ?? "",
      JSON.stringify(b.skills ?? []),
      b.sort_order ?? 0,
      id,
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete("/resume/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare("DELETE FROM resume_entries WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---- Profile ----
adminRoutes.put("/profile", async (c) => {
  const b = await c.req.json();
  await c.env.DB.prepare("INSERT OR IGNORE INTO site_profile (id) VALUES (1)").run();
  await c.env.DB.prepare(
    `UPDATE site_profile SET
      name = ?, tagline = ?, bio = ?, email = ?, avatar_key = ?, available_for_hire = ?,
      socials = ?, stats = ?, location = ?, home_layout = ?,
      projects_layout = ?, experience_layout = ?
     WHERE id = 1`,
  )
    .bind(
      b.name ?? "",
      b.tagline ?? "",
      b.bio ?? "",
      b.email ?? "",
      b.avatar_key ?? null,
      b.available_for_hire ? 1 : 0,
      JSON.stringify(b.socials ?? []),
      JSON.stringify(b.stats ?? []),
      b.location ?? "",
      b.home_layout ?? "list",
      b.projects_layout ?? "cards",
      b.experience_layout ?? "timeline",
    )
    .run();
  return c.json({ ok: true });
});
