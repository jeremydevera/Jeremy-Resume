import { Link, NavLink } from "react-router-dom";
import { type ReactNode } from "react";
import { ThemeSwitch } from "./ThemeSwitch";

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconBag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" />
  </svg>
);
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
  </svg>
);
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          ./portfolio
        </Link>
        <nav>
          <div className="nav-group">
            <NavLink className="nav-link" to="/projects">
              <IconGrid /> projects
            </NavLink>
            <NavLink className="nav-link" to="/experience">
              <IconBag /> experience
            </NavLink>
          </div>
          <div className="nav-group">
            <NavLink className="nav-link" to="/resume">
              <IconDownload /> résumé
            </NavLink>
            <NavLink className="nav-link" to="/hire-me">
              <IconMail /> hire me
            </NavLink>
          </div>
        </nav>
        <div className="sidebar-foot">
          <ThemeSwitch />
        </div>
      </aside>
      <main className="content">
        <div className="content-inner">{children}</div>
      </main>
    </div>
  );
}
