/*
  # Add Follow Notifications

  1. Updates
    - Update notifications table to support follow notifications
    - Make recipe_id nullable for follow notifications
    - Add 'follow' to notification_type enum

  2. Trigger
    - Create notification when someone follows you
*/

-- Update notification_type constraint to include 'follow'
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_notification_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check
  CHECK (notification_type IN ('modification', 'like', 'comment', 'follow'));

-- Make recipe_id nullable (it already is, but ensuring)
ALTER TABLE notifications ALTER COLUMN recipe_id DROP NOT NULL;

-- Create trigger function for follow notifications
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(full_name, username, 'Someone') INTO follower_name
  FROM profiles WHERE id = NEW.follower_id;

  INSERT INTO notifications (user_id, recipe_id, actor_id, notification_type, message)
  VALUES (
    NEW.following_id,
    NULL,
    NEW.follower_id,
    'follow',
    follower_name || ' started following you'
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_follow_notification ON follows;
CREATE TRIGGER trigger_follow_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();
