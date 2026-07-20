import { useEffect, useState } from "react";
import { api } from "../api";
import type { ResumeEntry } from "../types";
import { useToast } from "./toast";
import { useConfirm } from "./confirm";
import { RichTextEditor } from "./RichTextEditor";

export function ResumePanel() {
  const [entries, setEntries] = useState<ResumeEntry[]>([]);
  const [editing, setEditing] = useState<ResumeEntry | null>(null);
  const [period, setPeriod] = useState("");
  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState("");
  const [kind, setKind] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [showToHome, setShowToHome] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () => api.get<ResumeEntry[]>("/api/admin/resume").then(setEntries).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setPeriod("");
    setRole("");
    setOrg("");
    setLocation("");
    setKind("Full-time");
    setDescription("");
    setSkillsInput("");
    setShowToHome(true);
  };

  const startEdit = (r: ResumeEntry) => {
    setEditing(r);
    setPeriod(r.period);
    setRole(r.role);
    setOrg(r.org || "");
    setLocation(r.location || "");
    setKind(r.kind || "Full-time");
    setDescription(r.description || "");
    setSkillsInput((r.skills || []).join(", "));
    setShowToHome(!!r.show_period_home);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= entries.length) return;
    const arr = [...entries];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setEntries(arr); // optimistic
    try {
      await api.post("/api/admin/resume/reorder", { ids: arr.map((e) => e.id) });
      toast("success", "Experience order updated");
    } catch {
      toast("error", "Reorder failed — order not saved");
      load();
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      period,
      role,
      org,
      location,
      kind,
      description,
      skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      show_period_home: showToHome,
    };
    try {
      if (editing) await api.put(`/api/admin/resume/${editing.id}`, payload);
      else await api.post("/api/admin/resume", payload);
      toast("success", `Experience entry “${payload.role}” saved to database`);
      reset();
      load();
    } catch (err) {
      setError((err as { message?: string }).message || "Save failed");
      toast("error", (err as { message?: string }).message || "Save failed — not written");
    }
  };

  const remove = async (r: ResumeEntry) => {
    if (!(await confirm({ title: "Delete experience entry", message: `Delete experience entry “${r.role}”?`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api.del(`/api/admin/resume/${r.id}`);
      toast("success", `Experience entry “${r.role}” deleted from database`);
      load();
    } catch (err) {
      toast("error", (err as { message?: string }).message || "Delete failed — not saved");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Experience</h1>
      </div>
      {error && <div className="error">{error}</div>}

      <form onSubmit={save} style={{ marginBottom: 30 }}>
        <div className="row-2">
          <div className="field">
            <label>Period</label>
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2024–Now" />
          </div>
          <div className="field">
            <label>Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Automation Engineer" />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Organization</label>
            <input value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Type</label>
            <input value={kind} onChange={(e) => setKind(e.target.value)} placeholder="Full-time" />
          </div>
          <div className="field">
            <label>Skills (comma-separated)</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="NetSuite, SuiteScript, REST"
            />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>
        <div className="field">
          <label className="checkbox" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={showToHome} onChange={(e) => setShowToHome(e.target.checked)} />
            <span>SHOW DATE TO HOME <span style={{ color: "var(--muted)" }}>— shows the period on the homepage (the downloaded résumé always shows dates)</span></span>
          </label>
        </div>
        <button className="btn primary" type="submit">
          {editing ? "Update entry" : "Add entry"}
        </button>
        {editing && (
          <button className="btn" type="button" onClick={reset} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        )}
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 70 }}>Order</th>
            <th>Period</th>
            <th>Role</th>
            <th>Org</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((r, i) => (
            <tr key={r.id}>
              <td>
                <button className="btn reorder" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>{" "}
                <button
                  className="btn reorder"
                  title="Move down"
                  disabled={i === entries.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
              </td>
              <td>{r.period}</td>
              <td>{r.role}</td>
              <td style={{ color: "var(--muted)" }}>{[r.org, r.location].filter(Boolean).join(" · ")}</td>
              <td>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "nowrap" }}>
                  <button className="btn" onClick={() => startEdit(r)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={() => remove(r)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
