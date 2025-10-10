/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified by Supabase security advisor.

  ## Changes Made

  ### 1. Add Missing Indexes for Foreign Keys
  Creates indexes for all foreign key columns that were missing them:
  - `modification_likes.modification_id`
  - `notifications.actor_id`
  - `notifications.modification_id`
  - `notifications.recipe_id`
  - `recipe_likes.recipe_id`
  - `recipe_modifications.user_id`

  ### 2. Optimize RLS Policies
  Updates all RLS policies to use `(select auth.uid())` instead of `auth.uid()` to prevent re-evaluation for each row, improving query performance at scale.

  Policies updated:
  - All profiles policies (insert, update)
  - All recipes policies (insert, update, delete)
  - All recipe_modifications policies (insert, update, delete)
  - All recipe_likes policies (insert, delete)
  - All modification_likes policies (insert, delete)
  - All notifications policies (select, update)

  ### 3. Fix Function Search Paths
  Updates all functions to use immutable search paths by setting `search_path` explicitly:
  - `handle_new_user()`
  - `update_recipe_likes_count()`
  - `update_modification_likes_count()`
  - `create_modification_notification()`

  ## Security Impact
  - Prevents potential SQL injection via search_path manipulation
  - Improves RLS policy performance at scale
  - Optimizes foreign key lookups with proper indexes

  ## Performance Impact
  - Significantly improves query performance for large datasets
  - Reduces CPU usage for RLS policy evaluation
  - Speeds up foreign key constraint checking and joins
*/

-- =============================================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =============================================================================

-- Index for modification_likes.modification_id
CREATE INDEX IF NOT EXISTS idx_modification_likes_modification_id 
  ON modification_likes(modification_id);

-- Index for notifications.actor_id
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
  ON notifications(actor_id);

-- Index for notifications.modification_id
CREATE INDEX IF NOT EXISTS idx_notifications_modification_id 
  ON notifications(modification_id);

-- Index for notifications.recipe_id
CREATE INDEX IF NOT EXISTS idx_notifications_recipe_id 
  ON notifications(recipe_id);

-- Index for recipe_likes.recipe_id
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id 
  ON recipe_likes(recipe_id);

-- Index for recipe_modifications.user_id
CREATE INDEX IF NOT EXISTS idx_recipe_modifications_user_id 
  ON recipe_modifications(user_id);

-- =============================================================================
-- 2. OPTIMIZE RLS POLICIES - Use (select auth.uid()) instead of auth.uid()
-- =============================================================================

-- Profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Recipes table policies
DROP POLICY IF EXISTS "Users can create own recipes" ON recipes;
CREATE POLICY "Users can create own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Recipe modifications table policies
DROP POLICY IF EXISTS "Users can create modifications" ON recipe_modifications;
CREATE POLICY "Users can create modifications"
  ON recipe_modifications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own modifications" ON recipe_modifications;
CREATE POLICY "Users can update own modifications"
  ON recipe_modifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own modifications" ON recipe_modifications;
CREATE POLICY "Users can delete own modifications"
  ON recipe_modifications FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Recipe likes table policies
DROP POLICY IF EXISTS "Users can create own recipe likes" ON recipe_likes;
CREATE POLICY "Users can create own recipe likes"
  ON recipe_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own recipe likes" ON recipe_likes;
CREATE POLICY "Users can delete own recipe likes"
  ON recipe_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Modification likes table policies
DROP POLICY IF EXISTS "Users can create own modification likes" ON modification_likes;
CREATE POLICY "Users can create own modification likes"
  ON modification_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own modification likes" ON modification_likes;
CREATE POLICY "Users can delete own modification likes"
  ON modification_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =============================================================================
-- 3. FIX FUNCTION SEARCH PATHS - Set explicit search_path
-- =============================================================================

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

-- Fix update_recipe_likes_count function
CREATE OR REPLACE FUNCTION public.update_recipe_likes_count()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes SET likes_count = likes_count + 1 WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes SET likes_count = likes_count - 1 WHERE id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_modification_likes_count function
CREATE OR REPLACE FUNCTION public.update_modification_likes_count()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipe_modifications SET likes_count = likes_count + 1 WHERE id = NEW.modification_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipe_modifications SET likes_count = likes_count - 1 WHERE id = OLD.modification_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix create_modification_notification function
CREATE OR REPLACE FUNCTION public.create_modification_notification()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
