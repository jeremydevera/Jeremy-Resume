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
  const [contactSel, setContactSel] = useState<Set<string>>(new Set());
  const [intro, setIntro] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .get<HomeData>("/api/home")
      .then((d) => {
        setData(d);
        setSelected(new Set(d.projects.map((p) => p.id))); // all selected by default
        const ck = new Set<string>();
        if (d.profile?.email) ck.add("email");
        if (d.profile?.location) ck.add("location");
        (d.profile?.socials || []).forEach((s) => ck.add(s.url));
        setContactSel(ck); // all contacts shown by default
        setIntro(d.profile?.bio || ""); // editable opening intro (defaults to bio, not tagline)
        setReady(true);
      })
      .catch((e) => setError(e.message));
  }, []);

  const skills = useMemo(
    () => (data ? Array.from(new Set(data.resume.flatMap((e) => e.skills || []))) : []),
    [data],
  );

  const groups = useMemo(() => {
    if (!data) return [];
    const byCat = new Map<string, { key: string; name: string; projects: typeof data.projects }>();
    for (const pr of data.projects) {
      const key = pr.category_slug || "uncategorized";
      const name = pr.category_name || "Uncategorized";
      if (!byCat.has(key)) byCat.set(key, { key, name, projects: [] });
      byCat.get(key)!.projects.push(pr);
    }
    const order = [...data.categories.map((c) => c.slug), "uncategorized"];
    return [...byCat.values()].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  }, [data]);

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

  const toggleContact = (k: string) =>
    setContactSel((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const toggleExpand = (k: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  const toggleGroup = (ids: number[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allIn = ids.every((id) => next.has(id));
      ids.forEach((id) => (allIn ? next.delete(id) : next.add(id)));
      return next;
    });

  const contact = (
    <div className="r-contact">
      {p?.email && contactSel.has("email") && <span>{p.email}</span>}
      {p?.location && contactSel.has("location") && <span>{p.location}</span>}
      {(p?.socials || [])
        .filter((s) => contactSel.has(s.url))
        .map((s) => (
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
            {pr.summary ? (
              <div className="r-proj-desc" dangerouslySetInnerHTML={{ __html: pr.summary }} />
            ) : pr.tagline ? (
              <p className="r-proj-desc">{pr.tagline}</p>
            ) : null}
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
      {contact}
    </header>
  );

  const summary = intro.trim() && <p className="r-summary">{intro}</p>;

  const sheet =
    structure === "sidebar" ? (
      <div className={`resume-sheet struct-sidebar theme-${theme}`}>
        <aside className="r-aside">
          <h1 className="r-name">{p?.name || "Résumé"}</h1>
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

        <label className="rb-label">Opening introduction</label>
        <textarea
          className="rb-intro"
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={4}
          placeholder="Short intro paragraph for the top of your résumé…"
        />

        <label className="rb-label">Contact to show</label>
        <div className="rb-projects">
          {p?.email && (
            <label className="rb-check">
              <input type="checkbox" checked={contactSel.has("email")} onChange={() => toggleContact("email")} />
              <span>Email</span>
            </label>
          )}
          {p?.location && (
            <label className="rb-check">
              <input type="checkbox" checked={contactSel.has("location")} onChange={() => toggleContact("location")} />
              <span>Location</span>
            </label>
          )}
          {(p?.socials || []).map((s) => (
            <label className="rb-check" key={s.url}>
              <input type="checkbox" checked={contactSel.has(s.url)} onChange={() => toggleContact(s.url)} />
              <span>{s.label}</span>
            </label>
          ))}
          {!p?.email && !p?.location && (p?.socials || []).length === 0 && (
            <span className="rb-empty">No contacts on your profile yet.</span>
          )}
        </div>

        <label className="rb-label">Projects to include ({selected.size}/{data.projects.length})</label>
        <div className="rb-groups">
          {groups.map((g) => {
            const ids = g.projects.map((pr) => pr.id);
            const sel = ids.filter((id) => selected.has(id)).length;
            const open = expanded.has(g.key);
            return (
              <div className="rb-group" key={g.key}>
                <div className="rb-group-head">
                  <button
                    type="button"
                    className="rb-group-toggle"
                    onClick={() => toggleExpand(g.key)}
                    aria-expanded={open}
                  >
                    <span className="rb-caret">{open ? "▾" : "▸"}</span>
                    <span className="rb-group-name">{g.name}</span>
                    <span className="rb-group-count">{sel}/{ids.length}</span>
                  </button>
                  <input
                    type="checkbox"
                    title="Select all in category"
                    checked={sel === ids.length}
                    ref={(el) => {
                      if (el) el.indeterminate = sel > 0 && sel < ids.length;
                    }}
                    onChange={() => toggleGroup(ids)}
                  />
                </div>
                {open && (
                  <div className="rb-group-items">
                    {g.projects.map((pr) => (
                      <label className="rb-check" key={pr.id}>
                        <input type="checkbox" checked={selected.has(pr.id)} onChange={() => toggle(pr.id)} />
                        <span>{pr.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {data.projects.length === 0 && <span className="rb-empty">No projects yet.</span>}
        </div>
      </div>

      <div className="rb-preview">{sheet}</div>
    </div>
  );
}
