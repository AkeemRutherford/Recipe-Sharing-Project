/*
  # Initial Schema Setup for KollabKitchen

  ## Overview
  Creates the complete database schema for a collaborative recipe sharing platform with authentication, recipes, modifications, likes, and notifications.

  ## Tables Created

  ### 1. profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. recipes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `image_url` (text)
  - `prep_time` (text)
  - `cook_time` (text)
  - `servings` (integer)
  - `difficulty` (text)
  - `tags` (text array)
  - `ingredients` (jsonb array)
  - `instructions` (text array)
  - `likes_count` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. recipe_modifications
  - `id` (uuid, primary key)
  - `recipe_id` (uuid, references recipes)
  - `user_id` (uuid, references profiles)
  - `modification_type` (text: 'substitution', 'addition', 'tip', 'question')
  - `description` (text)
  - `change_data` (jsonb)
  - `likes_count` (integer, default 0)
  - `created_at` (timestamptz)

  ### 4. recipe_likes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `recipe_id` (uuid, references recipes)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, recipe_id)

  ### 5. modification_likes
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `modification_id` (uuid, references recipe_modifications)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, modification_id)

  ### 6. notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `recipe_id` (uuid, references recipes)
  - `modification_id` (uuid, references recipe_modifications, nullable)
  - `notification_type` (text: 'modification', 'like', 'comment')
  - `message` (text)
  - `read` (boolean, default false)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can read their own profile and update their own data
  - Users can create recipes and read all public recipes
  - Users can create modifications on any recipe
  - Users can like recipes and modifications
  - Users can only see their own notifications
  - All policies check authentication and ownership
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  prep_time text,
  cook_time text,
  servings integer DEFAULT 4,
  difficulty text DEFAULT 'Easy',
  tags text[] DEFAULT '{}',
  ingredients jsonb DEFAULT '[]'::jsonb,
  instructions text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Recipe modifications table
CREATE TABLE IF NOT EXISTS recipe_modifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  modification_type text NOT NULL CHECK (modification_type IN ('substitution', 'addition', 'tip', 'question')),
  description text NOT NULL,
  change_data jsonb DEFAULT '{}'::jsonb,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_modifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modifications"
  ON recipe_modifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create modifications"
  ON recipe_modifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own modifications"
  ON recipe_modifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own modifications"
  ON recipe_modifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Recipe likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all recipe likes"
  ON recipe_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own recipe likes"
  ON recipe_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe likes"
  ON recipe_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Modification likes table
CREATE TABLE IF NOT EXISTS modification_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  modification_id uuid REFERENCES recipe_modifications(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, modification_id)
);

ALTER TABLE modification_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all modification likes"
  ON modification_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own modification likes"
  ON modification_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own modification likes"
  ON modification_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  modification_id uuid REFERENCES recipe_modifications(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('modification', 'like', 'comment')),
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_modifications_recipe_id ON recipe_modifications(recipe_id);
CREATE INDEX IF NOT EXISTS idx_modifications_created_at ON recipe_modifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update likes count on recipes
CREATE OR REPLACE FUNCTION public.update_recipe_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes SET likes_count = likes_count + 1 WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes SET likes_count = likes_count - 1 WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS recipe_likes_count_trigger ON recipe_likes;
CREATE TRIGGER recipe_likes_count_trigger
  AFTER INSERT OR DELETE ON recipe_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_recipe_likes_count();

-- Function to update likes count on modifications
CREATE OR REPLACE FUNCTION public.update_modification_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipe_modifications SET likes_count = likes_count + 1 WHERE id = NEW.modification_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipe_modifications SET likes_count = likes_count - 1 WHERE id = OLD.modification_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS modification_likes_count_trigger ON modification_likes;
CREATE TRIGGER modification_likes_count_trigger
  AFTER INSERT OR DELETE ON modification_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_modification_likes_count();

-- Function to create notification when modification is added
CREATE OR REPLACE FUNCTION public.create_modification_notification()
RETURNS trigger AS $$
DECLARE
  recipe_owner_id uuid;
  actor_name text;
BEGIN
  SELECT user_id INTO recipe_owner_id FROM recipes WHERE id = NEW.recipe_id;
  SELECT full_name INTO actor_name FROM profiles WHERE id = NEW.user_id;
  
  IF recipe_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, recipe_id, modification_id, actor_id, notification_type, message)
    VALUES (
      recipe_owner_id,
      NEW.recipe_id,
      NEW.id,
      NEW.user_id,
      'modification',
      actor_name || ' suggested a ' || NEW.modification_type || ' on your recipe'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS modification_notification_trigger ON recipe_modifications;
CREATE TRIGGER modification_notification_trigger
  AFTER INSERT ON recipe_modifications
  FOR EACH ROW EXECUTE FUNCTION public.create_modification_notification();