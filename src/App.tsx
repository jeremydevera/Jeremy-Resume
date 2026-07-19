import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { ProjectDetailPage } from "./pages/ProjectDetail";
import { HireMe } from "./pages/HireMe";
import { NotFound } from "./pages/NotFound";
import { Admin } from "./admin/Admin";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/hire-me" element={<HireMe />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
