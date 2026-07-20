import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import type { ProjectDetail } from "../types";
import { Layout } from "../components/Layout";
import { Markdown } from "../components/Markdown";
import { Carousel } from "../components/Carousel";
import { hostOf, initials } from "../components/util";

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProject(null);
    setError(null);
    api
      .get<ProjectDetail>(`/api/projects/${slug}`)
      .then(setProject)
      .catch((e) => setError(e.status === 404 ? "project not found" : e.message));
  }, [slug]);

  if (error) return <Layout><div className="state">{error}</div></Layout>;
  if (!project) return <Layout><div className="state">loading…</div></Layout>;

  return (
    <Layout>
      <article className="article">
        <Link to="/" className="back">
          ← back to projects
        </Link>
        {project.category_name && <div className="eyebrow">{project.category_name}</div>}
        <h1>{project.title}</h1>
        {project.tagline && <p className="tagline">{project.tagline}</p>}
        {project.link_url && (
          <p style={{ margin: "0 0 24px" }}>
            <a className="btn" href={project.link_url} target="_blank" rel="noreferrer">
              visit {hostOf(project.link_url)} ↗
            </a>
          </p>
        )}

        {(() => {
          const slides = [
            ...(project.cover_url ? [{ url: project.cover_url, alt: project.title }] : []),
            ...project.images.map((im) => ({ url: im.url, alt: im.alt || project.title })),
          ];
          return slides.length > 0 ? (
            <Carousel images={slides} />
          ) : (
            <div className="cover-ph">{initials(project.title)}</div>
          );
        })()}

        {project.body_markdown && <Markdown source={project.body_markdown} />}
      </article>
    </Layout>
  );
}
