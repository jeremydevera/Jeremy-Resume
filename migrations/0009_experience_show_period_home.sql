-- Per-entry toggle: show the period on the Home experience section
ALTER TABLE resume_entries ADD COLUMN show_period_home INTEGER NOT NULL DEFAULT 1;
