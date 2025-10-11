import React, { useState, useRef } from 'react';
import { uploadImage, getImagePreview, validateImageFile } from '../lib/imageUpload';
import { useAuth } from '../contexts/AuthContext';

interface ImageUploadProps {
  onImageUploaded: (url: string, path: string) => void;
  currentImageUrl?: string;
  bucket?: string;
  label?: string;
}

export default function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  bucket = 'recipe-images',
  label = 'Recipe Image'
}: ImageUploadProps) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    try {
      const previewUrl = await getImagePreview(file);
      setPreview(previewUrl);

      setUploading(true);
      const result = await uploadImage(file, bucket, user?.id);
      onImageUploaded(result.url, result.path);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
        {label}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition cursor-pointer ${
          dragActive ? 'border-brand bg-white' : 'border-gray-300 hover:border-brand'
        }`}
        style={{
          borderColor: dragActive ? 'var(--forklore-burnt-orange)' : 'var(--forklore-warm-brown)',
          background: preview ? 'transparent' : 'rgba(245, 230, 211, 0.3)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-white font-semibold">Uploading...</div>
              </div>
            )}
            {!uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 rounded-lg transition opacity-0 hover:opacity-100">
                <span className="text-white font-semibold">Click to change image</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              style={{ color: 'var(--forklore-burnt-orange)' }}
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm" style={{ color: 'var(--forklore-warm-brown)' }}>
              PNG, JPG, or WebP up to 5MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 rounded-lg" style={{ background: 'rgba(196, 69, 54, 0.1)', border: '1px solid var(--forklore-warm-red)' }}>
          <p className="text-sm" style={{ color: 'var(--forklore-warm-red)' }}>{error}</p>
        </div>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(139, 111, 71, 0.2)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: '100%',
                background: 'var(--gradient-accent)',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
