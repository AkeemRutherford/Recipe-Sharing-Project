import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  HourglassIcon,
  DinnerPlateIcon,
  HeartSpoonIcon,
  CookbookIcon
} from '../components/ForkloreIcons';

export default function SavedRecipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_saves')
        .select(`
          recipe_id,
          recipes (
            *,
            profiles!recipes_user_id_fkey(username, display_name, profile_pic_url)
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const recipes = data?.map(item => item.recipes).filter(Boolean) as Recipe[];
      setSavedRecipes(recipes || []);
    } catch (err) {
      console.error('Error loading saved recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await supabase
        .from('recipe_saves')
        .delete()
        .eq('user_id', user!.id)
        .eq('recipe_id', recipeId);

      setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (err) {
      console.error('Error unsaving recipe:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-airbnb-dark-gray">Loading saved recipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Saved Recipes</h1>
          <p className="text-gray-600">Your bookmarked recipes for quick access</p>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-xl text-gray-500 mb-4">No saved recipes yet</p>
            <p className="text-gray-400 mb-6">Start bookmarking recipes you want to try later</p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-6 py-3 text-white font-semibold rounded-full"
            >
              Explore Recipes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-airbnb-hover transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <div className="relative h-56">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-6xl">🍳</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleUnsaveRecipe(recipe.id, e)}
                      className="p-2 rounded-full bg-airbnb-rausch text-white hover:scale-110 transition"
                      title="Remove from saved"
                    >
                      <CookbookIcon size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">{recipe.title}</h3>
                    <div className="flex items-center">
                      {recipe.profiles?.profile_pic_url && (
                        <img src={recipe.profiles.profile_pic_url} alt={recipe.profiles.display_name || recipe.profiles.username || ''} className="w-6 h-6 rounded-full border-2 border-white" />
                      )}
                      <span className="text-white/90 text-sm ml-2 font-medium">
                        {recipe.profiles?.display_name || recipe.profiles?.username || 'Unknown Cook'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <HourglassIcon size={20} />
                      <span>{recipe.prep_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DinnerPlateIcon size={20} />
                      <span>{recipe.servings} servings</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{recipe.difficulty}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <HeartSpoonIcon size={20} filled={false} />
                      <span>{recipe.likes_count}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
