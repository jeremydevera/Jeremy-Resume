# Portfolio Site

React + Vite frontend and a Hono API on a single Cloudflare Worker. **D1** stores projects/categories/résumé/profile; **R2** stores images. Admin CRUD behind email + password login.

## Local dev

```bash
npm install
npm run migrate:local     # create tables in the local D1
npm run seed              # admin user + categories + sample projects + images
npm run dev               # http://localhost:5173
```

- Public site: <http://localhost:5173/>
- Admin: <http://localhost:5173/admin>  (default login `jdeville@herculesrx.com` / `changeme123` — change it)

Override seed credentials: `ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret npm run seed`.

## Deploy to Cloudflare (needs your account)

```bash
npx wrangler login
npx wrangler d1 create portfolio-db          # paste the returned database_id into wrangler.jsonc
# R2 bucket "portfolio" already created in the dashboard — skip if it exists:
# npx wrangler r2 bucket create portfolio
npm run migrate:remote
npm run deploy                               # builds + wrangler deploy -> *.workers.dev URL
```

Seed production by running the SQL/uploads against `--remote` (or add projects via the admin UI once live).

## Stack

- `worker/` — Hono API (`/api/*`), R2 image serving (`/img/*`), PBKDF2 auth + D1 sessions
- `src/` — React SPA (public site + `/admin`)
- `migrations/` — D1 schema
- `scripts/seed.mjs` — local seed
