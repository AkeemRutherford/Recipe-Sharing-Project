import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import IngredientBuilder from '../components/IngredientBuilder';
import AIImageGenerator from '../components/AIImageGenerator';

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function AddRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    prep_time: '',
    cook_time: '',
    servings: 4,
    difficulty: 'Easy',
    tags: '',
    instructions: '',
  });

  const [ingredients, setIngredients] = useState<Array<{ amount: string; unit: string; ingredient: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to add a recipe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (ingredients.length === 0) {
        setError('Please add at least one ingredient');
        setLoading(false);
        return;
      }

      const instructionsArray = formData.instructions
        .split('\n')
        .filter(line => line.trim());

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const { data, error: insertError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          prep_time: formData.prep_time,
          cook_time: formData.cook_time,
          servings: formData.servings,
          difficulty: formData.difficulty,
          tags: tagsArray,
          ingredients: ingredients,
          instructions: instructionsArray,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate('/my-recipes');
    } catch (err: any) {
      setError(err.message || 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--gradient-background)' }}>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 font-semibold mb-6 hover:opacity-70 transition"
          style={{ color: 'var(--forklore-warm-brown)' }}
        >
          <BackIcon />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ border: '2px solid var(--forklore-warm-brown)' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Add New Recipe
          </h1>

          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(196, 69, 54, 0.1)', border: '1px solid var(--forklore-warm-red)' }}>
              <p style={{ color: 'var(--forklore-warm-red)' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--forklore-warm-brown)' }}
                placeholder="e.g., Grandma's Classic Lasagna"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--forklore-warm-brown)' }}
                placeholder="A brief description of your recipe..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Image URL
              </label>
              <div className="flex items-start space-x-3 mb-2">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                  placeholder="https://example.com/image.jpg"
                />
                <AIImageGenerator
                  recipeTitle={formData.title}
                  onImageGenerated={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--forklore-warm-brown)' }}>Use Pexels/Unsplash for images, or generate one with AI</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                  Prep Time *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                  placeholder="20 min"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                  Cook Time *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cook_time}
                  onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                  placeholder="45 min"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                  Servings *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                  Difficulty *
                </label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--forklore-warm-brown)' }}
                placeholder="Italian, Comfort Food, Vegetarian (comma-separated)"
              />
            </div>

            <IngredientBuilder
              ingredients={ingredients}
              onChange={setIngredients}
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Instructions *
              </label>
              <textarea
                required
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--forklore-warm-brown)' }}
                placeholder="Enter each step on a new line...&#10;1. Preheat oven to 350°F&#10;2. Mix dry ingredients in a bowl&#10;3. Add wet ingredients and stir until combined"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--forklore-warm-brown)' }}>One step per line</p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-3 rounded-lg font-semibold"
              >
                {loading ? 'Creating...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
