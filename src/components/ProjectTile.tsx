import { Link } from "react-router-dom";
import type { ProjectListItem } from "../types";
import { ProjectThumb } from "./ProjectThumb";

export function ProjectTile({ project }: { project: ProjectListItem }) {
  return (
    <Link to={`/projects/${project.slug}`} className="ptile">
      <ProjectThumb project={project} imgClass="ptile-thumb" />
      <div className="ptile-body">
        {project.category_name && <div className="ptile-cat">{project.category_name}</div>}
        <h3 className="ptile-title">{project.title}</h3>
        {project.tagline && <p className="ptile-desc">{project.tagline}</p>}
      </div>
    </Link>
  );
}
