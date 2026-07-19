-- Layout pickers for the standalone pages.
-- projects_layout: cards | list | grid-3 | grid-4
-- experience_layout: timeline | list
ALTER TABLE site_profile ADD COLUMN projects_layout TEXT NOT NULL DEFAULT 'cards';
ALTER TABLE site_profile ADD COLUMN experience_layout TEXT NOT NULL DEFAULT 'timeline';
