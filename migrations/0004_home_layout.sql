-- Home page projects layout: list | grid-3 | grid-4 | digest
ALTER TABLE site_profile ADD COLUMN home_layout TEXT NOT NULL DEFAULT 'list';
