import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Certification } from "../types";
import { useToast } from "./toast";
import { useConfirm } from "./confirm";

export function CertificationsPanel() {
  const [entries, setEntries] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issued, setIssued] = useState("");
  const [url, setUrl] = useState("");
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () =>
    api.get<Certification[]>("/api/admin/certifications").then(setEntries).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setName("");
    setIssuer("");
    setIssued("");
    setUrl("");
    setFileKey(null);
    setFileType(null);
  };

  const startEdit = (c: Certification) => {
    setEditing(c);
    setName(c.name);
    setIssuer(c.issuer || "");
    setIssued(c.issued || "");
    setUrl(c.url || "");
    setFileKey(c.file_key || null);
    setFileType(c.file_type || null);
  };

  const uploadFile = async (file: File) => {
    setBusy(true);
    try {
      const { key } = await api.upload(file, "certifications");
      setFileKey(key);
      setFileType(file.type.includes("pdf") ? "pdf" : "image");
    } catch (e) {
      toast("error", (e as { message?: string }).message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const payload = { name, issuer, issued, url, file_key: fileKey, file_type: fileType };
    try {
      if (editing) await api.put(`/api/admin/certifications/${editing.id}`, payload);
      else await api.post("/api/admin/certifications", payload);
      toast("success", `Certification “${name}” saved`);
      reset();
      load();
    } catch (err) {
      toast("error", (err as { message?: string }).message || "Save failed");
    }
  };

  const remove = async (c: Certification) => {
    if (!(await confirm({ title: "Delete certification", message: `Delete “${c.name}”?`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api.del(`/api/admin/certifications/${c.id}`);
      toast("success", `Certification “${c.name}” deleted`);
      load();
    } catch (err) {
      toast("error", (err as { message?: string }).message || "Delete failed");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= entries.length) return;
    const arr = [...entries];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    setEntries(arr);
    try {
      await api.post("/api/admin/certifications/reorder", { ids: arr.map((c) => c.id) });
      toast("success", "Order updated");
    } catch {
      toast("error", "Reorder failed");
      load();
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Certifications</h1>
      </div>
      {error && <div className="error">{error}</div>}

      <form onSubmit={save} style={{ marginBottom: 30 }}>
        <div className="row-2">
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="NetSuite SuiteFoundation" />
          </div>
          <div className="field">
            <label>Issuer</label>
            <input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Oracle NetSuite" />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label>Issued (date / year)</label>
            <input value={issued} onChange={(e) => setIssued(e.target.value)} placeholder="2024" />
          </div>
          <div className="field">
            <label>Credential URL (optional)</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="field">
          <label>Certificate file (image or PDF)</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {fileKey ? (
              <a className="cert-file" href={`/img/${fileKey}`} target="_blank" rel="noreferrer">
                {fileType === "pdf" ? "📄 View PDF" : "🖼 View image"}
              </a>
            ) : (
              <span style={{ color: "var(--muted)", fontSize: 14 }}>No file</span>
            )}
            <button className="btn" type="button" onClick={() => fileInput.current?.click()} disabled={busy}>
              {busy ? "Uploading…" : fileKey ? "Replace file" : "Upload file"}
            </button>
            {fileKey && (
              <button className="btn danger" type="button" onClick={() => { setFileKey(null); setFileType(null); }}>
                Remove
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
            />
          </div>
        </div>
        <button className="btn primary" type="submit">
          {editing ? "Update certification" : "Add certification"}
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
            <th>Name</th>
            <th>Issuer</th>
            <th>File</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((c, i) => (
            <tr key={c.id}>
              <td>
                <button className="btn reorder" title="Up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>{" "}
                <button className="btn reorder" title="Down" disabled={i === entries.length - 1} onClick={() => move(i, 1)}>↓</button>
              </td>
              <td>{c.name}</td>
              <td style={{ color: "var(--muted)" }}>{c.issuer}</td>
              <td>
                {c.file_key ? (
                  <a href={`/img/${c.file_key}`} target="_blank" rel="noreferrer">
                    {c.file_type === "pdf" ? "PDF" : "image"}
                  </a>
                ) : (
                  <span style={{ color: "var(--faint)" }}>—</span>
                )}
              </td>
              <td>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "nowrap" }}>
                  <button className="btn" onClick={() => startEdit(c)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(c)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
