import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import IngredientBuilder from '../components/IngredientBuilder';
import AIImageGenerator from '../components/AIImageGenerator';
import VoiceInput from '../components/VoiceInput';
import { parseDescriptionToRecipe } from '../lib/aiRecipeParser';
import Header from '../components/Header';

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateRecipe = async () => {
    if (!formData.description.trim()) {
      setError('Please enter at least a dish name or brief description');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const recipeData = await parseDescriptionToRecipe(formData.description);

      setPreviewRecipe(recipeData);
      setShowPreview(true);
    } catch (err: any) {
      console.error('Recipe generation error:', err);

      const recipeData = await parseDescriptionToRecipe(formData.description);
      setPreviewRecipe(recipeData);
      setShowPreview(true);
    } finally {
      setGenerating(false);
    }
  };

  const applyGeneratedRecipe = () => {
    if (!previewRecipe) return;

    const mappedIngredients = previewRecipe.ingredients.map((ing: any) => ({
      amount: ing.amount,
      unit: ing.unit,
      ingredient: ing.name
    }));

    setIngredients(mappedIngredients);
    setFormData({
      ...formData,
      title: previewRecipe.title || formData.title,
      servings: previewRecipe.servings || formData.servings,
      prep_time: previewRecipe.prep_time || formData.prep_time,
      cook_time: previewRecipe.cook_time || formData.cook_time,
      difficulty: previewRecipe.difficulty || formData.difficulty,
      tags: previewRecipe.tags ? previewRecipe.tags.join(', ') : formData.tags,
      instructions: previewRecipe.instructions.join('\n')
    });

    setShowPreview(false);
    setError(null);

    setTimeout(() => {
      document.getElementById('ingredients-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to add a recipe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        setError('Profile not found. Please try logging in again.');
        setLoading(false);
        return;
      }

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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-forklore-red hover:text-forklore-red-600 font-semibold mb-6"
          >
            <BackIcon />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Recipe</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                placeholder="e.g., Grandma's Classic Lasagna"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recipe Description *
                <span className="text-xs font-normal text-gray-500 ml-2">(Type or use voice input)</span>
              </label>
              <div className="description-input-container">
                <VoiceInput
                  required
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                  placeholder="Describe your recipe in detail... Include ingredients, amounts, and cooking steps. The more detail you provide, the better the AI can structure your recipe!"
                />
                <div className="description-actions mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateRecipe}
                    disabled={!formData.description.trim() || generating}
                    className="btn-ai-generate flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-airbnb-rausch to-yellow-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <span className="spinner"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Generate Recipe Details
                      </>
                    )}
                  </button>
                </div>
              </div>
              {generating && (
                <div className="generation-progress mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-yellow-300">
                  <div className="progress-bar h-2 bg-orange-200 rounded-full overflow-hidden mb-3">
                    <div className="progress-fill h-full bg-gradient-to-r from-airbnb-rausch to-yellow-500"></div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium text-center">
                    AI is analyzing your description and creating structured recipe...
                  </p>
                </div>
              )}
              <p className="help-text text-xs text-gray-500 mt-2">
                💡 Tip: Describe your recipe in detail including ingredients, amounts, and cooking steps. The AI will automatically structure it into a proper recipe format.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <div className="flex items-start space-x-3 mb-2">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <AIImageGenerator
                  recipeTitle={formData.title}
                  recipeDescription={formData.description}
                  ingredients={ingredients}
                  onImageGenerated={(url) => setFormData({ ...formData, image_url: url })}
                  onGeneratingChange={setIsGeneratingImage}
                />
              </div>
              <p className="text-xs text-gray-500">Use Pexels/Unsplash for images, or generate one with AI</p>
              {formData.image_url && !isGeneratingImage && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Image Preview:</p>
                  <img src={formData.image_url} alt="Preview" className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-300 shadow-md" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prep Time *</label>
                <input
                  type="text"
                  required
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                  placeholder="20 min"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cook Time *</label>
                <input
                  type="text"
                  required
                  value={formData.cook_time}
                  onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                  placeholder="45 min"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Servings *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty *</label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                >
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                placeholder="Italian, Comfort Food, Vegetarian (comma-separated)"
              />
            </div>

            <div id="ingredients-section">
              <IngredientBuilder
                ingredients={ingredients}
                onChange={setIngredients}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions *</label>
              <textarea
                required
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                placeholder="Enter each step on a new line...&#10;1. Preheat oven to 350°F&#10;2. Mix dry ingredients in a bowl&#10;3. Add wet ingredients and stir until combined"
              />
              <p className="text-xs text-gray-500 mt-1">One step per line</p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-3 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPreview && previewRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
              <h3 className="text-2xl font-bold text-gray-800">AI Generated Recipe Preview</h3>
              <p className="text-sm text-gray-600 mt-1">Review the generated recipe before applying</p>
            </div>

            <div className="p-6 space-y-6">
              {previewRecipe.title && (
                <div className="preview-section">
                  <h4 className="text-lg font-bold text-gray-700 mb-2">Title</h4>
                  <p className="text-gray-800">{previewRecipe.title}</p>
                </div>
              )}

              <div className="preview-meta flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                {previewRecipe.prep_time && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <span>⏱️</span> {previewRecipe.prep_time} prep
                  </span>
                )}
                {previewRecipe.cook_time && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <span>🔥</span> {previewRecipe.cook_time} cook
                  </span>
                )}
                {previewRecipe.servings && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <span>👥</span> {previewRecipe.servings} servings
                  </span>
                )}
                {previewRecipe.difficulty && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <span>📊</span> {previewRecipe.difficulty}
                  </span>
                )}
              </div>

              <div className="preview-section">
                <h4 className="text-lg font-bold text-gray-700 mb-3">
                  Ingredients ({previewRecipe.ingredients?.length || 0})
                </h4>
                <ul className="space-y-2">
                  {previewRecipe.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-airbnb-rausch font-bold">•</span>
                      <span>
                        <span className="font-semibold">{ing.amount}</span>
                        {ing.unit && <span> {ing.unit}</span>}
                        <span> {ing.name}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="preview-section">
                <h4 className="text-lg font-bold text-gray-700 mb-3">
                  Instructions ({previewRecipe.instructions?.length || 0} steps)
                </h4>
                <ol className="space-y-3">
                  {previewRecipe.instructions?.map((step: string, i: number) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <span className="font-bold text-airbnb-rausch min-w-[24px]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {previewRecipe.tags && previewRecipe.tags.length > 0 && (
                <div className="preview-tags flex flex-wrap gap-2">
                  {previewRecipe.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateRecipe}
                className="px-5 py-2.5 border-2 border-airbnb-rausch text-airbnb-rausch font-semibold rounded-lg hover:bg-red-50 transition"
              >
                🔄 Regenerate
              </button>
              <button
                onClick={applyGeneratedRecipe}
                className="px-5 py-2.5 bg-gradient-to-r from-airbnb-rausch to-yellow-500 text-white font-bold rounded-lg hover:shadow-lg transition"
              >
                ✅ Apply to Recipe Form
              </button>
            </div>

            <p className="px-6 pb-4 text-xs text-gray-500 text-center">
              ⚠️ AI-generated content may need adjustments. Always review before saving.
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
