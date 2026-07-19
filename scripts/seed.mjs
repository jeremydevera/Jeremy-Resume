// Seeds the LOCAL D1 + R2 with bryllim-style MOCK content.
// Re-runnable: clears content tables and reinserts. Run: npm run seed
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPO = resolve(ROOT, "..");

const DB = "portfolio";
const BUCKET = "portfolio";
const ITER = 100_000;
// Target: --local (default) or --remote (live Cloudflare D1/R2). `npm run seed:remote`
const LOC = process.argv.includes("--remote") ? "--remote" : "--local";

// Credentials: local dev gets throwaway defaults; remote REQUIRES env vars so no
// real password ever lives in this file.
//   ADMIN_EMAIL=you@x.com ADMIN_PASSWORD='...' npm run seed:remote
const isRemote = LOC === "--remote";
// Local convenience: pull creds from gitignored .dev.vars when env not set.
if (!isRemote && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  try {
    const devVars = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", ".dev.vars"), "utf8");
    for (const line of devVars.split("\n")) {
      const m = line.match(/^\s*(ADMIN_EMAIL|ADMIN_PASSWORD)\s*=\s*"?([^"\n]+)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* no .dev.vars — fall through to defaults */
  }
}
if (isRemote && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
  console.error("Remote seed requires ADMIN_EMAIL and ADMIN_PASSWORD env vars:");
  console.error("  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-password' npm run seed:remote");
  process.exit(1);
}
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@local.dev").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "localdev123";

// ---- password hash (mirrors worker/auth.ts) ----
function b64(bytes) {
  let s = "";
  for (const x of new Uint8Array(bytes)) s += String.fromCharCode(x);
  return btoa(s);
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, key, 256);
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(bits)}`;
}

const sq = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const j = (o) => sq(JSON.stringify(o));

function wrangler(a) {
  console.log("→ wrangler " + a.join(" "));
  execFileSync("npx", ["wrangler", ...a], { cwd: ROOT, stdio: "inherit" });
}

const cs = ({ overview, problem, built, result, stack }) =>
  [
    `## Overview`,
    overview,
    ``,
    `## The problem`,
    problem,
    ``,
    `## What I built`,
    built.map((b) => `- ${b}`).join("\n"),
    ``,
    `## Result`,
    result,
    stack ? `\n**Stack:** ${stack}` : ``,
    ``,
    `> Sample project — edit or replace it in the admin.`,
  ].join("\n");

// ---- real project markdown ----
const gmailMdPath = join(REPO, "portfolio", "workflow automation", "zapier", "01-gmail-attachment-to-drive", "README.md");
const gmailMd = existsSync(gmailMdPath) ? readFileSync(gmailMdPath, "utf8") : "# Gmail → Drive\n\n(source not found)";
const gmailCover = "projects/gmail-attachment-to-drive/cover.png";
const gmailGallery = "projects/gmail-attachment-to-drive/gallery-1.png";

