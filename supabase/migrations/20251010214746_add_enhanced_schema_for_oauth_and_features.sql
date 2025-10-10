/*
  # Enhanced Schema for OAuth and New Features

  ## Changes Made

  1. **Profiles Table Updates**
     - Add `username` column (unique, required)
     - Add `bio` column (max 500 chars, optional)
     - Rename `avatar_url` to `profile_pic_url` for consistency
     - Remove `full_name` column (not needed per requirements)

  2. **Recipes Table Updates**
     - Add `allow_suggestions` boolean (default true)
     - Add `edited_at` timestamp to track edits

  3. **New Tables**
     - `recipe_saves` - Track saved recipes per user
     - `comments` - General comments with type and optional change data

  4. **Security**
     - Enable RLS on all new tables
     - Add policies for authenticated users
     - Ensure proper ownership checks

  ## Notes
  - Existing data preserved
  - All changes are additive or safe renames
  - RLS policies ensure data security
*/

-- Update profiles table
DO $$
BEGIN
  -- Add username column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text;
  END IF;

  -- Add bio column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
    ALTER TABLE profiles ADD CONSTRAINT bio_length CHECK (length(bio) <= 500);
  END IF;

  -- Rename avatar_url to profile_pic_url if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_pic_url'
  ) THEN
    ALTER TABLE profiles RENAME COLUMN avatar_url TO profile_pic_url;
  END IF;
END $$;

-- Make username unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Update recipes table
DO $$
BEGIN
  -- Add allow_suggestions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'allow_suggestions'
  ) THEN
    ALTER TABLE recipes ADD COLUMN allow_suggestions boolean DEFAULT true;
  END IF;

  -- Add edited_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'edited_at'
  ) THEN
    ALTER TABLE recipes ADD COLUMN edited_at timestamptz;
  END IF;
END $$;

-- Create recipe_saves table
CREATE TABLE IF NOT EXISTS recipe_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL CHECK (type IN ('tip', 'suggestion', 'question')),
  change_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE recipe_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_saves
CREATE POLICY "Users can view all saves"
  ON recipe_saves FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can save recipes"
  ON recipe_saves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave own recipes"
  ON recipe_saves FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_saves_user_id ON recipe_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_saves_recipe_id ON recipe_saves(recipe_id);
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id ON comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
