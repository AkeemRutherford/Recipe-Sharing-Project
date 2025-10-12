import { supabase } from './supabase';

export interface SiteAsset {
  id: string;
  asset_type: string;
  variant: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  width?: number;
  height?: number;
  file_size: number;
  mime_type: string;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export async function uploadSiteAsset(
  file: File,
  assetType: 'logo' | 'favicon' | 'og-image' | 'thumbnail' | 'hero-image' | 'icon' | 'banner',
  variant: string = 'primary'
): Promise<SiteAsset> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload assets');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        const img = new Image();
        img.onload = async () => {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-site-asset`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file_data: base64Data,
              file_name: file.name,
              asset_type: assetType,
              variant,
              mime_type: file.type,
              width: img.width,
              height: img.height,
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to upload asset');
          }

          resolve(result.asset);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image dimensions'));
        };

        img.src = base64Data;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function getSiteAsset(
  assetType: string,
  variant: string = 'primary'
): Promise<SiteAsset | null> {
  const { data, error } = await supabase
    .from('site_assets')
    .select('*')
    .eq('asset_type', assetType)
    .eq('variant', variant)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site asset:', error);
    return null;
  }

  return data;
}

export async function getAllSiteAssets(
  assetType?: string
): Promise<SiteAsset[]> {
  let query = supabase
    .from('site_assets')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching site assets:', error);
    return [];
  }

  return data || [];
}

export async function deactivateSiteAsset(assetId: string): Promise<boolean> {
  const { error } = await supabase
    .from('site_assets')
    .update({ is_active: false })
    .eq('id', assetId);

  if (error) {
    console.error('Error deactivating asset:', error);
    return false;
  }

  return true;
}
