import { useState } from "react";
import { api } from "../api";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/api/auth/login", { email, password });
      onLogin();
    } catch (err) {
      setError((err as { message?: string }).message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-login" onSubmit={submit}>
      <h1 style={{ fontSize: 22, marginTop: 0 }}>Admin login</h1>
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className="field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button className="btn primary" type="submit" disabled={busy} style={{ width: "100%" }}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