// cat ids: 1 netsuite, 2 website-creation, 3 workflow-automation
const PROJECTS = [
  // ---- Workflow Automation (cat 3) ----
  ["gmail-attachment-to-drive", "Gmail Attachment → Google Drive", 3, "Auto-backup email attachments into Drive", gmailMd, gmailCover, 1],
  ["slack-standup-bot", "Slack Standup Collector", 3, "Automated daily standup, posted to one channel",
    cs({
      overview: "A Zapier automation that runs the whole async standup — it DMs each teammate every morning, collects their replies, and posts a single formatted digest to `#standup`.",
      problem: "Standups were eating 20 minutes a day and people on other time zones kept missing them. Nobody wanted another meeting.",
      built: [
        "Scheduled trigger fans out a Slack DM to each team member",
        "Replies captured and buffered until a cutoff time",
        "Formatter step assembles a clean per-person digest",
        "Digest posted to `#standup`; non-responders gently pinged",
      ],
      result: "Saved ~1.5 hours of meeting time per week and gave the whole team a written, searchable record of what everyone is working on.",
      stack: "Zapier · Slack · Formatter · Schedule",
    }), null, 2],
  ["invoice-router", "Invoice Approval Router", 3, "Route incoming invoices to the right approver",
    cs({
      overview: "Inbound invoice emails are parsed automatically and routed to the correct approver based on vendor and amount thresholds — no more manual forwarding.",
      problem: "Invoices landed in a shared inbox and sat there. Nobody knew whose job it was to approve what, and finance chased approvals by hand.",
      built: [
        "Email parser extracts vendor, amount, and due date",
        "Branching paths route by amount tier and vendor rules",
        "Approver notified in Slack with an approve/reject action",
        "Every decision logged to a Google Sheet audit trail",
      ],
      result: "Approval time dropped from days to hours, and finance finally had a clean paper trail for every invoice.",
      stack: "Zapier · Email Parser · Paths · Slack · Sheets",
    }), null, 3],
  ["airtable-quickbooks-sync", "Airtable → QuickBooks Sync", 3, "Two-way sync of projects and invoices",
    cs({
      overview: "Keeps an Airtable project tracker and QuickBooks in lockstep — new billable projects create draft invoices, and payment status flows back to Airtable.",
      problem: "The ops team lived in Airtable; accounting lived in QuickBooks. The two never agreed, and reconciliation was a monthly headache.",
      built: [
        "Airtable trigger creates draft invoices in QuickBooks",
        "Line items mapped from Airtable rollups",
        "Payment webhooks update Airtable status fields",
        "Idempotency keys prevent duplicate invoices on retries",
      ],
      result: "Month-end reconciliation went from a full day to a quick spot-check.",
      stack: "n8n · Airtable · QuickBooks · Webhooks",
    }), null, 4],
  // ---- NetSuite (cat 1) ----
  ["netsuite-so-automation", "NetSuite Sales Order Automation", 1, "Auto-create SOs from CRM deals",
    cs({
      overview: "SuiteScript that turns a closed-won CRM opportunity into a fully-formed NetSuite sales order — right items, pricing, and terms — the moment the deal closes.",
      problem: "Sales closed deals in the CRM, then someone re-keyed every line into NetSuite by hand. Slow, and error-prone on pricing.",
      built: [
        "User Event script fires on opportunity close",
        "Map/Reduce builds the SO with line-item mapping from deal products",
        "Pricing and terms pulled from customer records",
        "Failures queued and retried with clear error logging",
      ],
      result: "Cut order-entry time by roughly 80% and eliminated the pricing mistakes that used to slip through.",
      stack: "NetSuite · SuiteScript 2.1 · Map/Reduce",
    }), null, 5],
  ["netsuite-kpi-dashboard", "NetSuite KPI Dashboard", 1, "Executive saved-search dashboard",
    cs({
      overview: "A set of saved searches and a SuiteAnalytics workbook that give leadership real-time revenue, pipeline, and AR visibility on the NetSuite home dashboard.",
      problem: "Execs asked for the same numbers every week, and someone rebuilt them by hand in a spreadsheet each time.",
      built: [
        "Saved searches with formula fields for the core KPIs",
        "SuiteAnalytics workbook for trend and cohort views",
        "Role-based dashboard portlets so each team sees its slice",
      ],
      result: "Leadership got self-serve numbers and stopped pinging the ops team for weekly reports.",
      stack: "NetSuite · Saved Searches · SuiteAnalytics",
    }), null, 6],
  ["netsuite-3pl-sync", "NetSuite ↔ 3PL Inventory Sync", 1, "RESTlet inventory sync with a 3PL",
    cs({
      overview: "A RESTlet plus a scheduled script that keeps inventory levels in sync between NetSuite and an external third-party logistics provider.",
      problem: "NetSuite and the 3PL drifted apart constantly, causing oversells and frantic manual corrections.",
      built: [
        "RESTlet endpoints for inbound stock updates",
        "Scheduled reconciliation script for drift detection",
        "Idempotent upserts keyed by item + location",
      ],
      result: "Stock accuracy stayed above 99% and oversells effectively went away.",
      stack: "NetSuite · SuiteScript · RESTlet",
    }), null, 7],
  ["netsuite-vendor-bill-ocr", "NetSuite Vendor Bill OCR", 1, "Turn PDF bills into vendor bills",
    cs({
      overview: "Vendor bill PDFs are OCR'd and drafted straight into NetSuite as vendor bills, matched to the right vendor and PO.",
      problem: "AP spent hours a week typing PDF bills into NetSuite line by line.",
      built: [
        "OCR extracts vendor, totals, and line items from the PDF",
        "Fuzzy match to existing vendor and open PO records",
        "Draft vendor bill created for a human to approve",
      ],
      result: "Bill entry time fell by ~70%, with a human still in the loop for approval.",
      stack: "NetSuite · SuiteScript · OCR API",
    }), null, 8],
  // ---- Website Creation (cat 2) ----
  ["celebrately-site", "Celebrately — Event Booking", 2, "Landing + booking CMS for events",
    cs({
      overview: "A marketing site for an events business with an integrated booking flow and a lightweight CMS so the owner can manage packages without a developer.",
      problem: "The client was booking parties over DMs and a messy spreadsheet, and couldn't update their own pricing.",
      built: [
        "Responsive landing pages with package showcases",
        "Booking form with date/calendar availability",
        "Editable content blocks and package pricing in a simple CMS",
      ],
      result: "Bookings moved to a real flow, and the owner updates packages themselves.",
      stack: "React · Vite · Headless CMS",
    }), null, 9],
  ["clinic-portal", "Clinic Intake Portal", 2, "Patient intake + scheduling portal",
    cs({
      overview: "A patient-facing portal for intake forms and appointment scheduling, wired to the clinic's back office so staff aren't re-typing paperwork.",
      problem: "Patients filled paper forms in the waiting room, then staff transcribed them — slow and full of errors.",
      built: [
        "Multi-step intake forms with validation and save-and-resume",
        "Appointment scheduling against real availability",
        "Secure handoff of records to the clinic's system",
      ],
      result: "Check-in time dropped and front-desk transcription errors basically disappeared.",
      stack: "React · Node · PostgreSQL",
    }), null, 10],
  ["restaurant-ordering", "Restaurant Ordering Site", 2, "Menu + online ordering for a local kitchen",
    cs({
      overview: "An online ordering site for a local kitchen — browse the menu, customize items, and check out, with orders printing straight to the kitchen.",
      problem: "They relied on a third-party app that took a big cut of every order and owned their customer data.",
      built: [
        "Menu with modifiers and daily specials",
        "Cart + checkout with pickup time slots",
        "Orders pushed to a kitchen printer and an admin view",
      ],
      result: "Cut the per-order platform fees and gave the owner direct customer relationships.",
      stack: "React · Vite · Stripe",
    }), null, 11],
  ["portfolio-cf", "This Portfolio", 2, "Cloudflare Workers + D1 + R2",
    cs({
      overview: "The site you're looking at — a React + Vite SPA and a Hono API on a single Cloudflare Worker, backed by D1 for content and R2 for images.",
      problem: "I wanted a portfolio I fully control, with a real admin, deployable as one unit and cheap to run.",
      built: [
        "One-Worker deploy via @cloudflare/vite-plugin (SPA + API together)",
        "D1 for projects, categories, profile, and résumé; R2 for images",
        "Email + password admin with PBKDF2 hashing and DB-backed sessions",
        "Selectable home layouts: list, 3/4-column, and digest",
      ],
      result: "A self-hosted, fully-editable portfolio on Cloudflare's free tier.",
      stack: "React · Vite · Hono · D1 · R2 · Cloudflare Workers",
    }), null, 12],
];

