import { useEffect, useMemo, useRef, useState } from "react";
import type { ProjectListItem } from "../types";
import { initials } from "./util";

/**
 * Project thumbnail that auto-plays a cross-fade carousel when it has more
 * than one image:
 *   - pointer devices (desktop): plays while the tile is hovered
 *   - touch devices (mobile): plays while the tile is scrolled into view
 * With a single image (or none) it renders exactly like a plain thumbnail.
 *
 * `imgClass` carries the layout's sizing (e.g. "ptile-thumb" / "pcard-icon");
 * the carousel container reuses it so dimensions/borders/filters are unchanged.
 */
export function ProjectThumb({
  project,
  imgClass,
}: {
  project: ProjectListItem;
  imgClass: string;
}) {
  const frames = useMemo(() => {
    const f: string[] = [];
    if (project.cover_url) f.push(project.cover_url);
    for (const u of project.images ?? []) if (u && !f.includes(u)) f.push(u);
    return f;
  }, [project.cover_url, project.images]);

  const multi = frames.length > 1;
  const [idx, setIdx] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // pointer devices → hover; touch devices → in-view. Hover is bound to the
  // nearest tile ancestor because a card's clickable overlay sits above the
  // thumb and would otherwise swallow its mouseenter.
  useEffect(() => {
    if (!multi) return;
    const el = ref.current;
    if (!el) return;
    const host = (el.closest(".pcard, .ptile, .pmasonry-item") as HTMLElement | null) ?? el;
    const canHover =
      typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

    let io: IntersectionObserver | undefined;
    const enter = () => setActive(true);
    const leave = () => setActive(false);

    if (canHover) {
      host.addEventListener("mouseenter", enter);
      host.addEventListener("mouseleave", leave);
    } else if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => setActive(entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5),
        { threshold: [0, 0.5, 1] },
      );
      io.observe(el);
    }
    return () => {
      host.removeEventListener("mouseenter", enter);
      host.removeEventListener("mouseleave", leave);
      io?.disconnect();
    };
  }, [multi]);

  // advance frames while active; snap back to the cover when idle
  useEffect(() => {
    if (!multi || !active) {
      setIdx(0);
      return;
    }
    const t = window.setInterval(() => setIdx((i) => (i + 1) % frames.length), 1100);
    return () => window.clearInterval(t);
  }, [multi, active, frames.length]);

  if (frames.length === 0) {
    return <div className={`${imgClass} ph`}>{initials(project.title)}</div>;
  }

  if (!multi) {
    return <img className={imgClass} src={frames[0]} alt={project.title} loading="lazy" />;
  }

  return (
    <div ref={ref} className={`${imgClass} pthumb${active ? " is-playing" : ""}`}>
      {frames.map((src, i) => (
        <img
          key={src}
          className={`pthumb-frame${i === idx ? " on" : ""}`}
          src={src}
          alt={project.title}
          loading="lazy"
        />
      ))}
      <span className="pthumb-dots" aria-hidden="true">
        {frames.map((_, i) => (
          <span key={i} className={i === idx ? "on" : ""} />
        ))}
      </span>
    </div>
  );
}
