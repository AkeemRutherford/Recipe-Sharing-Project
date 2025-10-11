import React, { useState } from 'react';
import { generateRecipeFromImage, GeneratedRecipe } from '../lib/aiRecipeGeneration';
import { validateImageFile, getImagePreview } from '../lib/imageUpload';

interface ImageToRecipeProps {
  onRecipeGenerated: (recipe: GeneratedRecipe, imageFile: File) => void;
  onCancel?: () => void;
}

export default function ImageToRecipe({ onRecipeGenerated, onCancel }: ImageToRecipeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'generating'>('upload');

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    try {
      const previewUrl = await getImagePreview(file);
      setPreview(previewUrl);
      setSelectedFile(file);
    } catch (err: any) {
      setError('Failed to load image preview');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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
      handleFileSelect(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const generateRecipe = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setProcessing(true);
    setError(null);
    setStep('analyzing');

    try {
      setTimeout(() => setStep('generating'), 2000);

      const recipe = await generateRecipeFromImage(selectedFile);
      onRecipeGenerated(recipe, selectedFile);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recipe. Please try again.');
      setStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setStep('upload');
  };

  return (
    <div className="image-to-recipe p-6 rounded-xl" style={{ background: 'var(--forklore-cream)', border: '2px solid var(--forklore-warm-brown)' }}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
          Generate Recipe from Photo
        </h3>
        <p style={{ color: 'var(--forklore-warm-brown)' }}>
          Upload a photo of any dish and our AI will create a complete recipe for you
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(196, 69, 54, 0.1)', border: '1px solid var(--forklore-warm-red)' }}>
          <p style={{ color: 'var(--forklore-warm-red)' }}>{error}</p>
        </div>
      )}

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 transition cursor-pointer ${dragActive ? 'scale-105' : ''}`}
          style={{
            borderColor: dragActive ? 'var(--forklore-burnt-orange)' : 'var(--forklore-warm-brown)',
            background: dragActive ? 'rgba(212, 118, 74, 0.1)' : 'rgba(245, 230, 211, 0.5)'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-file-input')?.click()}
        >
          <input
            id="image-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="text-center">
            <div className="text-5xl mb-4">=�</div>
            <p className="text-lg mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p style={{ color: 'var(--forklore-warm-brown)' }}>
              PNG, JPG, or WebP up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid var(--forklore-warm-brown)' }}>
            <img
              src={preview}
              alt="Selected food"
              className="w-full h-96 object-cover"
            />
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
                <div className="text-white text-center">
                  <div className="text-5xl mb-4">
                    <span className="animate-pulse">
