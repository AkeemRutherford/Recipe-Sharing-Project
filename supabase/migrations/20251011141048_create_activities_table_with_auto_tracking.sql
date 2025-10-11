/*
  # Create Activities Table with Auto-Tracking

  1. New Table
    - `activities` table to track all user actions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id) - who performed the action
      - `activity_type` (text) - type of activity
      - `recipe_id` (uuid, nullable) - for recipe-related activities
      - `target_user_id` (uuid, nullable) - for follow activities
      - `comment_id` (uuid, nullable) - for comment activities
      - `metadata` (jsonb) - flexible field for additional data
      - `created_at` (timestamptz)

  2. Activity Types
    - posted_recipe
    - commented
    - liked
    - saved
    - followed

  3. Triggers
    - Auto-create activity when recipe is posted
    - Auto-create activity when comment is made
    - Auto-create activity when recipe is liked
    - Auto-create activity when recipe is saved
    - Auto-create activity when user follows another user

  4. Security
    - Enable RLS
    - Users can view their own activities
    - Users can view public activities of others
    - Only system can create activities (via triggers)
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('posted_recipe', 'commented', 'liked', 'saved', 'followed')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES recipe_modifications(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_recipe ON activities(recipe_id);

-- Trigger Functions

-- Auto-track recipe posts
CREATE OR REPLACE FUNCTION track_recipe_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, recipe_id, metadata)
  VALUES (
    NEW.user_id,
    'posted_recipe',
    NEW.id,
    jsonb_build_object('recipe_title', NEW.title)
  );
  RETURN NEW;
END;
$$;

-- Auto-track comments
CREATE OR REPLACE FUNCTION track_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, recipe_id, comment_id, metadata)
  VALUES (
    NEW.user_id,
    'commented',
    NEW.recipe_id,
    NEW.id,
    jsonb_build_object('comment_type', NEW.modification_type)
  );
  RETURN NEW;
END;
$$;

-- Auto-track likes
CREATE OR REPLACE FUNCTION track_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, recipe_id)
  VALUES (NEW.user_id, 'liked', NEW.recipe_id);
  RETURN NEW;
END;
$$;

-- Auto-track saves
CREATE OR REPLACE FUNCTION track_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, recipe_id)
  VALUES (NEW.user_id, 'saved', NEW.recipe_id);
  RETURN NEW;
END;
$$;

-- Auto-track follows
CREATE OR REPLACE FUNCTION track_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, target_user_id)
  VALUES (NEW.follower_id, 'followed', NEW.following_id);
  RETURN NEW;
END;
$$;

-- Create Triggers

DROP TRIGGER IF EXISTS trigger_track_recipe_post ON recipes;
CREATE TRIGGER trigger_track_recipe_post
  AFTER INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION track_recipe_post();

DROP TRIGGER IF EXISTS trigger_track_comment ON recipe_modifications;
CREATE TRIGGER trigger_track_comment
  AFTER INSERT ON recipe_modifications
  FOR EACH ROW
  EXECUTE FUNCTION track_comment();

DROP TRIGGER IF EXISTS trigger_track_like ON recipe_likes;
CREATE TRIGGER trigger_track_like
  AFTER INSERT ON recipe_likes
  FOR EACH ROW
  EXECUTE FUNCTION track_like();

DROP TRIGGER IF EXISTS trigger_track_save ON recipe_saves;
CREATE TRIGGER trigger_track_save
  AFTER INSERT ON recipe_saves
  FOR EACH ROW
  EXECUTE FUNCTION track_save();

DROP TRIGGER IF EXISTS trigger_track_follow ON follows;
CREATE TRIGGER trigger_track_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION track_follow();
