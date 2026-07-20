import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { ProjectRow } from "./ProjectRow";
import { ProjectTile } from "./ProjectTile";
import { initials, stripHtml } from "./util";

/** Renders a project collection in the layout chosen in the admin. */
export function ProjectsDisplay({
  projects,
  layout,
  hideCover = false,
}: {
  projects: ProjectListItem[];
  layout: string;
  hideCover?: boolean;
}) {
  switch (layout) {
    case "grid-2":
    case "grid-3":
    case "grid-4":
    case "grid-5":
      return (
        <div className={`ptiles ${layout}`}>
          {projects.map((p) => (
            <ProjectTile key={p.id} project={p} />
          ))}
        </div>
      );
    case "tiles-xl":
      return (
        <div className="ptiles grid-2 tiles-xl">
          {projects.map((p) => (
            <ProjectTile key={p.id} project={p} />
          ))}
        </div>
      );
    case "gallery":
      return (
        <div className="pgallery">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="pgallery-item">
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="pgallery-ph">{initials(p.title)}</div>
              )}
              <div className="pgallery-cap">
                <span className="pgallery-title">{p.title}</span>
                {p.category_name && <span className="pgallery-cat">{p.category_name}</span>}
              </div>
            </Link>
          ))}
        </div>
      );
    case "zigzag":
      return (
        <div className="pzigzag">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="pzig-row">
              {p.cover_url ? (
                <img className="pzig-img" src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="pzig-img ph">{initials(p.title)}</div>
              )}
              <div className="pzig-body">
                {p.category_name && <div className="ptile-cat">{p.category_name}</div>}
                <h3>{p.title}</h3>
                {(p.summary || p.tagline) && <p>{stripHtml(p.summary || p.tagline || "")}</p>}
                <span className="pcard-link">view project ↗</span>
              </div>
            </Link>
          ))}
        </div>
      );
    case "cover-list":
      return (
        <div className="pcoverlist">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="pcover-row">
              {p.cover_url ? (
                <img className="pcover-thumb" src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="pcover-thumb ph">{initials(p.title)}</div>
              )}
              <div className="pcover-body">
                <h3>{p.title}</h3>
                {(p.summary || p.tagline) && <p>{stripHtml(p.summary || p.tagline || "")}</p>}
              </div>
              {p.category_name && <span className="pcover-cat">{p.category_name}</span>}
            </Link>
          ))}
        </div>
      );
    case "numbered":
      return (
        <ol className="pnumbered">
          {projects.map((p, i) => (
            <li key={p.id}>
              <Link to={`/projects/${p.slug}`} className="pnum-row">
                <span className="pnum">{String(i + 1).padStart(2, "0")}</span>
                <div className="pnum-body">
                  <h3>{p.title}</h3>
                  {(p.summary || p.tagline) && <p>{stripHtml(p.summary || p.tagline || "")}</p>}
                </div>
                {p.category_name && <span className="pnum-cat">{p.category_name}</span>}
              </Link>
            </li>
          ))}
        </ol>
      );
    case "polaroid":
      return (
        <div className="ppolaroids">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="ppolaroid">
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="ppolaroid-ph">{initials(p.title)}</div>
              )}
              <div className="ppolaroid-cap">{p.title}</div>
            </Link>
          ))}
        </div>
      );
    case "mosaic":
      return (
        <div className="pmosaic">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className={`pmosaic-item${i === 0 ? " lead" : ""}`}
            >
              {p.cover_url ? (
                <img src={p.cover_url} alt={p.title} loading="lazy" />
              ) : (
                <div className="pmosaic-ph">{initials(p.title)}</div>
              )}
              <div className="pmosaic-cap">
                <span>{p.title}</span>
              </div>
            </Link>
          ))}
        </div>
      );
    case "stack":
      return (
        <div className="pstack">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className={`pstack-row${p.cover_url ? " has-cover" : ""}`}
              style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : undefined}
            >
              <div className="pstack-inner">
                {p.category_name && <span className="pstack-cat">{p.category_name}</span>}
                <h3>{p.title}</h3>
                {(p.summary || p.tagline) && <p>{stripHtml(p.summary || p.tagline || "")}</p>}
              </div>
            </Link>
          ))}
        </div>
      );
    case "index":
      return (
        <div className="pindex">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} className="pindex-row">
              <span className="pindex-title">{p.title}</span>
              <span className="pindex-cat">{p.category_name || ""}</span>
              <span className="pindex-arrow">↗</span>
            </Link>
          ))}
        </div>
      );
    case "spotlight":
      return <Spotlight projects={projects} />;
    case "digest":
      return <Digest projects={projects} hideCover={hideCover} />;
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
            <ProjectRow key={p.id} project={p} hideCover={hideCover} />
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
        {(p.summary || p.tagline) && <p>{stripHtml(p.summary || p.tagline || "")}</p>}
        <span className="pcard-link">view project ↗</span>
      </div>
    </Link>
  );
}

function Digest({ projects, hideCover = false }: { projects: ProjectListItem[]; hideCover?: boolean }) {
  const [lead, ...rest] = projects;
  if (!lead) return null;
  return (
    <div className="digest">
      <LeadCard p={lead} />
      {rest.length > 0 && (
        <div className="rows">
          {rest.map((p) => (
            <ProjectRow key={p.id} project={p} hideCover={hideCover} />
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

function Spotlight({ projects }: { projects: ProjectListItem[] }) {
  const [lead, ...rest] = projects;
  if (!lead) return null;
  return (
    <div className="pspotlight">
      <Link
        to={`/projects/${lead.slug}`}
        className={`pspot-lead${lead.cover_url ? " has-cover" : ""}`}
        style={lead.cover_url ? { backgroundImage: `url(${lead.cover_url})` } : undefined}
      >
        <div className="pspot-inner">
          {lead.category_name && <span className="pstack-cat">{lead.category_name}</span>}
          <h2>{lead.title}</h2>
          {(lead.summary || lead.tagline) && <p>{stripHtml(lead.summary || lead.tagline || "")}</p>}
          <span className="pcard-link">view project ↗</span>
        </div>
      </Link>
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
