import { Hono } from "hono";
import type { AppEnv } from "./types";
import { serveImage } from "./lib/images";
import { publicRoutes } from "./routes/public";
import { authRoutes } from "./routes/auth";
import { adminRoutes } from "./routes/admin";

const app = new Hono<AppEnv>();

// R2-backed images
app.get("/img/*", serveImage);

// API groups
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api", publicRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