const RESUME = [
  {
    period: "2024–Now", role: "Freelance Automation Engineer", org: "Independent",
    location: "Remote", kind: "Freelance", sort: 1,
    description:
      "Design and ship Zapier/n8n automations, NetSuite customizations, and web apps for small teams. I favor the boring, reliable kind of automation that just runs — with logging, retries, and a paper trail so nobody has to babysit it.",
    skills: ["Zapier", "n8n", "NetSuite", "TypeScript", "Cloudflare"],
  },
  {
    period: "2022–2024", role: "Systems / NetSuite Analyst", org: "Hercules Rx",
    location: "Remote", kind: "Full-time", sort: 2,
    description:
      "Owned NetSuite customization and integrations end-to-end — SuiteScript automations, saved-search dashboards for leadership, and a RESTlet-based inventory sync with a 3PL that kept stock accuracy above 99%.",
    skills: ["NetSuite", "SuiteScript 2.1", "SQL", "REST", "SuiteAnalytics"],
  },
  {
    period: "2020–2022", role: "Full-Stack Developer", org: "Digital Agency",
    location: "Hybrid", kind: "Full-time", sort: 3,
    description:
      "Shipped client websites and internal tools end-to-end, from database schema to frontend. Worked directly with clients to scope features and turn rough ideas into things they could actually use.",
    skills: ["React", "Node.js", "PostgreSQL", "REST APIs"],
  },
  {
    period: "2018–2020", role: "Web Developer", org: "Early-stage Startup",
    location: "On-site", kind: "Full-time", sort: 4,
    description:
      "First engineering hire — built the marketing site and early product features, and set up the deployment pipeline the team grew on.",
    skills: ["JavaScript", "PHP", "MySQL", "CI/CD"],
  },
  {
    period: "2017–2018", role: "Software Engineering Intern", org: "University Lab",
    location: "On-site", kind: "Internship", sort: 5,
    description:
      "Built internal data tools and automation scripts for a research group, and got my first taste of turning repetitive manual work into something that runs on its own.",
    skills: ["Python", "Automation", "Git"],
  },
];

