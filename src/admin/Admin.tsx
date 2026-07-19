import { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api";
import { ThemeSwitch } from "../components/ThemeSwitch";
import { ToastProvider } from "./toast";
import { Login } from "./Login";
import { ProjectsList } from "./ProjectsList";
import { ProjectEdit } from "./ProjectEdit";
import { CategoriesPanel } from "./CategoriesPanel";
import { ResumePanel } from "./ResumePanel";
import { ProfilePanel } from "./ProfilePanel";

type User = { id: number; email: string };

export function Admin() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const navigate = useNavigate();

  const load = () =>
    api
      .get<{ user: User | null }>("/api/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
      navigate("/admin/login");
    }
  };

  if (user === undefined) return <div className="state">Loading…</div>;

  return (
    <ToastProvider>
    <div className="admin">
      <Routes>
        <Route
          path="login"
          element={
            user ? (
              <Navigate to="/admin/projects" replace />
            ) : (
              <Login
                onLogin={async () => {
                  await load();
                  navigate("/admin/projects");
                }}
              />
            )
          }
        />
        <Route
          path=""
          element={user ? <Chrome email={user.email} onLogout={logout} /> : <Navigate to="/admin/login" replace />}
        >
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/new" element={<ProjectEdit />} />
          <Route path="projects/:id" element={<ProjectEdit />} />
          <Route path="categories" element={<CategoriesPanel />} />
          <Route path="resume" element={<ResumePanel />} />
          <Route path="profile" element={<ProfilePanel />} />
        </Route>
      </Routes>
    </div>
    </ToastProvider>
  );
}

function Chrome({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <>
      <div className="admin-bar">
        <div className="container inner">
          <span className="brand">Admin</span>
          <nav className="nav">
            <NavLink to="/admin/projects">Projects</NavLink>
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/resume">Experience</NavLink>
            <NavLink to="/admin/profile">Profile</NavLink>
          </nav>
          <span className="spacer" />
          <ThemeSwitch showLabel={false} />
          <a href="/" className="nav" style={{ color: "var(--muted)" }}>
            View site
          </a>
          <button className="btn" onClick={onLogout} title={`Signed in as ${email}`}>
            Log out
          </button>
        </div>
      </div>
      <div className="admin-main">
        <Outlet />
      </div>
    </>
  );
}
