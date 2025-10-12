import { supabase } from './supabase';

interface UploadResult {
  success: boolean;
  asset?: any;
  error?: string;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

async function uploadAsset(
  file: File,
  assetType: string,
  variant: string,
  description: string
): Promise<UploadResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const base64Data = await fileToBase64(file);
    const dimensions = await getImageDimensions(file);

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
        variant: variant,
        mime_type: file.type,
        width: dimensions.width,
        height: dimensions.height,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Upload failed' };
    }

    console.log(`✅ Uploaded ${assetType} - ${variant}: ${description}`);
    return { success: true, asset: result.asset };
  } catch (error: any) {
    console.error(`❌ Failed to upload ${assetType} - ${variant}:`, error);
    return { success: false, error: error.message };
  }
}

export async function initializeForkloreAssets(): Promise<void> {
  console.log('🎨 Initializing Forklore site assets...');

  try {
    const logoPath = '/Screenshot 2025-10-11 152406.png';

    const response = await fetch(logoPath);
    if (!response.ok) {
      throw new Error(`Failed to load logo from ${logoPath}`);
    }

    const blob = await response.blob();
    const logoFile = new File([blob], 'forklore-logo.png', { type: 'image/png' });

    const uploads = [
      { type: 'logo', variant: 'primary', desc: 'Main Forklore logo' },
      { type: 'logo', variant: 'header', desc: 'Header navigation logo' },
      { type: 'logo', variant: 'footer', desc: 'Footer logo' },
      { type: 'thumbnail', variant: 'primary', desc: 'Primary site thumbnail' },
      { type: 'thumbnail', variant: 'small', desc: 'Small thumbnail for cards' },
      { type: 'og-image', variant: 'primary', desc: 'Open Graph image for social sharing' },
      { type: 'og-image', variant: 'home', desc: 'Homepage OG image' },
      { type: 'icon', variant: 'primary', desc: 'Primary icon' },
      { type: 'icon', variant: 'square', desc: 'Square icon for profiles' },
      { type: 'banner', variant: 'primary', desc: 'Primary banner image' },
    ];

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const upload of uploads) {
      const result = await uploadAsset(logoFile, upload.type, upload.variant, upload.desc);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`${upload.type}/${upload.variant}: ${result.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\nAsset initialization complete!');
    console.log('Refresh the page to see the new logo in the header.');

  } catch (error: any) {
    console.error('❌ Asset initialization failed:', error);
    throw error;
  }
}

export async function checkExistingAssets(): Promise<{ count: number; types: Record<string, number> }> {
  const { data, error } = await supabase
    .from('site_assets')
    .select('asset_type')
    .eq('is_active', true);

  if (error) {
    console.error('Error checking assets:', error);
    return { count: 0, types: {} };
  }

  const types = (data || []).reduce((acc, asset) => {
    acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return { count: data?.length || 0, types };
}

export async function initializeAssetsIfNeeded(): Promise<boolean> {
  const existing = await checkExistingAssets();

  if (existing.count > 0) {
    console.log(`ℹ️ Found ${existing.count} existing assets. Skipping initialization.`);
    console.log('Asset breakdown:', existing.types);
    return false;
  }

  console.log('📦 No assets found. Initializing...');
  await initializeForkloreAssets();
  return true;
}
