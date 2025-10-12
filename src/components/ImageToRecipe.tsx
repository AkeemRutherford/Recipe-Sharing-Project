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

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    try {
      // Show preview
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
      // Simulate progress for better UX
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
          className={`border-2 border-dashed rounded-xl p-12 transition cursor-pointer ${
            dragActive ? 'scale-105' : ''
          }`}
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
            <svg
              className="mx-auto h-16 w-16 mb-4"
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
                  <div className="text-4xl mb-4 animate-pulse">
                    {step === 'analyzing' ? '🔍' : '✨'}
                  </div>
                  <p className="text-xl font-semibold mb-2">
                    {step === 'analyzing' && 'Analyzing your dish...'}
                    {step === 'generating' && 'Generating recipe...'}
                  </p>
                  <p className="text-sm opacity-80">This may take a moment</p>
                </div>
              </div>
            )}
          </div>

          {!processing && (
            <button
              onClick={resetUpload}
              className="mt-3 w-full py-2 rounded-lg transition hover:bg-white"
              style={{ color: 'var(--forklore-warm-brown)', border: '1px solid var(--forklore-warm-brown)' }}
            >
              Choose different image
            </button>
          )}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg mb-6" style={{ border: '1px solid var(--forklore-warm-brown)' }}>
        <h4 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
          Tips for best results:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: 'var(--forklore-warm-brown)' }}>
          <li>• Use clear, well-lit photos of the finished dish</li>
          <li>• Show the full dish, not just a portion</li>
          <li>• Avoid images with multiple dishes</li>
          <li>• Photos of plated food work better than cooking process</li>
          <li>• You can edit all details after AI generates the recipe</li>
        </ul>
      </div>

      <div className="flex justify-between space-x-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-secondary px-6 py-3 rounded-full font-semibold"
            disabled={processing}
          >
            Cancel
          </button>
        )}
        <button
          onClick={generateRecipe}
          disabled={!selectedFile || processing}
          className="btn-primary px-8 py-3 rounded-full font-semibold flex-1 flex items-center justify-center"
        >
          {processing ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>
    </div>
  );
}
