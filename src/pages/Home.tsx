import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  HourglassIcon,
  DinnerPlateIcon,
  HeartSpoonIcon,
  CookbookIcon,
  SearchMagnifyIcon
} from '../components/ForkloreIcons';

const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;

function RecipeCard({ recipe, onLike, isLiked, onSave, isSaved, onTagClick, onShare }: { recipe: Recipe; onLike: (recipeId: string) => void; isLiked: boolean; onSave: (recipeId: string) => void; isSaved: boolean; onTagClick: (tag: string) => void; onShare: (recipeId: string, title: string, description: string) => void }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-airbnb-hover transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className="relative h-56">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-600">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(recipe.id, recipe.title, recipe.description); }}
            className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:scale-110 transition"
            title="Share recipe"
          >
            <ShareIcon />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(recipe.id); }}
            className={`p-2 rounded-full ${isSaved ? 'bg-airbnb-rausch text-white' : 'bg-white/90 text-gray-700 hover:bg-white'} hover:scale-110 transition`}
            title={isSaved ? "Remove from saved" : "Save recipe"}
          >
            <CookbookIcon size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onLike(recipe.id); }}
            className={`p-2 rounded-full ${isLiked ? 'bg-airbnb-rausch text-white' : 'bg-white/90 text-gray-700 hover:bg-white'} hover:scale-110 transition`}
          >
            <HeartSpoonIcon size={20} filled={isLiked} />
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
            <button
              key={tag}
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded hover:bg-airbnb-hof hover:text-airbnb-rausch transition"
            >
              {tag}
            </button>
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
  );
}

