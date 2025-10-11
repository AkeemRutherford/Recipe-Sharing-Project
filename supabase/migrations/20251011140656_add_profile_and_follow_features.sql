/*
  # Add Profile and Follow Features

  1. Profile Updates
    - profiles table already has profile_pic_url
    - Add favorite_tags column (array of strings)
    - bio column already exists

  2. New Tables
    - `follows` table for user follow relationships
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles.id) - user doing the following
      - `following_id` (uuid, references profiles.id) - user being followed
      - `created_at` (timestamptz)
    - Unique constraint on (follower_id, following_id) to prevent duplicate follows

  3. Security
    - Enable RLS on follows table
    - Users can view all follows (for displaying followers/following lists)
    - Users can create follows (follow others)
    - Users can only delete their own follows (unfollow)
*/

-- Add favorite_tags to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'favorite_tags'
  ) THEN
    ALTER TABLE profiles ADD COLUMN favorite_tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follows
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
