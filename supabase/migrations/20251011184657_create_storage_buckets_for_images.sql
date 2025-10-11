/*
  # Create Storage Buckets for Image Uploads

  1. New Storage Buckets
    - `recipe-images` - For recipe photos
    - `profile-pictures` - For user profile photos
    - `generated-images` - For AI-generated images

  2. Storage Policies
    - Public read access for all buckets (anyone can view)
    - Authenticated users can upload to their own folders
    - Users can update/delete their own files
    - Organized by user_id folders for better organization

  3. Security
    - File size limits enforced in application
    - File type validation in application
    - Path-based access control (users can only modify their own files)
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('recipe-images', 'recipe-images', true),
  ('profile-pictures', 'profile-pictures', true),
  ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view images (public read)
CREATE POLICY "Public Access for recipe images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'recipe-images');

CREATE POLICY "Public Access for profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Public Access for generated images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generated-images');

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload recipe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload generated images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own recipe images"
ON storage.objects FOR UPDATE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Users can update own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile-pictures');

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own recipe images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own generated images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
