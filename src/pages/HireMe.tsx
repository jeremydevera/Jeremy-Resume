import { useEffect, useState } from "react";
import { api } from "../api";
import type { Profile } from "../types";
import { Layout } from "../components/Layout";

export function HireMe() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get<Profile>("/api/profile").then(setProfile).catch(() => setProfile(null));
  }, []);

  return (
    <Layout>
      <article className="article">
        <div className="eyebrow">get in touch</div>
        <h1>say hello</h1>
        <p className="tagline">
          {profile?.tagline || "For work, collabs, or just to say hi — drop me a line."}
        </p>
        <div className="socials" style={{ marginTop: 8 }}>
          {profile?.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
          {(profile?.socials ?? []).map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
              {s.label} <span className="arr">↗</span>
            </a>
          ))}
        </div>
        {profile?.email && (
          <div style={{ marginTop: 28 }}>
            <a className="btn primary" href={`mailto:${profile.email}`}>
              open mail app
            </a>
          </div>
        )}
      </article>
    </Layout>
  );
}
