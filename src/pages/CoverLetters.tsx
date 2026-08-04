import { useState } from "react";
import { Layout } from "../components/Layout";

const HEADER = `Jeremy Devera
jeremydevera03@gmail.com · jeremydv.com

[Date]

Dear [Hiring Manager],`;

const SIGNOFF = `Sincerely,
Jeremy Devera`;

/** Build a full letter from its body paragraphs + the shared header/sign-off. */
function letter(body: string): string {
  return `${HEADER}\n\n${body.trim()}\n\n${SIGNOFF}`;
}

type Letter = { id: string; title: string; tag: string; text: string };

const LETTERS: Letter[] = [
  {
    id: "fullstack",
    title: "Full-stack generalist",
    tag: "Ships & operates end-to-end",
    text: letter(`
I'm applying for the [Role] position at [Company]. I'm a full-stack engineer who ships and operates production software end-to-end.

I built and now solo-operate Celebrately, a multi-tenant SaaS on React + Vite and Cloudflare with a PostgreSQL / row-level-security backend, automated client onboarding, and an RSVP engine — held to 278 automated tests behind GitHub → Cloudflare CI/CD, with daily production deploys and near-zero infrastructure cost. I also ran a zero-downtime migration from Supabase to Neon without interrupting live clients.

Before going full-stack I spent four years as a NetSuite engineer building SuiteScript customizations and REST/SOAP integrations — which taught me to value documentation, data integrity, and systems that don't break quietly.

What draws me to [Company] is [one specific reason]. I'd welcome the chance to talk about how I can help [team / goal].`),
  },
  {
    id: "netsuite",
    title: "NetSuite / ERP",
    tag: "SuiteScript + integrations depth",
    text: letter(`
I'm applying for the [Role] position at [Company], where I'd bring four years of NetSuite engineering and consulting.

I build SuiteScript 2.x / 2.1 customizations — Suitelets, RESTlets, User Event, Map/Reduce, and scheduled scripts — alongside saved searches, workflows, custom records, and REST/SOAP and ODBC integrations. As a consultant I translate business requirements into technical solutions with functional teams, and document them so they stay maintainable.

I've since expanded into full-stack development: I shipped and now operate a multi-tenant SaaS on Cloudflare with a PostgreSQL / row-level-security backend and full CI/CD. So I understand both the ERP core and the systems that surround it — and how to keep data trustworthy across them.

What draws me to [Company] is [one specific reason]. I'd welcome the chance to discuss how I can help [team / goal].`),
  },
  {
    id: "startup",
    title: "Startup builder",
    tag: "Fast, scrappy, owns the outcome",
    text: letter(`
I'm applying for the [Role] position at [Company]. I build fast and own the outcome.

Solo, I designed, shipped, and now operate Celebrately, a multi-tenant SaaS: React + Vite on Cloudflare, PostgreSQL with row-level security, automated onboarding that provisions each client with no manual steps, and an RSVP engine. It runs on 278 automated tests, GitHub → Cloudflare CI/CD, multiple deploys a day, and infrastructure cost pushed to near-zero with a serverless architecture. I handle everything from schema migrations to the admin console to support.

Before that, four years as a NetSuite engineer building integrations taught me to ship without breaking the things that matter.

At an early-stage team I'd move quickly and take real ownership. What draws me to [Company] is [one specific reason] — I'd love to help build [team / goal].`),
  },
  {
    id: "automation",
    title: "Automation / internal tools",
    tag: "Removes manual work, reliable systems",
    text: letter(`
I'm applying for the [Role] position at [Company]. I like removing manual work and making systems reliable.

I've built Zapier automations that clean and normalize lead data before it lands in a sheet, route GitHub issues to Discord, and back up email attachments to Drive — and I apply the same instinct to CI/CD: GitHub → Cloudflare pipelines with automated tests gating every deploy. On Celebrately, the multi-tenant SaaS I built and operate, I automated client onboarding end-to-end — server-side provisioning plus a set-password email — so a new client goes live untouched.

My four years as a NetSuite engineer building REST/SOAP integrations grounded all of this in data integrity and clear documentation.

I'd help [Company] cut manual toil and ship with confidence. What draws me here is [one specific reason] — I'd welcome a conversation about [team / goal].`),
  },
  {
    id: "frontend",
    title: "Frontend / product",
    tag: "Craft + engineering rigor",
    text: letter(`
I'm applying for the [Role] position at [Company]. I'm a product-minded frontend engineer who cares how things look and feel, not just whether they work.

I built Celebrately's multi-tenant frontend in React + Vite and my own portfolio at jeremydv.com — responsive layouts, light/dark theming, print-perfect PDF generation, and small interaction details — all backed by real engineering: a PostgreSQL / row-level-security backend, Cloudflare, 278 automated tests, and GitHub → Cloudflare CI/CD.

I sweat the polish while keeping the codebase tested and shippable, and a four-year background as a NetSuite engineer keeps me honest about data and edge cases.

I'd love to bring that blend of craft and rigor to [Company]'s product. What draws me here is [one specific reason] — I'd welcome the chance to talk about [team / goal].`),
  },
];

export function CoverLetters() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (l: Letter) => {
    try {
      await navigator.clipboard.writeText(l.text);
    } catch {
      // fallback for older/blocked clipboard API
      const ta = document.createElement("textarea");
      ta.value = l.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(l.id);
    window.setTimeout(() => setCopied((c) => (c === l.id ? null : c)), 1600);
  };

  return (
    <Layout>
      <h1 className="page-title">cover letters</h1>
      <p className="page-intro">
        Five angles on the same story — pick the one that fits the role, hit copy, and fill in the
        <code> [bracketed] </code> bits.
      </p>

      <div className="cover-list">
        {LETTERS.map((l) => (
          <article className="cover-card" key={l.id}>
            <div className="cover-head">
              <div>
                <h2 className="cover-title">{l.title}</h2>
                <span className="cover-tag">{l.tag}</span>
              </div>
              <button
                className={`btn copy-btn${copied === l.id ? " ok" : ""}`}
                type="button"
                onClick={() => copy(l)}
              >
                {copied === l.id ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <pre className="cover-body">{l.text}</pre>
          </article>
        ))}
      </div>
    </Layout>
  );
}
