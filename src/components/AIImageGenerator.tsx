import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AIImageGeneratorProps {
  recipeTitle: string;
  onImageGenerated: (imageUrl: string) => void;
}

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18"/>
    <path d="M3 12h18"/>
    <path d="M6 6l12 12"/>
    <path d="M6 18L18 6"/>
  </svg>
);

export default function AIImageGenerator({ recipeTitle, onImageGenerated }: AIImageGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImageWithUnsplash = async () => {
    const cleanTitle = recipeTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const unsplashUrl = `https://source.unsplash.com/800x600/?${cleanTitle},food,recipe`;

    try {
      const testResponse = await fetch(unsplashUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        onImageGenerated(unsplashUrl);
        return true;
      }
    } catch (err) {
      console.warn('Unsplash failed, using placeholder');
    }

    const placeHolderUrl = `https://placehold.co/800x600/fbbf24/ffffff?text=${encodeURIComponent(recipeTitle)}`;
    onImageGenerated(placeHolderUrl);
    return false;
  };

  const generateImage = async () => {
    if (!recipeTitle) {
      setError('Please enter a recipe title first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe-image`;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: recipeTitle,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('HuggingFace API failed, using Unsplash fallback');
        await generateImageWithUnsplash();
        return;
      }

      const data = await response.json();

      if (data.success && data.image) {
        onImageGenerated(data.image);
      } else {
        console.warn('No image from HuggingFace, using Unsplash fallback');
        await generateImageWithUnsplash();
      }
    } catch (err: any) {
      console.warn('Error with AI generation, using Unsplash fallback:', err.message);
      try {
        await generateImageWithUnsplash();
      } catch (fallbackErr: any) {
        setError('Failed to generate image. Please try again or use a direct URL.');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={generateImage}
        disabled={generating || !recipeTitle}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
      >
        <SparklesIcon />
        <span>{generating ? 'Generating...' : 'Generate AI Image'}</span>
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
      {generating && (
        <p className="text-gray-500 text-sm mt-2">This may take 10-20 seconds...</p>
      )}
    </div>
  );
}
