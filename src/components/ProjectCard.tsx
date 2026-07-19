import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { gradientFor, initials } from "./util";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link to={`/projects/${project.slug}`} className="card">
      {project.cover_url ? (
        <img className="thumb" src={project.cover_url} alt={project.title} loading="lazy" />
      ) : (
        <div className="placeholder" style={{ background: gradientFor(project.title) }}>
          {initials(project.title)}
        </div>
      )}
      <div className="body">
        {project.category_name && <div className="cat">{project.category_name}</div>}
        <h3>{project.title}</h3>
        {project.tagline && <p>{project.tagline}</p>}
      </div>
    </Link>
  );
}
