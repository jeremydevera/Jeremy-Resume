import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { HomeData } from "../types";
import { Layout } from "../components/Layout";
import { ProjectsDisplay } from "../components/ProjectLayouts";
import { hostOf, initials, stripHtml } from "../components/util";

export function ProjectsPage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState("all");

  useEffect(() => {
    api.get<HomeData>("/api/home").then(setData).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return active === "all" ? data.projects : data.projects.filter((p) => p.category_slug === active);
  }, [data, active]);

  if (error) return <Layout><div className="state">couldn’t load — {error}</div></Layout>;
  if (!data) return <Layout><div className="state">loading…</div></Layout>;

  const usedSlugs = new Set(data.projects.map((p) => p.category_slug));
  const cats = data.categories.filter((c) => usedSlugs.has(c.slug));
  const layout = data.profile?.projects_layout || "cards";

  return (
    <Layout>
      <h1 className="page-title">projects</h1>
      <p className="page-intro">
        Projects across NetSuite, website builds, and workflow automation — with the real problems
        solved in each.
      </p>

      {cats.length > 0 && (
        <div className="filters">
          <button className={`pill ${active === "all" ? "active" : ""}`} onClick={() => setActive("all")}>
            all
          </button>
          {cats.map((c) => (
            <button
              key={c.id}
              className={`pill ${active === c.slug ? "active" : ""}`}
              onClick={() => setActive(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {layout !== "cards" ? (
        <ProjectsDisplay projects={filtered} layout={layout} />
      ) : (
        <div className="pcards">
          {filtered.map((p) => (
            <div key={p.id} className="pcard">
              <Link to={`/projects/${p.slug}`} className="pcard-overlay" aria-label={p.title} />
              {p.cover_url ? (
                <img className="pcard-icon" src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="pcard-icon ph">{initials(p.title)}</div>
              )}
              <div className="pcard-body">
                <div className="pcard-tags">
                  {p.category_name && <span className="cat-pill">{p.category_name}</span>}
                </div>
                <h3 className="pcard-title">{p.title}</h3>
                {(p.summary || p.tagline) && (
                  <p className="pcard-desc">{stripHtml(p.summary || p.tagline || "")}</p>
                )}
                <span className="pcard-actions">
                  <span className="pcard-link">view project ↗</span>
                  {p.link_url && (
                    <a
                      className="pcard-ext"
                      href={p.link_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {hostOf(p.link_url)} ↗
                    </a>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
