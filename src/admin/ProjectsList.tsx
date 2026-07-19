import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import type { ProjectListItem } from "../types";
import { useToast } from "./toast";

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const load = () =>
    api
      .get<ProjectListItem[]>("/api/admin/projects")
      .then(setProjects)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number, title: string) => {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    try {
      await api.del(`/api/admin/projects/${id}`);
      toast("success", `Deleted “${title}” from database`);
      load();
    } catch (e) {
      toast("error", (e as { message?: string }).message || "Delete failed — not saved");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Projects</h1>
        <Link to="/admin/projects/new" className="btn primary">
          + New project
        </Link>
      </div>
      {error && <div className="error">{error}</div>}
      {projects.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No projects yet. Create your first one.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/admin/projects/${p.id}`}>{p.title}</Link>
                </td>
                <td>{p.category_name || "—"}</td>
                <td>
                  <span className={`tag ${p.status}`}>{p.status}</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn danger" onClick={() => remove(p.id, p.title)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
