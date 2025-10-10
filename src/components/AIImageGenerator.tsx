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

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: recipeTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();

      if (data.success && data.image) {
        onImageGenerated(data.image);
      } else {
        throw new Error('No image received from API');
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setError(err.message || 'Failed to generate image');
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
