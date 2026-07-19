import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import type { Category } from "../types";
import { useToast } from "./toast";
import { RichTextEditor } from "./RichTextEditor";
import { ImageCropper } from "./ImageCropper";

type GalleryImage = { r2_key: string; alt: string; url: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProjectEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState("draft");
  const [tagline, setTagline] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bodyMode, setBodyMode] = useState<"rich" | "markdown">("rich");
  // crop pipeline: files wait here until cropped (or used as-is), then upload
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropTarget, setCropTarget] = useState<"cover" | "gallery">("cover");

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(() => {});
    if (!isNew) {
      api
        .get<any>(`/api/admin/projects/${id}`)
        .then((p) => {
          setTitle(p.title);
          setSlug(p.slug);
          setSlugTouched(true);
          setCategoryId(p.category_id ? String(p.category_id) : "");
          setStatus(p.status);
          setTagline(p.tagline || "");
          setSummary(p.summary || "");
          setBody(p.body_markdown || "");
          setBodyMode((p.body_markdown || "").trimStart().startsWith("<") ? "rich" : "markdown");
          setSortOrder(p.sort_order || 0);
          setLinkUrl(p.link_url || "");
          setCoverKey(p.cover_image_key || null);
          setImages(
            (p.images || []).map((im: any) => ({
              r2_key: im.r2_key,
              alt: im.alt || "",
              url: `/img/${im.r2_key}`,
            })),
          );
        })
        .catch((e) => setError(e.message));
    }
  }, [id]);

  const onTitle = (v: string) => {
    setTitle(v);
    if (isNew && !slugTouched) setSlug(slugify(v));
  };

  // called by the cropper with the final (cropped or original) file
  const uploadCropped = async (file: File) => {
    setBusy(true);
    try {
      const { key } = await api.upload(file, `projects/${slug || "misc"}`);
      if (cropTarget === "cover") setCoverKey(key);
      else setImages((prev) => [...prev, { r2_key: key, alt: "", url: `/img/${key}` }]);
    } catch (e) {
      setError((e as { message?: string }).message || "Upload failed");
      toast("error", "Image upload failed");
    } finally {
      setBusy(false);
      setCropQueue((q) => q.slice(1)); // advance to next queued file (if any)
    }
  };

  const startCrop = (target: "cover" | "gallery", files: FileList) => {
    setCropTarget(target);
    setCropQueue(Array.from(files));
  };

  const save = async () => {
    setError(null);
    if (!title || !slug) {
      setError("Title and slug are required.");
      return;
    }
    setBusy(true);
    const payload = {
      title,
      slug,
      category_id: categoryId ? Number(categoryId) : null,
      status,
      tagline,
      summary,
      body_markdown: body,
      sort_order: sortOrder,
      link_url: linkUrl.trim(),
      cover_image_key: coverKey,
      images: images.map((im, i) => ({ r2_key: im.r2_key, alt: im.alt, sort_order: i })),
    };
    try {
      if (isNew) await api.post("/api/admin/projects", payload);
      else await api.put(`/api/admin/projects/${id}`, payload);
      toast("success", `“${title}” saved to database`);
      navigate("/admin/projects");
    } catch (e) {
      setError((e as { message?: string }).message || "Save failed");
      toast("error", (e as { message?: string }).message || "Save failed — not written");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1>{isNew ? "New project" : "Edit project"}</h1>
        <button className="btn" onClick={() => navigate("/admin/projects")}>
          Cancel
        </button>
        <button className="btn primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}

      <div className="field">
        <label>Title</label>
        <input value={title} onChange={(e) => onTitle(e.target.value)} />
      </div>

      <div className="row-2">
        <div className="field">
          <label>Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
          />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="field">
          <label>Sort order (lower = first)</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="field">
        <label>Tagline (shown on card)</label>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>

      <div className="field">
        <label>Summary</label>
        <input value={summary} onChange={(e) => setSummary(e.target.value)} />
      </div>

      <div className="field">
        <label>Project URL (live site / app / repo — shown on the card)</label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="field">
        <label>Cover image</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {coverKey ? (
            <img className="thumb-mini" src={`/img/${coverKey}`} alt="cover" />
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 14 }}>No cover</span>
          )}
          <button className="btn" onClick={() => coverInput.current?.click()} type="button">
            Upload cover
          </button>
          {coverKey && (
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                setCoverKey(null);
              }}
            >
              Remove
            </button>
          )}
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files?.length) startCrop("cover", e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      <div className="field">
        <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
          Body
          <span style={{ display: "inline-flex", gap: 6 }}>
            <button
              type="button"
              className={`pill ${bodyMode === "rich" ? "active" : ""}`}
              onClick={() => setBodyMode("rich")}
            >
              Rich text
            </button>
            <button
              type="button"
              className={`pill ${bodyMode === "markdown" ? "active" : ""}`}
              onClick={() => setBodyMode("markdown")}
            >
              Markdown
            </button>
          </span>
        </label>
        {bodyMode === "rich" ? (
          <RichTextEditor value={body} onChange={setBody} placeholder="Write the project story…" />
        ) : (
          <textarea value={body} onChange={(e) => setBody(e.target.value)} />
        )}
      </div>

      <div className="field">
        <label>Gallery / screenshots</label>
        {images.map((im, i) => (
          <div className="img-item" key={im.r2_key}>
            <img src={im.url} alt={im.alt} />
            <input
              placeholder="Alt text"
              value={im.alt}
              onChange={(e) =>
                setImages((prev) => prev.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))
              }
            />
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                setImages((prev) => prev.filter((_, j) => j !== i));
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="btn" type="button" onClick={() => galleryInput.current?.click()}>
          + Add images
        </button>
        <input
          ref={galleryInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) startCrop("gallery", e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {cropQueue.length > 0 && (
        <ImageCropper
          file={cropQueue[0]}
          defaultAspect={cropTarget === "cover" ? 16 / 10 : 4 / 3}
          onDone={uploadCropped}
          onCancel={() => setCropQueue([])}
        />
      )}
    </div>
  );
}
