import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { HomeData } from "../types";

const STRUCTURES = [
  { key: "classic", label: "Classic (single column)" },
  { key: "sidebar", label: "Sidebar (two column)" },
  { key: "timeline", label: "Timeline" },
  { key: "compact", label: "Compact (dense)" },
  { key: "modern", label: "Modern (header band)" },
  { key: "digest", label: "Digest (featured first)" },
];

const THEMES = [
  { key: "mono", label: "Mono (black & white)" },
  { key: "slate", label: "Slate" },
  { key: "navy", label: "Navy" },
  { key: "emerald", label: "Emerald" },
  { key: "crimson", label: "Crimson" },
  { key: "amber", label: "Amber" },
  { key: "serif", label: "Elegant serif" },
  { key: "tech", label: "Mono technical" },
];

export function ResumeBuilder() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [structure, setStructure] = useState("classic");
  const [theme, setTheme] = useState("mono");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .get<HomeData>("/api/home")
      .then((d) => {
        setData(d);
        setSelected(new Set(d.projects.map((p) => p.id))); // all selected by default
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, []);

  const skills = useMemo(
    () => (data ? Array.from(new Set(data.resume.flatMap((e) => e.skills || []))) : []),
    [data],
  );

  if (error) return <div className="rb-state">couldn’t load — {error}</div>;
  if (!data || !ready) return <div className="rb-state">loading…</div>;

  const p = data.profile;
  const chosenProjects = data.projects.filter((pr) => selected.has(pr.id));

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const contact = (
    <div className="r-contact">
      {p?.email && <span>{p.email}</span>}
      {p?.location && <span>{p.location}</span>}
      {(p?.socials || []).map((s) => (
        <a key={s.url} href={s.url}>
          {s.label}
        </a>
      ))}
    </div>
  );

  const experienceSection = (
    <section className="r-section">
      <h2 className="r-h2">Experience</h2>
      <div className="r-exp-list">
        {data.resume.map((e) => (
          <div className="r-exp" key={e.id}>
            <div className="r-exp-top">
              <span className="r-exp-role">{e.role}</span>
              <span className="r-exp-period">{e.period}</span>
            </div>
            <div className="r-exp-org">
              {[e.org, e.kind, e.location].filter(Boolean).join(" · ")}
            </div>
            {e.description && (
              <div className="r-exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const projectsSection = chosenProjects.length > 0 && (
    <section className="r-section">
      <h2 className="r-h2">Selected Projects</h2>
      <div className="r-proj-list">
        {chosenProjects.map((pr) => (
          <div className="r-proj" key={pr.id}>
            <div className="r-proj-top">
              <span className="r-proj-title">{pr.title}</span>
              {pr.category_name && <span className="r-proj-cat">{pr.category_name}</span>}
            </div>
            {(pr.summary || pr.tagline) && <p className="r-proj-desc">{pr.summary || pr.tagline}</p>}
            {pr.link_url && <span className="r-proj-link">{pr.link_url}</span>}
          </div>
        ))}
      </div>
    </section>
  );

  const skillsSection = skills.length > 0 && (
    <section className="r-section">
      <h2 className="r-h2">Skills</h2>
      <div className="r-skills">
        {skills.map((s) => (
          <span className="r-skill" key={s}>
            {s}
          </span>
        ))}
      </div>
    </section>
  );

  const header = (
    <header className="r-header">
      <h1 className="r-name">{p?.name || "Résumé"}</h1>
      {p?.tagline && <p className="r-tagline">{p.tagline}</p>}
      {contact}
    </header>
  );

  const summary = p?.bio && <p className="r-summary">{p.bio}</p>;

  const sheet =
    structure === "sidebar" ? (
      <div className={`resume-sheet struct-sidebar theme-${theme}`}>
        <aside className="r-aside">
          <h1 className="r-name">{p?.name || "Résumé"}</h1>
          {p?.tagline && <p className="r-tagline">{p.tagline}</p>}
          {contact}
          {skillsSection}
        </aside>
        <div className="r-primary">
          {summary}
          {experienceSection}
          {projectsSection}
        </div>
      </div>
    ) : (
      <div className={`resume-sheet struct-${structure} theme-${theme}`}>
        {header}
        {summary}
        {experienceSection}
        {projectsSection}
        {skillsSection}
      </div>
    );

  return (
    <div className="rb">
      <div className="rb-controls">
        <div className="rb-controls-head">
          <Link to="/" className="rb-back">
            ← back
          </Link>
          <button className="rb-download" onClick={() => window.print()}>
            Download PDF
          </button>
        </div>
        <p className="rb-hint">Pick a structure, theme, and which projects to include. Then Download PDF → save as PDF.</p>

        <label className="rb-label">Structure</label>
        <select value={structure} onChange={(e) => setStructure(e.target.value)}>
          {STRUCTURES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="rb-label">Theme</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          {THEMES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        <label className="rb-label">Projects to include ({selected.size}/{data.projects.length})</label>
        <div className="rb-projects">
          {data.projects.map((pr) => (
            <label className="rb-check" key={pr.id}>
              <input type="checkbox" checked={selected.has(pr.id)} onChange={() => toggle(pr.id)} />
              <span>{pr.title}</span>
            </label>
          ))}
          {data.projects.length === 0 && <span className="rb-empty">No projects yet.</span>}
        </div>
      </div>

      <div className="rb-preview">{sheet}</div>
    </div>
  );
}
