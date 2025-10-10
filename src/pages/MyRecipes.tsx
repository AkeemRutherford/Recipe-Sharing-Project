import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Recipe, RecipeModification } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function MyRecipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [recentModifications, setRecentModifications] = useState<(RecipeModification & { recipes?: { title: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyRecipes();
      loadRecentModifications();
    }
  }, [user]);

  const loadMyRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_user_id_fkey(username, profile_pic_url)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRecipes(data || []);
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentModifications = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_modifications')
        .select(`
          *,
          profiles!recipe_modifications_user_id_fkey(username, profile_pic_url),
          recipes!recipe_modifications_recipe_id_fkey(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentModifications(data || []);
    } catch (err) {
      console.error('Error loading modifications:', err);
    }
  };

  const getModificationIcon = (type: string) => {
    switch(type) {
      case 'substitution': return '🔄';
      case 'addition': return '➕';
      case 'tip': return '⭐';
      case 'question': return '❓';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your recipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Recipes</h1>
          <button
            onClick={() => navigate('/add-recipe')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-600 transition shadow-md"
          >
            + Add Recipe
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Recipes ({myRecipes.length})</h2>

            {myRecipes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-500 mb-4">You haven't created any recipes yet</p>
                <button
                  onClick={() => navigate('/add-recipe')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-600 transition"
                >
                  Create Your First Recipe
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row">
                      {recipe.image_url && (
                        <div className="md:w-48 h-48 md:h-auto">
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {recipe.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <HeartIcon />
                            <span>{recipe.likes_count} likes</span>
                          </span>
                          <span>{recipe.prep_time} prep</span>
                          <span>{recipe.servings} servings</span>
                          <span className="text-xs text-gray-400">
                            Created {new Date(recipe.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Community Activity</h2>

            <div className="bg-white rounded-xl shadow-lg p-6">
              {recentModifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent modifications yet</p>
              ) : (
                <div className="space-y-4">
                  {recentModifications.map(mod => (
                    <div
                      key={mod.id}
                      className="border-l-4 border-amber-400 pl-4 py-2 hover:bg-amber-50 transition cursor-pointer rounded"
                      onClick={() => navigate(`/recipe/${mod.recipe_id}`)}
                    >
                      <div className="flex items-start space-x-2 mb-1">
                        <span className="text-lg">{getModificationIcon(mod.modification_type)}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">
                            {mod.profiles?.username || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {mod.recipes?.title}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{mod.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(mod.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <HeartIcon />
                          <span>{mod.likes_count}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
