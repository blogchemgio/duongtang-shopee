ALTER TABLE comments ADD COLUMN post_slug TEXT;
ALTER TABLE comments ADD COLUMN author_name TEXT;
ALTER TABLE comments ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE comments ADD COLUMN created_at TEXT;

UPDATE comments
SET author_name = author
WHERE author_name IS NULL;

UPDATE comments
SET post_slug = 'legacy/unknown'
WHERE post_slug IS NULL;

UPDATE comments
SET status = 'approved'
WHERE status IS NULL;

UPDATE comments
SET created_at = datetime('now')
WHERE created_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
