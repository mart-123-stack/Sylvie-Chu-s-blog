-- Initialize blog database schema
-- Used by docker-entrypoint-initdb.d/

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

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);

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

-- Game scores for Pixel Run leaderboard
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);

-- Visitor tracking for world map visualization
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL DEFAULT '/',
  country TEXT,
  city TEXT,
  lat REAL,
  lon REAL,
  country_code TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);
