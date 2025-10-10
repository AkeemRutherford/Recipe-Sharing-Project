/*
  # Fix Profile Creation Trigger

  ## Changes
  - Update handle_new_user() function to use correct column names
  - Use profile_pic_url instead of avatar_url
  - Add username generation from email
  - Remove full_name references

  ## Security
  - Maintains existing RLS policies
*/

-- Drop and recreate the trigger function with correct column names
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, profile_pic_url)
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
