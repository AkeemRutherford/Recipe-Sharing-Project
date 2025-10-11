/*
  # Add Cascade Deletes for Recipe Relationships

  1. Cascade Deletes
    - Update foreign key constraints to cascade deletes for:
      - recipe_likes
      - recipe_saves
      - comments
      - recipe_modifications
      - activities
      - notifications
    - When a recipe is deleted, all related data is automatically removed
  
  2. Important Notes
    - All associated data (comments, likes, saves, etc.) will be permanently removed when recipe is deleted
    - This implements hard delete (permanent removal)
*/

-- Recipe likes cascade
DO $$ 
BEGIN
  ALTER TABLE recipe_likes
  DROP CONSTRAINT IF EXISTS recipe_likes_recipe_id_fkey;
  
  ALTER TABLE recipe_likes
  ADD CONSTRAINT recipe_likes_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;

-- Recipe saves cascade
DO $$ 
BEGIN
  ALTER TABLE recipe_saves
  DROP CONSTRAINT IF EXISTS recipe_saves_recipe_id_fkey;
  
  ALTER TABLE recipe_saves
  ADD CONSTRAINT recipe_saves_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;

-- Comments cascade
DO $$ 
BEGIN
  ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS comments_recipe_id_fkey;
  
  ALTER TABLE comments
  ADD CONSTRAINT comments_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;

-- Recipe modifications cascade
DO $$ 
BEGIN
  ALTER TABLE recipe_modifications
  DROP CONSTRAINT IF EXISTS recipe_modifications_recipe_id_fkey;
  
  ALTER TABLE recipe_modifications
  ADD CONSTRAINT recipe_modifications_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;

-- Activities cascade
DO $$ 
BEGIN
  ALTER TABLE activities
  DROP CONSTRAINT IF EXISTS activities_recipe_id_fkey;
  
  ALTER TABLE activities
  ADD CONSTRAINT activities_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;

-- Notifications cascade
DO $$ 
BEGIN
  ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_recipe_id_fkey;
  
  ALTER TABLE notifications
  ADD CONSTRAINT notifications_recipe_id_fkey 
    FOREIGN KEY (recipe_id) 
    REFERENCES recipes(id) 
    ON DELETE CASCADE;
END $$;