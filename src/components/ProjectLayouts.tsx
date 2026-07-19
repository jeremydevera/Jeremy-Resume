import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { ProjectRow } from "./ProjectRow";
import { ProjectTile } from "./ProjectTile";
import { initials } from "./util";

/** Renders a project collection in the layout chosen in the admin. */
export function ProjectsDisplay({
  projects,
  layout,
}: {
  projects: ProjectListItem[];
  layout: string;
}) {
  switch (layout) {
    case "grid-3":
    case "grid-4":
      return (
        <div className={`ptiles ${layout}`}>
          {projects.map((p) => (
            <ProjectTile key={p.id} project={p} />
          ))}
        </div>
      );
    case "digest":
      return <Digest projects={projects} />;
    case "featured":
      return <Featured projects={projects} />;
    case "compact":
      return (
        <div className="pcompact">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="pcompact-row">
              <span className="pcompact-title">{p.title}</span>
              <span className="pcompact-dots" />
              {p.category_name && <span className="pcompact-cat">{p.category_name}</span>}
            </Link>
          ))}
        </div>
      );
    case "masonry":
      return (
        <div className="pmasonry">
          {projects.map((p) => (
            <div className="pmasonry-item" key={p.id}>
              <ProjectTile project={p} />
            </div>
          ))}
        </div>
      );
    default:
      // "list"
      return (
        <div className="rows">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      );
  }
}

function LeadCard({ p }: { p: ProjectListItem }) {
  return (
    <Link to={`/projects/${p.slug}`} className="digest-lead">
      {p.cover_url ? (
        <img className="lead-thumb" src={p.cover_url} alt={p.title} />
      ) : (
        <div className="lead-thumb ph">{initials(p.title)}</div>
      )}
      <div className="lead-body">
        {p.category_name && <div className="ptile-cat">{p.category_name}</div>}
        <h3>{p.title}</h3>
        {(p.summary || p.tagline) && <p>{p.summary || p.tagline}</p>}
        <span className="pcard-link">view project ↗</span>
      </div>
    </Link>
  );
}

function Digest({ projects }: { projects: ProjectListItem[] }) {
  const [lead, ...rest] = projects;
  if (!lead) return null;
  return (
    <div className="digest">
      <LeadCard p={lead} />
      {rest.length > 0 && (
        <div className="rows">
          {rest.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Featured({ projects }: { projects: ProjectListItem[] }) {
  const [lead, ...rest] = projects;
  if (!lead) return null;
  return (
    <div className="featured">
      <LeadCard p={lead} />
      {rest.length > 0 && (
        <div className="ptiles grid-3">
          {rest.map((p) => (
            <ProjectTile key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
