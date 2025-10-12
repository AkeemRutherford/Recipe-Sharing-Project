import React, { useState, useEffect } from 'react';
import { uploadSiteAsset, getAllSiteAssets, deactivateSiteAsset, SiteAsset } from '../lib/uploadSiteAssets';
import Header from '../components/Header';

export default function SiteAssets() {
  const [assets, setAssets] = useState<SiteAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState<'logo' | 'favicon' | 'og-image' | 'thumbnail' | 'hero-image' | 'icon' | 'banner'>('logo');
  const [variant, setVariant] = useState('primary');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const data = await getAllSiteAssets();
    setAssets(data);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const asset = await uploadSiteAsset(selectedFile, assetType, variant);
      setMessage({ type: 'success', text: `${assetType} uploaded successfully!` });
      setSelectedFile(null);
      await loadAssets();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeactivate = async (assetId: string) => {
    if (!confirm('Are you sure you want to deactivate this asset?')) return;

    const success = await deactivateSiteAsset(assetId);
    if (success) {
      setMessage({ type: 'success', text: 'Asset deactivated' });
      await loadAssets();
    } else {
      setMessage({ type: 'error', text: 'Failed to deactivate asset' });
    }
  };

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.asset_type]) {
      acc[asset.asset_type] = [];
    }
    acc[asset.asset_type].push(asset);
    return acc;
  }, {} as Record<string, SiteAsset[]>);

  return (
    <div className="min-h-screen" style={{ background: 'var(--forklore-cream)' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
          Site Assets Management
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="p-6 rounded-xl bg-white border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
              Upload New Asset
            </h2>

            {message && (
              <div
                className="mb-4 p-3 rounded-lg"
                style={{
                  background: message.type === 'success' ? 'rgba(139, 195, 74, 0.1)' : 'rgba(196, 69, 54, 0.1)',
                  border: `1px solid ${message.type === 'success' ? 'var(--forklore-forest-green)' : 'var(--forklore-warm-red)'}`,
                  color: message.type === 'success' ? 'var(--forklore-forest-green)' : 'var(--forklore-warm-red)'
                }}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                  Asset Type
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                >
                  <option value="logo">Logo</option>
                  <option value="favicon">Favicon</option>
                  <option value="og-image">OG Image</option>
                  <option value="thumbnail">Thumbnail</option>
                  <option value="hero-image">Hero Image</option>
                  <option value="icon">Icon</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                  Variant
                </label>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  placeholder="primary, dark, square, etc."
                  className="w-full px-4 py-2 rounded-lg border-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                  Select File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm" style={{ color: 'var(--forklore-warm-brown)' }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="btn-primary w-full py-3 rounded-full font-semibold"
              >
                {uploading ? 'Uploading...' : 'Upload Asset'}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
              Quick Start
            </h2>
            <p className="mb-4" style={{ color: 'var(--forklore-warm-brown)' }}>
              Use the Initialize Assets page to automatically upload the Forklore logo and create multiple variants.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
            Current Assets
          </h2>

          {loading ? (
            <p style={{ color: 'var(--forklore-warm-brown)' }}>Loading assets...</p>
          ) : assets.length === 0 ? (
            <p style={{ color: 'var(--forklore-warm-brown)' }}>No assets uploaded yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAssets).map(([type, typeAssets]) => (
                <div key={type} className="p-6 rounded-xl bg-white border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
                  <h3 className="text-xl font-bold mb-4 capitalize" style={{ color: 'var(--forklore-forest-green)' }}>
                    {type.replace('-', ' ')}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeAssets.map((asset) => (
                      <div key={asset.id} className="border rounded-lg p-4" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
                        <img
                          src={asset.public_url}
                          alt={`${asset.asset_type} - ${asset.variant}`}
                          className="w-full h-32 object-contain mb-2 bg-gray-50 rounded"
                        />
                        <p className="font-semibold mb-1" style={{ color: 'var(--forklore-forest-green)' }}>
                          {asset.variant}
                        </p>
                        <p className="text-sm mb-2" style={{ color: 'var(--forklore-warm-brown)' }}>
                          {asset.width} × {asset.height}px
                        </p>
                        <p className="text-xs mb-3 truncate" style={{ color: 'var(--forklore-warm-brown)' }}>
                          {asset.file_name}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(asset.public_url, '_blank')}
                            className="text-sm px-3 py-1 rounded bg-blue-100 hover:bg-blue-200"
                            style={{ color: 'var(--forklore-forest-green)' }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeactivate(asset.id)}
                            className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200"
                            style={{ color: 'var(--forklore-warm-red)' }}
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
