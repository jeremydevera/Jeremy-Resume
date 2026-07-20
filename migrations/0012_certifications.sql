-- Certifications: title + issuer + optional image/PDF proof, shown on the résumé
CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  issuer TEXT,
  issued TEXT,
  file_key TEXT,
  file_type TEXT,
  url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
