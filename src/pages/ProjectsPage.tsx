import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { HomeData } from "../types";
import { Layout } from "../components/Layout";
import { ProjectsDisplay } from "../components/ProjectLayouts";
import { ProjectThumb } from "../components/ProjectThumb";
import { hostOf, stripHtml } from "../components/util";

export function ProjectsPage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    api.get<HomeData>("/api/home").then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setPage(1); // reset to first page when the filter changes
  }, [active]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return active === "all" ? data.projects : data.projects.filter((p) => p.category_slug === active);
  }, [data, active]);

  if (error) return <Layout><div className="state">couldn’t load — {error}</div></Layout>;
  if (!data) return <Layout><div className="state">loading…</div></Layout>;

  const usedSlugs = new Set(data.projects.map((p) => p.category_slug));
  const cats = data.categories.filter((c) => usedSlugs.has(c.slug));
  const layout = data.profile?.projects_layout || "cards";

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const goPage = (n: number) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        <ProjectsDisplay projects={pageItems} layout={layout} showCategory={active === "all"} />
      ) : (
        <div className="pcards">
          {pageItems.map((p) => (
            <div key={p.id} className="pcard">
              <Link to={`/projects/${p.slug}`} className="pcard-overlay" aria-label={p.title} />
              <ProjectThumb project={p} imgClass="pcard-icon" />
              <div className="pcard-body">
                <div className="pcard-tags">
                  {active === "all" && p.category_name && (
                    <span className="cat-pill">{p.category_name}</span>
                  )}
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

      {totalPages > 1 && (
        <div className="pager">
          <button className="pager-btn" disabled={current === 1} onClick={() => goPage(current - 1)}>
            ← prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`pager-num${n === current ? " active" : ""}`}
              onClick={() => goPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="pager-btn"
            disabled={current === totalPages}
            onClick={() => goPage(current + 1)}
          >
            next →
          </button>
        </div>
      )}
    </Layout>
  );
}
