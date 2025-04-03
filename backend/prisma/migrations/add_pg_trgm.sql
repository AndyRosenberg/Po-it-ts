-- Enable the pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes to speed up fuzzy searches
CREATE INDEX IF NOT EXISTS idx_poem_title_trgm ON poems USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stanza_body_trgm ON stanzas USING gin (body gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_user_username_trgm ON users USING gin (username gin_trgm_ops);