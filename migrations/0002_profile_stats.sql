-- Hero stat tiles (200K+ / community style) + optional location/headline.
ALTER TABLE site_profile ADD COLUMN stats TEXT NOT NULL DEFAULT '[]';
ALTER TABLE site_profile ADD COLUMN location TEXT NOT NULL DEFAULT '';
