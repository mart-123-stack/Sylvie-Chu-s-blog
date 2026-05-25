-- Add avatar_url column to about_config for avatar upload support
ALTER TABLE about_config ADD COLUMN IF NOT EXISTS avatar_url TEXT;
