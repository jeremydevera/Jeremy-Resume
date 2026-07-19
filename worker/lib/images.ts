import type { Context } from "hono";
import type { AppEnv } from "../types";

export async function serveImage(c: Context<AppEnv>): Promise<Response> {
  const url = new URL(c.req.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/img\//, ""));
  if (!key || key.includes("..")) return c.text("Bad request", 400);

  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.text("Not found", 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}

export async function uploadImage(c: Context<AppEnv>): Promise<Response> {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file provided" }, 400);

  const rawPrefix = (form.get("prefix") as string) || "uploads";
  const prefix = rawPrefix.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "") || "uploads";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
  const key = `${prefix}/${crypto.randomUUID()}-${safeName}`;

  await c.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  return c.json({ key, url: `/img/${key}` });
}
