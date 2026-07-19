import { useEffect, useState } from "react";
import { api } from "../api";
import type { Category } from "../types";
import { useToast } from "./toast";
import { useConfirm } from "./confirm";

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () => api.get<Category[]>("/api/categories").then(setCategories).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSortOrder(0);
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setSortOrder(c.sort_order);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { name, slug: slug || slugify(name), sort_order: sortOrder };
    try {
      if (editing) await api.put(`/api/admin/categories/${editing.id}`, payload);
      else await api.post("/api/admin/categories", payload);
      toast("success", `Category “${payload.name}” saved to database`);
      reset();
      load();
    } catch (err) {
      setError((err as { message?: string }).message || "Save failed");
      toast("error", (err as { message?: string }).message || "Save failed — not written");
    }
  };

  const remove = async (c: Category) => {
    if (!(await confirm({ title: "Delete category", message: `Delete category “${c.name}”? Projects keep existing but lose this category.`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api.del(`/api/admin/categories/${c.id}`);
      toast("success", `Category “${c.name}” deleted from database`);
      load();
    } catch (err) {
      toast("error", (err as { message?: string }).message || "Delete failed — not saved");
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Categories</h1>
      </div>
      {error && <div className="error">{error}</div>}

      <form onSubmit={save} style={{ marginBottom: 30 }}>
        <div className="row-2">
          <div className="field">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. NetSuite"
            />
          </div>
          <div className="field">
            <label>Slug</label>
            <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
          </div>
        </div>
        <div className="field" style={{ maxWidth: 200 }}>
          <label>Sort order</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <button className="btn primary" type="submit">
          {editing ? "Update category" : "Add category"}
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
            <th>Name</th>
            <th>Slug</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td style={{ color: "var(--muted)" }}>{c.slug}</td>
              <td>{c.sort_order}</td>
              <td style={{ textAlign: "right" }}>
                <button className="btn" onClick={() => startEdit(c)}>
                  Edit
                </button>{" "}
                <button className="btn danger" onClick={() => remove(c)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
