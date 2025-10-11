import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;

function RecipeCard({ recipe, onLike, isLiked, onTagClick }: { recipe: Recipe; onLike: (recipeId: string) => void; isLiked: boolean; onTagClick: (tag: string) => void }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="relative h-56">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
            <span className="text-6xl">🍳</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => { e.stopPropagation(); onLike(recipe.id); }}
            className={`p-2 rounded-full backdrop-blur-md ${isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'} hover:scale-110 transition`}
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-bold mb-1 line-clamp-2">{recipe.title}</h3>
          <div className="flex items-center">
            {recipe.profiles?.profile_pic_url && (
              <img src={recipe.profiles.profile_pic_url} alt={recipe.profiles.username || ''} className="w-6 h-6 rounded-full border-2 border-white" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (recipe.profiles?.username) {
                  navigate(`/profile/${recipe.profiles.username}`);
                }
              }}
              className="text-white/90 text-sm ml-2 font-medium hover:underline"
            >
              {recipe.profiles?.username || 'Anonymous'}
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <ClockIcon />
            <span>{recipe.prep_time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <UsersIcon />
            <span>{recipe.servings} servings</span>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">{recipe.difficulty}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded hover:bg-amber-100 hover:text-amber-700 transition"
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <HeartIcon filled={false} />
            <span>{recipe.likes_count}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending' | 'recommended'>('recent');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [userFavoriteTags, setUserFavoriteTags] = useState<string[]>([]);
  const [followingUserIds, setFollowingUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecipes();
    if (user) {
      loadUserLikes();
      loadUserFavoriteTags();
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowingUserIds(new Set(data.map(f => f.following_id)));
    } catch (err) {
      console.error('Error loading following:', err);
    }
  };

  const loadUserFavoriteTags = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_tags')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserFavoriteTags(data?.favorite_tags || []);

      if (data?.favorite_tags && data.favorite_tags.length > 0) {
        setSortBy('recommended');
      }
    } catch (err) {
      console.error('Error loading user favorite tags:', err);
    }
  };

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tags = tagsParam.split(',').map(t => t.trim().toLowerCase());
      setSelectedFilters(tags);
    }
    const sortParam = searchParams.get('sort');
    if (sortParam && ['recent', 'popular', 'trending'].includes(sortParam)) {
      setSortBy(sortParam as 'recent' | 'popular' | 'trending');
    }
  }, [searchParams]);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_user_id_fkey(username, profile_pic_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_likes')
        .select('recipe_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      setUserLikes(new Set(data.map(like => like.recipe_id)));
    } catch (err) {
      console.error('Error loading likes:', err);
    }
  };

  const toggleLike = async (recipeId: string) => {
    if (!user) return;

    try {
      if (userLikes.has(recipeId)) {
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await supabase
          .from('recipe_likes')
          .insert({ user_id: user.id, recipe_id: recipeId });

        setUserLikes(prev => new Set(prev).add(recipeId));
      }

      await loadRecipes();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleFilterChange = (filterId: string) => {
    let newFilters: string[];
    if (filterId === 'all') {
      newFilters = ['all'];
      setSearchParams({});
    } else {
      const current = selectedFilters.filter(f => f !== 'all');
      if (selectedFilters.includes(filterId)) {
        const updated = current.filter(f => f !== filterId);
        newFilters = updated.length === 0 ? ['all'] : updated;
      } else {
        newFilters = [...current, filterId];
      }

      if (newFilters.includes('all')) {
        setSearchParams({});
      } else {
        setSearchParams({ tags: newFilters.join(',') });
      }
    }
    setSelectedFilters(newFilters);
  };

  const handleTagClick = (tag: string) => {
    const tagLower = tag.toLowerCase();
    const current = selectedFilters.filter(f => f !== 'all');

    if (selectedFilters.includes(tagLower)) {
      const updated = current.filter(f => f !== tagLower);
      const newFilters = updated.length === 0 ? ['all'] : updated;
      setSelectedFilters(newFilters);

      if (newFilters.includes('all')) {
        setSearchParams({});
      } else {
        setSearchParams({ tags: newFilters.join(',') });
      }
    } else {
      const newFilters = [...current, tagLower];
      setSelectedFilters(newFilters);
      setSearchParams({ tags: newFilters.join(',') });
    }
  };

  const clearFilters = () => {
    setSelectedFilters(['all']);
    setSearchParams({});
  };

  const handleSortChange = (newSort: 'recent' | 'popular' | 'trending') => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const filteredRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      if (showFollowingOnly && !followingUserIds.has(recipe.user_id)) {
        return false;
      }

      const searchLower = searchQuery.toLowerCase();

      const matchesTitle = recipe.title.toLowerCase().includes(searchLower);
      const matchesDescription = recipe.description.toLowerCase().includes(searchLower);
      const matchesTags = recipe.tags.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesAuthor = recipe.profiles?.username?.toLowerCase().includes(searchLower);

      const matchesIngredients = recipe.ingredients?.some((ing: any) =>
        ing.ingredient?.toLowerCase().includes(searchLower)
      );

      const matchesSearch = matchesTitle || matchesDescription || matchesTags || matchesAuthor || matchesIngredients;

      if (!matchesSearch) return false;

      if (selectedFilters.includes('all')) return true;

      return selectedFilters.some(filter =>
        recipe.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'popular') {
        return (b.likes_count || 0) - (a.likes_count || 0);
      } else if (sortBy === 'trending') {
        const aScore = (a.likes_count || 0) * 2 + (new Date(a.created_at).getTime() / 1000000000);
        const bScore = (b.likes_count || 0) * 2 + (new Date(b.created_at).getTime() / 1000000000);
        return bScore - aScore;
      } else if (sortBy === 'recommended') {
        const aMatchCount = a.tags.filter((tag: string) =>
          userFavoriteTags.some(ft => ft.toLowerCase() === tag.toLowerCase())
        ).length;
        const bMatchCount = b.tags.filter((tag: string) =>
          userFavoriteTags.some(ft => ft.toLowerCase() === tag.toLowerCase())
        ).length;

        if (bMatchCount !== aMatchCount) {
          return bMatchCount - aMatchCount;
        }

        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return 0;
    });

    return sorted;
  }, [recipes, searchQuery, selectedFilters, sortBy, userFavoriteTags, showFollowingOnly, followingUserIds]);

  const filterOptions = [
    { id: 'all', label: 'All Recipes' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'weeknight', label: 'Weeknight' },
    { id: 'holiday', label: 'Holiday' },
    { id: 'quick', label: 'Quick' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search recipes, ingredients, occasions..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-md text-gray-800 placeholder-gray-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">Discover Recipes</h2>
            {user && followingUserIds.size > 0 && (
              <button
                onClick={() => setShowFollowingOnly(!showFollowingOnly)}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  showFollowingOnly
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
              >
                {showFollowingOnly ? '✓ ' : ''}Following
              </button>
            )}
          </div>
          {!selectedFilters.includes('all') && selectedFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition font-semibold"
            >
              <span>Clear Filters</span>
              <span className="text-xl">×</span>
            </button>
          )}
        </div>

        {!selectedFilters.includes('all') && selectedFilters.length > 0 && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map(filter => (
                <span key={filter} className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-semibold capitalize flex items-center space-x-1">
                  <span>{filter}</span>
                  <button onClick={() => handleTagClick(filter)} className="ml-1 hover:text-amber-900">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {filterOptions.map(filter => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-5 py-2 rounded-full font-semibold transition-all ${
                selectedFilters.includes(filter.id)
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-amber-400'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="text-gray-700">
          <span className="font-semibold">{filteredRecipes.length}</span> recipes found
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            {userFavoriteTags.length > 0 && (
              <button
                onClick={() => handleSortChange('recommended')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'recommended'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
                }`}
              >
                Recommended
              </button>
            )}
            <button
              onClick={() => handleSortChange('recent')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                sortBy === 'recent'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                sortBy === 'popular'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => handleSortChange('trending')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                sortBy === 'trending'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500">No recipes found matching your criteria</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onLike={toggleLike}
              isLiked={userLikes.has(recipe.id)}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
