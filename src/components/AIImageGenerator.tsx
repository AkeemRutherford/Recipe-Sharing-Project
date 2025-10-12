import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import CookingModal from './CookingModal';

interface AIImageGeneratorProps {
  recipeTitle: string;
  recipeDescription?: string;
  ingredients?: Array<{ amount: string; unit: string; ingredient: string }>;
  onImageGenerated: (imageUrl: string) => void;
  isGenerating?: boolean;
  onGeneratingChange?: (generating: boolean) => void;
}

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18"/>
    <path d="M3 12h18"/>
    <path d="M6 6l12 12"/>
    <path d="M6 18L18 6"/>
  </svg>
);

export default function AIImageGenerator({ recipeTitle, recipeDescription, ingredients, onImageGenerated, onGeneratingChange }: AIImageGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGenerating = (value: boolean) => {
    setGenerating(value);
    onGeneratingChange?.(value);
  };

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

    updateGenerating(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe-image`;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const ingredientsList = ingredients?.map(i => i.ingredient) || [];

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeName: recipeTitle,
          description: recipeDescription || '',
          ingredients: ingredientsList,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Google Imagen API failed, using Unsplash fallback');
        await generateImageWithUnsplash();
        return;
      }

      const data = await response.json();

      if (data.success && data.image) {
        onImageGenerated(data.image);
      } else {
        console.warn('No image from Google Imagen, using Unsplash fallback');
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
      updateGenerating(false);
    }
  };

  return (
    <>
      <CookingModal isOpen={generating} />

      <div className="w-full">
        <button
          type="button"
          onClick={generateImage}
          disabled={generating || !recipeTitle}
          className="flex items-center space-x-2 px-4 py-2 bg-airbnb-rausch text-white rounded-full hover:bg-airbnb-rausch-dark transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <SparklesIcon />
          <span>{generating ? 'Generating...' : 'Generate AI Image'}</span>
        </button>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>
    </>
  );
}
