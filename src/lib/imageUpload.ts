import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadImage(
  file: File,
  bucket: string = 'recipe-images',
  userId?: string
): Promise<UploadResult> {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please use JPG, PNG, or WebP');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = userId ? `${userId}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { url: publicUrl, path: filePath };
}

export function getImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please use JPG, PNG, or WebP' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 5MB' };
  }
  return { valid: true };
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}