export default function Home() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userSavedRecipes, setUserSavedRecipes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['all']);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending' | 'recommended'>('recent');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [userFavoriteTags, setUserFavoriteTags] = useState<string[]>([]);
  const [followingUserIds, setFollowingUserIds] = useState<Set<string>>(new Set());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    loadRecipes();
    if (user) {
      loadUserLikes();
      loadUserSavedRecipes();
      loadUserFavoriteTags();
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;
    setFollowingUserIds(new Set());
  };

  const loadUserFavoriteTags = async () => {
    if (!user) return;
    setUserFavoriteTags([]);
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
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const loadRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_user_id_fkey(username, display_name, profile_pic_url)
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

  const loadUserSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_saves')
        .select('recipe_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      setUserSavedRecipes(new Set(data.map(saved => saved.recipe_id)));
    } catch (err) {
      console.error('Error loading saved recipes:', err);
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

  const toggleSave = async (recipeId: string) => {
    if (!user) return;

    try {
      if (userSavedRecipes.has(recipeId)) {
        await supabase
          .from('recipe_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        setUserSavedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await supabase
          .from('recipe_saves')
          .insert({ user_id: user.id, recipe_id: recipeId });

        setUserSavedRecipes(prev => new Set(prev).add(recipeId));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
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

  const handleShareRecipe = async (recipeId: string, title: string, description: string) => {
    const recipeUrl = `${window.location.origin}/recipe/${recipeId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: recipeUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(recipeUrl);
        }
      }
    } else {
      copyToClipboard(recipeUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
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
      const matchesAuthor = recipe.profiles?.display_name?.toLowerCase().includes(searchLower) || recipe.profiles?.username?.toLowerCase().includes(searchLower);

      const matchesIngredients = recipe.ingredients?.some((ing: any) =>
        ing.ingredient?.toLowerCase().includes(searchLower)
      );

      const matchesSearch = matchesTitle || matchesDescription || matchesTags || matchesAuthor || matchesIngredients;

      if (!matchesSearch) return false;

      if (selectedFilters.includes('all')) return true;

      return selectedFilters.some(filter => {
        const filterLower = filter.toLowerCase();

        if (filterLower === 'for-you' && userFavoriteTags.length > 0) {
          return recipe.tags.some(tag =>
            userFavoriteTags.some(favTag => favTag.toLowerCase() === tag.toLowerCase())
          );
        }

        if (filterLower === 'trending') {
          const daysSincePosted = (Date.now() - new Date(recipe.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSincePosted <= 7 && (recipe.likes_count || 0) >= 3;
        }

        if (filterLower === 'easy') {
          const totalTime = parseInt(recipe.prep_time) + parseInt(recipe.cook_time || '0');
          return recipe.difficulty === 'Easy' && totalTime < 45;
        }

        if (filterLower === 'weekend') {
          return recipe.difficulty === 'Intermediate' || recipe.difficulty === 'Advanced';
        }

        if (filterLower === 'healthy') {
          return recipe.tags.some(tag =>
            ['healthy', 'low-carb', 'gluten-free', 'low-calorie'].includes(tag.toLowerCase())
          );
        }

        if (filterLower === 'comfort') {
          return recipe.tags.some(tag =>
            ['comfort food', 'family dinner', 'cozy', 'hearty'].includes(tag.toLowerCase())
          );
        }

        if (filterLower === 'international') {
          return recipe.tags.some(tag =>
            ['italian', 'asian', 'mexican', 'french', 'indian', 'thai', 'chinese', 'japanese', 'mediterranean'].includes(tag.toLowerCase())
          );
        }

        if (filterLower === 'desserts') {
          return recipe.tags.some(tag =>
            ['dessert', 'sweet', 'baking', 'cake', 'cookie', 'pie'].includes(tag.toLowerCase())
          );
        }

        return recipe.tags.some(tag => tag.toLowerCase().includes(filterLower));
      });
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

  const allFilterOptions = [
    ...(user && userFavoriteTags.length > 0 ? [{ id: 'for-you', label: 'For You' }] : []),
    { id: 'trending', label: 'Trending' },
    { id: 'all', label: 'All Recipes' },
    { id: 'easy', label: 'Easy Wins' },
    { id: 'weekend', label: 'Weekend Projects' },
    { id: 'healthy', label: 'Healthy' },
    { id: 'comfort', label: 'Comfort Food' },
    { id: 'international', label: 'International' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'kosher', label: 'Kosher' },
    { id: 'weeknight', label: 'Weeknight' },
    { id: 'holiday', label: 'Holiday' },
    { id: 'quick', label: 'Quick' },
  ];

  const trendingFilter = allFilterOptions.find(f => f.id === 'trending')!;
  const otherCategories = allFilterOptions.filter(f => f.id !== 'trending');

  const filteredCategories = categorySearchQuery
    ? otherCategories.filter(cat =>
        cat.label.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    : otherCategories;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl text-airbnb-dark-gray">Loading culinary stories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {showShareToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          Link copied to clipboard!
        </div>
      )}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-airbnb-black">Discover Recipes</h2>
            {user && followingUserIds.size > 0 && (
              <button
                onClick={() => setShowFollowingOnly(!showFollowingOnly)}
                className={`px-5 py-2.5 rounded-full font-semibold transition text-sm ${
                  showFollowingOnly
                    ? 'bg-airbnb-rausch text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-airbnb-rausch'
                }`}
              >
                Following
              </button>
            )}
          </div>
          {!selectedFilters.includes('all') && selectedFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 text-airbnb-rausch hover:text-airbnb-rausch-dark transition font-semibold"
            >
              <span>Clear Filters</span>
              <span className="text-xl">×</span>
            </button>
          )}
        </div>

        {!selectedFilters.includes('all') && selectedFilters.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map(filter => (
                <span key={filter} className="px-3 py-1 bg-airbnb-rausch text-white rounded-full text-sm font-semibold capitalize flex items-center space-x-1">
                  <span>{filter}</span>
                  <button onClick={() => handleTagClick(filter)} className="ml-1 hover:opacity-80">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="md:hidden flex gap-2 items-start">
          <button
            onClick={() => handleFilterChange('trending')}
            className={`px-5 py-2 rounded-full font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
              selectedFilters.includes('trending')
                ? 'bg-airbnb-rausch text-white shadow-md scale-105'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-airbnb-rausch'
            }`}
          >
            {trendingFilter.label}
          </button>

          <div className="relative flex-1">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-5 py-2 rounded-full font-semibold transition-all bg-white border-2 border-gray-300 text-gray-700 hover:border-airbnb-rausch flex items-center justify-between"
            >
              <span>Categories</span>
              <ChevronDownIcon />
            </button>

            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-20 max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative">
                      <input
                        type="text"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchMagnifyIcon size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {filteredCategories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No categories found
                      </div>
                    ) : (
                      filteredCategories.map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            handleFilterChange(filter.id);
                            setShowCategoryDropdown(false);
                            setCategorySearchQuery('');
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            selectedFilters.includes(filter.id)
                              ? 'bg-airbnb-rausch text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allFilterOptions.map(filter => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedFilters.includes(filter.id)
                    ? 'bg-airbnb-rausch text-white shadow-md scale-105'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-airbnb-rausch'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
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
                className={`px-5 py-2.5 rounded-full font-semibold transition ${
                  sortBy === 'recommended'
                    ? 'bg-airbnb-rausch text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-airbnb-rausch'
                }`}
              >
                Recommended
              </button>
            )}
            <button
              onClick={() => handleSortChange('recent')}
              className={`px-5 py-2.5 rounded-full font-semibold transition ${
                sortBy === 'recent'
                  ? 'bg-airbnb-rausch text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-airbnb-rausch'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => handleSortChange('popular')}
              className={`px-5 py-2.5 rounded-full font-semibold transition ${
                sortBy === 'popular'
                  ? 'bg-airbnb-rausch text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-airbnb-rausch'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => handleSortChange('trending')}
              className={`px-5 py-2.5 rounded-full font-semibold transition ${
                sortBy === 'trending'
                  ? 'bg-airbnb-rausch text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-airbnb-rausch'
              }`}
            >
              Trending
            </button>
          </div>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-airbnb-dark-gray">No recipes found - your culinary journey awaits!</p>
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
              onSave={toggleSave}
              isSaved={userSavedRecipes.has(recipe.id)}
              onTagClick={handleTagClick}
              onShare={handleShareRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}
