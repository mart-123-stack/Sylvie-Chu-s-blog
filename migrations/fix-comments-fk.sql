-- Run this if comments table already exists (removes FK constraint)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_slug_fkey;

-- Or run this for a fresh table:
-- CREATE TABLE IF NOT EXISTS comments (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   post_slug TEXT NOT NULL,
--   author_name TEXT NOT NULL,
--   content TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
-- ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
