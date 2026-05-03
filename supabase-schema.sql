-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Admin',
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create about_config table
CREATE TABLE IF NOT EXISTS about_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT NOT NULL,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default about config
INSERT INTO about_config (id, name, initials, title, location, bio, skills, experience)
VALUES (
  1,
  'Sylive Chu',
  'SC',
  'Full Stack Developer',
  'San Francisco, CA',
  'I''m a passionate full-stack developer with over 5 years of experience building web applications. I love creating elegant solutions to complex problems and sharing my knowledge with the community.

When I''m not coding, you can find me hiking, reading, or exploring new coffee shops in the city.',
  '["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "Tailwind CSS"]'::jsonb,
  '[{"title": "Senior Developer", "company": "Tech Company Inc.", "period": "2022 - Present"}, {"title": "Full Stack Developer", "company": "Startup XYZ", "period": "2020 - 2022"}, {"title": "Junior Developer", "company": "Web Agency ABC", "period": "2019 - 2020"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Insert default photos
INSERT INTO photos (id, title, category) VALUES
  ('1', 'Mountain View', 'Nature'),
  ('2', 'City Lights', 'Urban'),
  ('3', 'Ocean Sunset', 'Nature'),
  ('4', 'Forest Path', 'Nature'),
  ('5', 'Street Art', 'Urban'),
  ('6', 'Desert Dunes', 'Nature'),
  ('7', 'Architecture', 'Urban'),
  ('8', 'Autumn Leaves', 'Nature'),
  ('9', 'Night Sky', 'Nature')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for posts" ON posts;
DROP POLICY IF EXISTS "Public read access for about_config" ON about_config;
DROP POLICY IF EXISTS "Public read access for photos" ON photos;
DROP POLICY IF EXISTS "Authenticated write access for posts" ON posts;
DROP POLICY IF EXISTS "Authenticated write access for about_config" ON about_config;
DROP POLICY IF EXISTS "Authenticated write access for photos" ON photos;

-- Create policies for public read access
CREATE POLICY "Public read access for posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Public read access for about_config" ON about_config
  FOR SELECT USING (true);

CREATE POLICY "Public read access for photos" ON photos
  FOR SELECT USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Authenticated write access for posts" ON posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access for about_config" ON about_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write access for photos" ON photos
  FOR ALL USING (auth.role() = 'authenticated');
