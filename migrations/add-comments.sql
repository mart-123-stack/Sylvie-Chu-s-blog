-- Run this in Supabase SQL Editor to add the comments table

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);

-- Allow public access (RLS was disabled globally)
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
