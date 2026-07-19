import { useEffect, useState } from "react";
import { api } from "../api";
import type { HomeData, ResumeEntry } from "../types";
import { Layout } from "../components/Layout";
import { initials } from "../components/util";

export function ExperiencePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<HomeData>("/api/home")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Layout><div className="state">couldn’t load — {error}</div></Layout>;
  if (!data) return <Layout><div className="state">loading…</div></Layout>;
  const resume = data.resume;
  const layout = data.profile?.experience_layout || "timeline";

  return (
    <Layout>
      <h1 className="page-title">experience</h1>
      <p className="page-intro">
        Building automation, systems, and the web — here’s the path so far, and what I worked on
        along the way.
      </p>

      {layout === "list" ? (
        <div className="exp">
          {resume.map((e) => (
            <div className="row" key={e.id}>
              <div className="year">{e.period}</div>
              <div>
                <div className="role">{e.role}</div>
                <div className="org">{[e.org, e.kind, e.location].filter(Boolean).join(" · ")}</div>
                {e.description && (
                  <div className="exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : layout === "cards" ? (
        <div className="exp-cards">
          {resume.map((e) => (
            <div className="exp-card" key={e.id}>
              <div className="exp-monogram">{initials(e.org || e.role)}</div>
              <div className="exp-role-date">{e.period}</div>
              <div className="exp-card-role">{e.role}</div>
              <div className="exp-metaline">{[e.org, e.kind, e.location].filter(Boolean).join(" · ")}</div>
              {e.description && (
                <div className="exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
              )}
              {e.skills?.length > 0 && (
                <div className="exp-skills">
                  {e.skills.map((s) => (
                    <span className="skill-tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : layout === "compact" ? (
        <div className="exp-compact">
          {resume.map((e) => (
            <div className="exp-compact-row" key={e.id}>
              <span className="exp-role-date">{e.period}</span>
              <span className="exp-compact-role">{e.role}</span>
              <span className="pcompact-dots" />
              <span className="exp-metaline">{e.org}</span>
            </div>
          ))}
        </div>
      ) : layout === "grid" ? (
        <div className="exp-grid">
          {resume.map((e) => (
            <div className="exp-card" key={e.id}>
              <div className="exp-monogram">{initials(e.org || e.role)}</div>
              <div className="exp-role-date">{e.period}</div>
              <div className="exp-card-role">{e.role}</div>
              <div className="exp-metaline">{[e.org, e.kind, e.location].filter(Boolean).join(" · ")}</div>
              {e.description && (
                <div className="exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
              )}
              {e.skills?.length > 0 && (
                <div className="exp-skills">
                  {e.skills.map((s) => (
                    <span className="skill-tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : layout === "numbered" ? (
        <ol className="exp-numbered">
          {resume.map((e, i) => (
            <li className="exp-num-row" key={e.id}>
              <span className="exp-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="exp-num-body">
                <div className="exp-card-role">{e.role}</div>
                <div className="exp-metaline">{[e.org, e.kind, e.location].filter(Boolean).join(" · ")}</div>
                <div className="exp-role-date">{e.period}</div>
                {e.description && (
                  <div className="exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="timeline">
          {resume.map((e) => (
            <div className="exp-item" key={e.id}>
              <div className="exp-monogram">{initials(e.org || e.role)}</div>
              <div className="exp-content">
                <div className="exp-company">{e.org || e.role}</div>
                <div className="exp-metaline">
                  {[e.kind, e.location].filter(Boolean).join(" · ")}
                </div>
                <div className="exp-role">
                  <div className="exp-role-title">{e.role}</div>
                  <div className="exp-role-date">{e.period}</div>
                  {e.description && (
                  <div className="exp-desc" dangerouslySetInnerHTML={{ __html: e.description }} />
                )}
                  {e.skills?.length > 0 && (
                    <div className="exp-skills">
                      {e.skills.map((s) => (
                        <span className="skill-tag" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
