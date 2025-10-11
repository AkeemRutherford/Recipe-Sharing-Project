/*
  # Fix Notification Trigger NULL Message Issue

  1. Problem
    - The `create_modification_notification` trigger was using `full_name` which can be NULL
    - When NULL is concatenated with text, the entire message becomes NULL
    - This causes the notification insert to fail due to NOT NULL constraint

  2. Solution
    - Update trigger to use COALESCE to fallback to username if full_name is NULL
    - This ensures the notification message is always valid
*/

CREATE OR REPLACE FUNCTION create_modification_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recipe_owner_id uuid;
  actor_name text;
BEGIN
  SELECT user_id INTO recipe_owner_id FROM recipes WHERE id = NEW.recipe_id;
  SELECT COALESCE(full_name, username, 'Someone') INTO actor_name FROM profiles WHERE id = NEW.user_id;

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