const SOCIALS = [
  { label: "github", url: "https://github.com/" },
  { label: "linkedin", url: "https://linkedin.com/" },
  { label: "instagram", url: "https://instagram.com/" },
];
const STATS = [
  { value: "8+ yrs", label: "building" },
  { value: "50+", label: "automations" },
  { value: "3", label: "platforms" },
  { value: "12", label: "integrations" },
];

async function main() {
  const hash = await hashPassword(ADMIN_PASSWORD);

  const LINKS = { "celebrately-site": "https://celebrately.us" };
  const projectValues = PROJECTS.map(
    ([slug, title, cat, tagline, md, cover, sort]) =>
      `(${sq(slug)}, ${sq(title)}, ${cat}, ${sq(tagline)}, ${sq(tagline)}, ${sq(md)}, ${cover ? sq(cover) : "NULL"}, ${sq(LINKS[slug] || "")}, 'published', ${sort})`,
  ).join(",\n  ");

  const resumeValues = RESUME.map(
    (e) =>
      `(${sq(e.period)}, ${sq(e.role)}, ${sq(e.org)}, ${sq(e.location)}, ${sq(e.kind)}, ${sq(e.description)}, ${j(e.skills)}, ${e.sort})`,
  ).join(",\n  ");

  const sql = `
DELETE FROM project_images;
DELETE FROM projects;
DELETE FROM categories;
DELETE FROM resume_entries;
DELETE FROM site_profile;
DELETE FROM sessions;
DELETE FROM users;

INSERT INTO users (email, password_hash) VALUES (${sq(ADMIN_EMAIL)}, ${sq(hash)});

INSERT INTO categories (id, slug, name, sort_order) VALUES
  (1, 'netsuite', 'NetSuite', 1),
  (2, 'website-creation', 'Website Creation', 2),
  (3, 'workflow-automation', 'Workflow Automation', 3);

INSERT INTO site_profile (id, name, tagline, bio, email, location, available_for_hire, socials, stats)
VALUES (1, 'Jeremy Devera',
  'Turning rough ideas into things people actually use.',
  'I''m a systems & automation engineer. I build NetSuite customizations, workflow automations, and modern web apps — and I like the boring, reliable kind that just works.',
  ${sq(ADMIN_EMAIL)}, 'Metro Manila', 1, ${j(SOCIALS)}, ${j(STATS)});

INSERT INTO resume_entries (period, role, org, location, kind, description, skills, sort_order) VALUES
  ${resumeValues};

INSERT INTO projects (slug, title, category_id, tagline, summary, body_markdown, cover_image_key, link_url, status, sort_order) VALUES
  ${projectValues};

INSERT INTO project_images (project_id, r2_key, alt, sort_order)
SELECT id, ${sq(gmailGallery)}, 'Zap configuration', 1 FROM projects WHERE slug = 'gmail-attachment-to-drive';
`;

  const sqlPath = join(ROOT, ".seed.sql");
  writeFileSync(sqlPath, sql);
  wrangler(["d1", "execute", DB, LOC, `--file=${sqlPath}`, "--yes"]);

  const imgDir = join(REPO, "portfolio", "workflow automation", "zapier", "01-gmail-attachment-to-drive", "images");
  const coverSrc = join(imgDir, "gmail.png");
  const gallerySrc = join(imgDir, "Untitled.png");
  if (existsSync(coverSrc)) wrangler(["r2", "object", "put", `${BUCKET}/${gmailCover}`, `--file=${coverSrc}`, "--content-type=image/png", LOC]);
  if (existsSync(gallerySrc)) wrangler(["r2", "object", "put", `${BUCKET}/${gmailGallery}`, `--file=${gallerySrc}`, "--content-type=image/png", LOC]);

  console.log("\n✅ Seed complete.");
  console.log(`   Admin login:  ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
