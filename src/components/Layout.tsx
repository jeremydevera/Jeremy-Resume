import { NavLink } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { ThemeSwitch } from "./ThemeSwitch";


const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
  </svg>
);
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
export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <aside className="sidebar">
        <button
          className={`nav-burger${open ? " is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="burger-box">
            <span className="burger-bar" />
            <span className="burger-bar" />
            <span className="burger-bar" />
          </span>
        </button>
        <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
          <div className="nav-group">
            <NavLink className="nav-link" to="/" end>
              <IconHome /> portfolio
            </NavLink>
            <NavLink className="nav-link" to="/projects">
              <IconGrid /> projects
            </NavLink>
            <NavLink className="nav-link" to="/experience">
              <IconBag /> experience
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
