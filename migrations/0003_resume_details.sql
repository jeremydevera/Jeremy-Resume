-- Richer experience entries: description + skill tags (bryllim-style timeline).
ALTER TABLE resume_entries ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE resume_entries ADD COLUMN skills TEXT NOT NULL DEFAULT '[]';
ALTER TABLE resume_entries ADD COLUMN kind TEXT NOT NULL DEFAULT 'Full-time';
