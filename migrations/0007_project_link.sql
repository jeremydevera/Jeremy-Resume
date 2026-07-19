-- External link for a project (live site, app store, repo, ...).
ALTER TABLE projects ADD COLUMN link_url TEXT NOT NULL DEFAULT '';
