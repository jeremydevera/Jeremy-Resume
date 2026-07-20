-- Per-project skills/tech tags (JSON array), shown on the downloaded résumé
ALTER TABLE projects ADD COLUMN skills TEXT NOT NULL DEFAULT '[]';
