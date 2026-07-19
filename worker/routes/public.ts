import { Hono } from "hono";
import type { AppEnv, Env } from "../types";

export const publicRoutes = new Hono<AppEnv>();

function imgUrl(key: string | null | undefined): string | null {
  return key ? `/img/${key}` : null;
}

async function getProfile(env: Env) {
  const p = await env.DB.prepare("SELECT * FROM site_profile WHERE id = 1").first<Record<string, unknown>>();
  if (!p) return null;
  return {
    ...p,
    available_for_hire: !!p.available_for_hire,
    socials: JSON.parse((p.socials as string) || "[]"),
    stats: JSON.parse((p.stats as string) || "[]"),
    avatar_url: imgUrl(p.avatar_key as string | null),
  };
}

async function getCategories(env: Env) {
  const r = await env.DB.prepare("SELECT * FROM categories ORDER BY sort_order, name").all();
  return r.results;
}

async function listPublishedProjects(env: Env, categorySlug: string | null) {
  let sql = `SELECT p.id, p.slug, p.title, p.tagline, p.summary, p.cover_image_key,
                    p.link_url, p.sort_order, p.created_at,
                    c.slug AS category_slug, c.name AS category_name
             FROM projects p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.status = 'published'`;
  const params: unknown[] = [];
  if (categorySlug) {
    sql += " AND c.slug = ?";
    params.push(categorySlug);
  }
  sql += " ORDER BY p.sort_order, p.created_at DESC";
  const r = await env.DB.prepare(sql).bind(...params).all<Record<string, unknown>>();
  return r.results.map((row) => ({ ...row, cover_url: imgUrl(row.cover_image_key as string | null) }));
}

async function getResume(env: Env) {
  const r = await env.DB.prepare("SELECT * FROM resume_entries ORDER BY sort_order, id").all<Record<string, unknown>>();
  return r.results.map((row) => ({ ...row, skills: JSON.parse((row.skills as string) || "[]") }));
}

publicRoutes.get("/home", async (c) => {
  const [profile, categories, projects, resume] = await Promise.all([
    getProfile(c.env),
    getCategories(c.env),
    listPublishedProjects(c.env, null),
    getResume(c.env),
  ]);
  return c.json({ profile, categories, projects, resume });
});

publicRoutes.get("/profile", async (c) => c.json(await getProfile(c.env)));
publicRoutes.get("/categories", async (c) => c.json(await getCategories(c.env)));
publicRoutes.get("/resume", async (c) => c.json(await getResume(c.env)));

publicRoutes.get("/projects", async (c) => {
  const category = c.req.query("category") || null;
  return c.json(await listPublishedProjects(c.env, category));
});

publicRoutes.get("/projects/:slug", async (c) => {
  const slug = c.req.param("slug");
  const p = await c.env.DB.prepare(
    `SELECT p.*, c.slug AS category_slug, c.name AS category_name
     FROM projects p LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = ? AND p.status = 'published'`,
  )
    .bind(slug)
    .first<Record<string, unknown>>();
  if (!p) return c.json({ error: "Not found" }, 404);

  const imgs = await c.env.DB.prepare(
    "SELECT id, r2_key, alt, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
  )
    .bind(p.id)
    .all<Record<string, unknown>>();

  return c.json({
    ...p,
    cover_url: imgUrl(p.cover_image_key as string | null),
    images: imgs.results.map((i) => ({ ...i, url: imgUrl(i.r2_key as string) })),
  });
});
