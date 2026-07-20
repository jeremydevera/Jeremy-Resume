-- Featured flag: which projects appear on the Home page (max 10)
ALTER TABLE projects ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;
