/*
  # Add Comment Likes System

  1. New Tables
    - `comment_likes`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, foreign key to comments)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - Unique constraint on (comment_id, user_id)

  2. Changes to Existing Tables
    - Add `likes_count` to `comments` table (integer, default 0)

  3. Triggers
    - Auto-update likes_count when comment_likes are added/removed

  4. Security
    - Enable RLS on comment_likes
    - Users can like/unlike comments
    - Users can view all likes
*/

-- Add likes_count to comments table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE comments ADD COLUMN likes_count integer DEFAULT 0;
  END IF;
END $$;

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
  ON comment_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update comment likes_count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating likes_count
DROP TRIGGER IF EXISTS comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_likes_count();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_likes_count ON comments(likes_count DESC);
