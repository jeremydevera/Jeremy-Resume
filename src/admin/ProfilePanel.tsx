import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Profile, Social, Stat } from "../types";
import { useToast } from "./toast";
import { ImageCropper } from "./ImageCropper";

export function ProfilePanel() {
  const avatarInput = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);
  const [socials, setSocials] = useState<Social[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [homeLayout, setHomeLayout] = useState("list");
  const [projectsLayout, setProjectsLayout] = useState("cards");
  const [experienceLayout, setExperienceLayout] = useState("timeline");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .get<Profile | null>("/api/profile")
      .then((p) => {
        if (!p) return;
        setName(p.name || "");
        setTagline(p.tagline || "");
        setBio(p.bio || "");
        setEmail(p.email || "");
        setLocation(p.location || "");
        setAvatarKey(p.avatar_key || null);
        setAvailable(!!p.available_for_hire);
        setSocials(p.socials || []);
        setStats(p.stats || []);
        setHomeLayout(p.home_layout || "list");
        setProjectsLayout(p.projects_layout || "cards");
        setExperienceLayout(p.experience_layout || "timeline");
      })
      .catch(() => {});
  }, []);

  const uploadAvatar = async (file: File) => {
    setBusy(true);
    try {
      const { key } = await api.upload(file, "profile");
      setAvatarKey(key);
    } catch (e) {
      setError((e as { message?: string }).message || "Upload failed");
      toast("error", "Avatar upload failed");
    } finally {
      setBusy(false);
      setCropFile(null);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await api.put("/api/admin/profile", {
        name,
        tagline,
        bio,
        email,
        location,
        avatar_key: avatarKey,
        available_for_hire: available,
        socials: socials.filter((s) => s.label && s.url),
        stats: stats.filter((s) => s.value && s.label),
        home_layout: homeLayout,
        projects_layout: projectsLayout,
        experience_layout: experienceLayout,
      });
      setNotice("Profile saved.");
      toast("success", "Profile saved to database");
    } catch (err) {
      setError((err as { message?: string }).message || "Save failed");
      toast("error", (err as { message?: string }).message || "Save failed — not written");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    <form onSubmit={save}>
      <div className="toolbar">
        <h1>Profile</h1>
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {notice && <div className="notice">{notice}</div>}

      <div className="field">
        <label>Home layout — how projects show on the homepage</label>
        <select value={homeLayout} onChange={(e) => setHomeLayout(e.target.value)}>
          <option value="list">List (rows)</option>
          <option value="grid-3">3 columns</option>
          <option value="grid-4">4 columns</option>
          <option value="digest">Digest (featured + list)</option>
          <option value="featured">Featured (big card + grid)</option>
          <option value="compact">Compact (dense text rows)</option>
          <option value="masonry">Masonry (staggered columns)</option>
        </select>
      </div>

      <div className="row-2">
        <div className="field">
          <label>Projects page layout</label>
          <select value={projectsLayout} onChange={(e) => setProjectsLayout(e.target.value)}>
            <option value="cards">Big cards</option>
            <option value="list">List (rows)</option>
            <option value="grid-3">3 columns</option>
            <option value="grid-4">4 columns</option>
            <option value="digest">Digest (featured + list)</option>
            <option value="featured">Featured (big card + grid)</option>
            <option value="compact">Compact (dense text rows)</option>
            <option value="masonry">Masonry (staggered columns)</option>
          </select>
        </div>
        <div className="field">
          <label>Experience page layout</label>
          <select value={experienceLayout} onChange={(e) => setExperienceLayout(e.target.value)}>
            <option value="timeline">Timeline (monograms)</option>
            <option value="list">Simple list</option>
            <option value="cards">Cards (2-column)</option>
            <option value="compact">Compact (one-liners)</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Avatar</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {avatarKey ? (
            <img
              src={`/img/${avatarKey}`}
              alt="avatar"
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "var(--muted)", fontSize: 14 }}>No avatar</span>
          )}
          <button className="btn" type="button" onClick={() => avatarInput.current?.click()}>
            Upload
          </button>
          {avatarKey && (
            <button className="btn danger" type="button" onClick={() => setAvatarKey(null)}>
              Remove
            </button>
          )}
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files?.[0]) setCropFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          {cropFile && (
            <ImageCropper
              file={cropFile}
              defaultAspect={1}
              onDone={uploadAvatar}
              onCancel={() => setCropFile(null)}
            />
          )}
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Metro Manila" />
      </div>

      <div className="field">
        <label>Tagline</label>
        <input value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </div>

      <div className="field">
        <label>Bio</label>
        <input value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div className="field">
        <label className="checkbox">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Available for hire
        </label>
      </div>

      <div className="field">
        <label>Social links</label>
        {socials.map((s, i) => (
          <div className="img-item" key={i}>
            <input
              placeholder="Label (e.g. GitHub)"
              value={s.label}
              onChange={(e) =>
                setSocials((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
              }
            />
            <input
              placeholder="https://…"
              value={s.url}
              onChange={(e) =>
                setSocials((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
              }
            />
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                setSocials((prev) => prev.filter((_, j) => j !== i));
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="btn"
          type="button"
          onClick={() => setSocials((prev) => [...prev, { label: "", url: "" }])}
        >
          + Add link
        </button>
      </div>

      <div className="field">
        <label>Stat tiles (hero) — value + label, optional link</label>
        {stats.map((s, i) => (
          <div className="img-item" key={i}>
            <input
              placeholder="Value (e.g. 8+ yrs)"
              value={s.value}
              onChange={(e) =>
                setStats((prev) => prev.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
              }
            />
            <input
              placeholder="Label (e.g. shipping)"
              value={s.label}
              onChange={(e) =>
                setStats((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
              }
            />
            <input
              placeholder="Link (optional)"
              value={s.href || ""}
              onChange={(e) =>
                setStats((prev) => prev.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))
              }
            />
            <button
              className="btn danger"
              type="button"
              onClick={() => {
                setStats((prev) => prev.filter((_, j) => j !== i));
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="btn"
          type="button"
          onClick={() => setStats((prev) => [...prev, { value: "", label: "", href: "" }])}
        >
          + Add stat
        </button>
      </div>
    </form>
    <PasswordCard />
    </>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/change-password", { current, next });
      setNotice("Password changed. Other sessions were signed out.");
      toast("success", "Password changed in database");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError((err as { message?: string }).message || "Change failed");
      toast("error", (err as { message?: string }).message || "Password change failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
      <div className="toolbar">
        <h1>Change password</h1>
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {notice && <div className="notice">{notice}</div>}
      <div className="field">
        <label>Current password</label>
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
      </div>
      <div className="row-2">
        <div className="field">
          <label>New password (min 8 chars)</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required />
        </div>
        <div className="field">
          <label>Confirm new password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
        </div>
      </div>
    </form>
  );
}
