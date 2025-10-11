/*
  # Add User Onboarding Schema

  1. New Fields to profiles table
    - onboarding_completed (boolean, default false)
    - display_name (text)
    - cooking_experience (text)
    - dietary_practices (text array)
    - dietary_restrictions (text array)
    - health_goals (text array)
    - favorite_cuisines (text array)
    - favorite_meal_types (text array)
    - favorite_cooking_styles (text array)
    - community_goals (text array)
    - email_notifications (boolean, default true)
    - comment_notifications (boolean, default true)
    - follower_notifications (boolean, default true)
    - trending_notifications (boolean, default false)
    - profile_privacy (text, default 'public')
    - onboarding_completed_at (timestamp)

  2. Description
    These fields support personalized recipe recommendations and
    community features based on user preferences collected during
    onboarding.
*/

-- Add onboarding fields to profiles table
DO $$
BEGIN
  -- Onboarding status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at') THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;

  -- Profile info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cooking_experience') THEN
    ALTER TABLE profiles ADD COLUMN cooking_experience text CHECK (cooking_experience IN ('beginner', 'home_cook', 'experienced', 'seasoned', 'professional'));
  END IF;

  -- Dietary preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dietary_practices') THEN
    ALTER TABLE profiles ADD COLUMN dietary_practices text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dietary_restrictions') THEN
    ALTER TABLE profiles ADD COLUMN dietary_restrictions text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'health_goals') THEN
    ALTER TABLE profiles ADD COLUMN health_goals text[] DEFAULT '{}';
  END IF;

  -- Recipe preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_cuisines') THEN
    ALTER TABLE profiles ADD COLUMN favorite_cuisines text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_meal_types') THEN
    ALTER TABLE profiles ADD COLUMN favorite_meal_types text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_cooking_styles') THEN
    ALTER TABLE profiles ADD COLUMN favorite_cooking_styles text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'community_goals') THEN
    ALTER TABLE profiles ADD COLUMN community_goals text[] DEFAULT '{}';
  END IF;

  -- Notification preferences
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_notifications') THEN
    ALTER TABLE profiles ADD COLUMN email_notifications boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'comment_notifications') THEN
    ALTER TABLE profiles ADD COLUMN comment_notifications boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'follower_notifications') THEN
    ALTER TABLE profiles ADD COLUMN follower_notifications boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trending_notifications') THEN
    ALTER TABLE profiles ADD COLUMN trending_notifications boolean DEFAULT false;
  END IF;

  -- Privacy
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_privacy') THEN
    ALTER TABLE profiles ADD COLUMN profile_privacy text DEFAULT 'public' CHECK (profile_privacy IN ('public', 'private'));
  END IF;
END $$;

-- Create index for filtering by preferences
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_practices ON profiles USING GIN (dietary_practices);
CREATE INDEX IF NOT EXISTS idx_profiles_favorite_cuisines ON profiles USING GIN (favorite_cuisines);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles (onboarding_completed);
