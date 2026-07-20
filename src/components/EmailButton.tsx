import { useEffect, useState } from "react";

export function EmailButton({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — user can still select the address */
    }
  };

  return (
    <span className="emailpop">
      <button type="button" className="emailpop-trigger" onClick={() => setOpen((o) => !o)}>
        email <span className="arr">↗</span>
      </button>
      {open && (
        <>
          <span className="emailpop-backdrop" onClick={() => setOpen(false)} />
          <div className="emailpop-card" role="dialog" aria-label="Email">
            <span className="emailpop-addr">{email}</span>
            <div className="emailpop-actions">
              <button type="button" className="btn" onClick={copy}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <a className="btn" href={`mailto:${email}`}>
                Open mail app
              </a>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
