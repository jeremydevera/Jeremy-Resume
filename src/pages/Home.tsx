import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { HomeData } from "../types";
import { Layout } from "../components/Layout";
import { ProjectsDisplay } from "../components/ProjectLayouts";
import { initials } from "../components/util";

export function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    api
      .get<HomeData>("/api/home")
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load"));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (active === "all") return data.projects;
    return data.projects.filter((p) => p.category_slug === active);
  }, [data, active]);

  if (error) return <Layout><div className="state">couldn’t load — {error}</div></Layout>;
  if (!data) return <Layout><div className="state">loading…</div></Layout>;

  const p = data.profile;
  const usedSlugs = new Set(data.projects.map((x) => x.category_slug));
  const cats = data.categories.filter((c) => usedSlugs.has(c.slug));
  const socials = p?.socials ?? [];
  const stats = (p?.stats ?? []).slice(0, 4);
  const layout = p?.home_layout || "list";

  return (
    <Layout>
      {/* Hero */}
      <section className="hero">
        {p?.avatar_url ? (
          <div className="avatar-wrap">
            <img className="avatar" src={p.avatar_url} alt={p.name} />
          </div>
        ) : (
          <div className="avatar-ph">{initials(p?.name || "P")}</div>
        )}
        <div>
          {p?.available_for_hire && (
            <div className="avail">
              <span className="dot" /> available for work
            </div>
          )}
          <h1>{p?.name || "Portfolio"}</h1>
          {p?.bio && <p className="bio">{p.bio}</p>}
          {p?.tagline && <p className="bio sub">{p.tagline}</p>}
          <div className="socials">
            {socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                {s.label} <span className="arr">↗</span>
              </a>
            ))}
            {p?.email && <a href={`mailto:${p.email}`}>email</a>}
          </div>
          <Link to="/resume" className="btn-resume">
            Download résumé (PDF) ↓
          </Link>
        </div>
      </section>

      {stats.length > 0 && (
        <div className="stats">
          {stats.map((s, i) =>
            s.href ? (
              <a className="stat" key={i} href={s.href} target="_blank" rel="noreferrer">
                <div className="v">
                  {s.value} <span className="arr">↗</span>
                </div>
                <div className="l">{s.label}</div>
              </a>
            ) : (
              <div className="stat" key={i}>
                <div className="v">{s.value}</div>
                <div className="l">{s.label}</div>
              </div>
            ),
          )}
        </div>
      )}

      <div className="dots" />

      {/* Projects */}
      <section className="section" id="projects">
        <div className="section-head">
          <span className="n">
            01 — <b>projects</b>
          </span>
          <Link className="more" to="/projects">
            all projects →
          </Link>
        </div>

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

        {filtered.length === 0 ? (
          <div className="state">no projects yet</div>
        ) : (
          <ProjectsDisplay projects={filtered} layout={layout} hideCover />
        )}
      </section>

      {/* Experience */}
      {data.resume.length > 0 && (
        <section className="section exp" id="experience">
          <div className="section-head">
            <span className="n">
              02 — <b>experience</b>
            </span>
            <Link className="more" to="/experience">
              full history →
            </Link>
          </div>
          {data.resume.map((r) => (
            <div className="row" key={r.id}>
              <div className="year">{r.period}</div>
              <div>
                <div className="role">{r.role}</div>
                <div className="org">{[r.org, r.location].filter(Boolean).join(" · ")}</div>
              </div>
            </div>
          ))}
        </section>
      )}
    </Layout>
  );
}
