import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function SavedRecipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_likes')
        .select(`
          recipe_id,
          recipes (
            id,
            title,
            description,
            image_url,
            prep_time,
            cook_time,
            servings,
            difficulty,
            tags,
            user_id,
            created_at,
            likes_count,
            profiles (
              username,
              display_name,
              profile_pic_url
            )
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

  const filteredRecipes = savedRecipes.filter(recipe => {
    const searchLower = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.description.toLowerCase().includes(searchLower) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <>
        <Header onSearchChange={setSearchQuery} searchQuery={searchQuery} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onSearchChange={setSearchQuery} searchQuery={searchQuery} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Recipes</h1>
        <p className="text-gray-600 mb-8">Your bookmarked recipes for quick access</p>

        {savedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl">
            <div className="text-forklore-red mb-6 opacity-80">
              <BookmarkIcon />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No saved recipes yet</h2>
            <p className="text-gray-600 mb-8 text-center max-w-md">
              Start bookmarking recipes you want to try later
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-forklore-red hover:bg-forklore-red-600 text-white font-semibold rounded-lg transition"
            >
              Explore Recipes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                <div className="relative h-48">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                      <span className="text-5xl">🍳</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{recipe.prep_time}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold">
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
