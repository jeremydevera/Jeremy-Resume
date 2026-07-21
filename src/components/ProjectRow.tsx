import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { initials } from "./util";

export function ProjectRow({
  project,
  hideCover = false,
  showCategory = true,
}: {
  project: ProjectListItem;
  hideCover?: boolean;
  showCategory?: boolean;
}) {
  return (
    <Link to={`/projects/${project.slug}`} className="prow">
      {!hideCover && project.cover_url ? (
        <img className="pthumb" src={project.cover_url} alt={project.title} loading="lazy" />
      ) : (
        <div className="pthumb-ph">{initials(project.title)}</div>
      )}
      <div>
        <p className="ptitle">{project.title}</p>
        {project.tagline && <p className="pdesc">{project.tagline}</p>}
      </div>
      <div className="pmeta">
        {showCategory && project.category_name && <span className="cat-tag">{project.category_name}</span>}
      </div>
    </Link>
  );
}
