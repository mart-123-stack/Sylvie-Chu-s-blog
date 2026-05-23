-- Phase 3: Tags, search support

ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
