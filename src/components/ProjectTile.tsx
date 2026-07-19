import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { initials } from "./util";

export function ProjectTile({ project }: { project: ProjectListItem }) {
  return (
    <Link to={`/projects/${project.slug}`} className="ptile">
      {project.cover_url ? (
        <img className="ptile-thumb" src={project.cover_url} alt={project.title} loading="lazy" />
      ) : (
        <div className="ptile-thumb ph">{initials(project.title)}</div>
      )}
      <div className="ptile-body">
        {project.category_name && <div className="ptile-cat">{project.category_name}</div>}
        <h3 className="ptile-title">{project.title}</h3>
        {project.tagline && <p className="ptile-desc">{project.tagline}</p>}
      </div>
    </Link>
  );
}
