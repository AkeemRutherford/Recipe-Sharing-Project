import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Recipe, RecipeModification } from '../lib/supabase';
import { formatIngredientAmount } from '../lib/fractions';

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const ChefHatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

function RecipeScaler({ originalServings, currentServings, onServingsChange }: { originalServings: number; currentServings: number; onServingsChange: (n: number) => void }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ScaleIcon />
          <span className="font-semibold text-gray-700">Scale Recipe</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onServingsChange(Math.max(1, currentServings - 1))}
            className="w-8 h-8 rounded-full bg-white border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-50 transition"
          >
            -
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-700">{currentServings}</div>
            <div className="text-xs text-gray-500">servings</div>
          </div>
          <button
            onClick={() => onServingsChange(currentServings + 1)}
            className="w-8 h-8 rounded-full bg-white border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-50 transition"
          >
            +
          </button>
        </div>
      </div>
      {currentServings !== originalServings && (
        <p className="text-sm text-gray-600 mt-2">
          Scaled from {originalServings} to {currentServings} servings (×{(currentServings / originalServings).toFixed(2)})
        </p>
      )}
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [modifications, setModifications] = useState<RecipeModification[]>([]);
  const [modificationLikes, setModificationLikes] = useState<Set<string>>(new Set());
  const [currentServings, setCurrentServings] = useState(4);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'substitution' | 'addition' | 'tip' | 'question'>('tip');
  const [useFractions, setUseFractions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRecipe();
      loadModifications();
      if (user) {
        loadModificationLikes();
      }
    }
  }, [id, user]);

  const loadRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_user_id_fkey(username, profile_pic_url)
        `)
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setRecipe(data);
        setCurrentServings(data.servings);
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModifications = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_modifications')
        .select(`
          *,
          profiles!recipe_modifications_user_id_fkey(username, profile_pic_url)
        `)
        .eq('recipe_id', id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModifications(data || []);
    } catch (err) {
      console.error('Error loading modifications:', err);
    }
  };

  const loadModificationLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('modification_likes')
        .select('modification_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      setModificationLikes(new Set(data.map(like => like.modification_id)));
    } catch (err) {
      console.error('Error loading modification likes:', err);
    }
  };

  const toggleModificationLike = async (modificationId: string) => {
    if (!user) return;

    try {
      if (modificationLikes.has(modificationId)) {
        await supabase
          .from('modification_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('modification_id', modificationId);

        setModificationLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(modificationId);
          return newSet;
        });
      } else {
        await supabase
          .from('modification_likes')
          .insert({ user_id: user.id, modification_id: modificationId });

        setModificationLikes(prev => new Set(prev).add(modificationId));
      }

      await loadModifications();
    } catch (err) {
      console.error('Error toggling modification like:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { data, error } = await supabase.from('recipe_modifications').insert({
        recipe_id: id!,
        user_id: user.id,
        modification_type: commentType,
        description: newComment,
      });

      if (error) {
        console.error('Error submitting comment:', error);
        alert(`Failed to post comment: ${error.message}`);
        return;
      }

      setNewComment('');
      await loadModifications();
      alert('Comment posted successfully!');
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      alert(`Failed to post comment: ${err.message || 'Unknown error'}`);
    }
  };

  const scaleFactor = recipe ? currentServings / recipe.servings : 1;

  const scaledIngredients = useMemo(() => {
    if (!recipe) return [];
    return recipe.ingredients.map((ing: any) => {
      const numMatch = ing.amount.match(/[\d.\/]+/);
      if (numMatch) {
        const fractionMatch = numMatch[0].match(/(\d+)\/(\d+)/);
        let num: number;
        if (fractionMatch) {
          num = parseFloat(fractionMatch[1]) / parseFloat(fractionMatch[2]);
        } else {
          num = parseFloat(numMatch[0]);
        }
        const scaledNum = num * scaleFactor;
        const scaledAmount = ing.amount.replace(/[\d.\/]+/, scaledNum % 1 === 0 ? scaledNum : scaledNum.toFixed(2));
        return { ...ing, amount: scaledAmount };
      }
      return ing;
    });
  }, [recipe, scaleFactor]);

  const aggregatedSuggestions = useMemo(() => {
    const suggestions = modifications.filter(m => m.modification_type === 'substitution' || m.modification_type === 'addition');
    const aggregation: any = {};

    suggestions.forEach(s => {
      let key = s.description.substring(0, 50);
      if (!aggregation[key]) {
        aggregation[key] = { count: 0, users: [], modification: s };
      }
      aggregation[key].count++;
      aggregation[key].users.push(s.profiles?.username || 'Anonymous');
    });

    return Object.values(aggregation).sort((a: any, b: any) => b.count - a.count);
  }, [modifications]);

  const getCommentIcon = (type: string) => {
    switch(type) {
      case 'substitution': return '🔄';
      case 'addition': return '➕';
      case 'tip': return '⭐';
      case 'question': return '❓';
      default: return '💬';
    }
  };

  const getCommentColor = (type: string) => {
    switch(type) {
      case 'substitution': return 'border-blue-400 bg-blue-50';
      case 'addition': return 'border-green-400 bg-green-50';
      case 'tip': return 'border-yellow-400 bg-yellow-50';
      case 'question': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 font-semibold mb-6 group">
          <BackIcon />
          <span className="group-hover:underline">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-96">
            {recipe.image_url ? (
              <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                <span className="text-9xl">🍳</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h2 className="text-5xl font-bold text-white mb-4">{recipe.title}</h2>
                  <div className="flex items-center space-x-4 text-white">
                    {recipe.profiles?.profile_pic_url && (
                      <img src={recipe.profiles.profile_pic_url} alt={recipe.profiles.username || ''} className="w-12 h-12 rounded-full border-3 border-white" />
                    )}
                    <div>
                      <p className="text-sm opacity-90">Created by</p>
                      <button
                        onClick={() => {
                          if (recipe.profiles?.username) {
                            navigate(`/profile/${recipe.profiles.username}`);
                          }
                        }}
                        className="font-semibold text-lg hover:underline"
                      >
                        {recipe.profiles?.username || 'Anonymous'}
                      </button>
                    </div>
                  </div>
                </div>
                {user && recipe.user_id === user.id && (
                  <button
                    onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                    className="px-6 py-3 bg-white/90 hover:bg-white text-amber-700 font-semibold rounded-lg shadow-lg transition backdrop-blur-sm"
                  >
                    Edit Recipe
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <ClockIcon />
                <div className="mt-2 text-sm text-gray-600">Prep Time</div>
                <div className="font-bold text-lg text-gray-800">{recipe.prep_time}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <ClockIcon />
                <div className="mt-2 text-sm text-gray-600">Cook Time</div>
                <div className="font-bold text-lg text-gray-800">{recipe.cook_time}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <UsersIcon />
                <div className="mt-2 text-sm text-gray-600">Servings</div>
                <div className="font-bold text-lg text-gray-800">{recipe.servings}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <ChefHatIcon />
                <div className="mt-2 text-sm text-gray-600">Difficulty</div>
                <div className="font-bold text-lg text-gray-800">{recipe.difficulty}</div>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">{recipe.description}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {recipe.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/?tags=${tag.toLowerCase()}`)}
                  className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-semibold px-4 py-2 rounded-full border border-amber-200 hover:from-amber-200 hover:to-orange-200 hover:scale-105 transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            <RecipeScaler
              originalServings={recipe.servings}
              currentServings={currentServings}
              onServingsChange={setCurrentServings}
            />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                    Ingredients
                  </h3>
                  <button
                    onClick={() => setUseFractions(!useFractions)}
                    className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition font-semibold"
                  >
                    {useFractions ? '1.5' : '1½'}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <ul className="space-y-3">
                    {scaledIngredients.map((ing: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="text-amber-700 font-bold">{formatIngredientAmount(ing.amount, useFractions)}</span>
                          {ing.unit && <span className="text-amber-600 ml-1">{ing.unit}</span>}
                          <span className="text-gray-700 ml-2">{ing.ingredient || ing.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></span>
                  Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-2">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 border-t-4 border-amber-200 pt-8">
              <h3 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
                <span className="text-4xl mr-3">👥</span>
                Community Kitchen
              </h3>
              <p className="text-gray-600 mb-6">See how others have adapted this recipe</p>

              {aggregatedSuggestions.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl border-2 border-purple-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                    <span className="text-3xl mr-2">🔥</span>
                    Popular Modifications
                  </h4>
                  <div className="space-y-3">
                    {aggregatedSuggestions.map((agg: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition border border-purple-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 text-sm flex items-center justify-center font-bold mr-3">
                                {agg.count}
                              </span>
                              <span className="font-semibold text-gray-800">{agg.modification.description}</span>
                            </div>
                            <p className="text-xs text-gray-500 ml-11">
                              ✓ Tried by {agg.users.join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleModificationLike(agg.modification.id)}
                            className="ml-4 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-purple-100 transition"
                          >
                            <HeartIcon filled={modificationLikes.has(agg.modification.id)} />
                            <span className="text-sm">{agg.modification.likes_count}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user && (
                <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <h4 className="font-semibold text-lg mb-4 text-gray-800">Share Your Experience</h4>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setCommentType('tip')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'tip' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                      ⭐ Tip
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentType('substitution')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'substitution' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                      🔄 Substitution
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentType('addition')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'addition' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                      ➕ Addition
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommentType('question')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'question' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                      ❓ Question
                    </button>
                  </div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share a substitution, scaling tip, or ask a question..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-600 transition shadow-md"
                    >
                      Post Community Note
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">All Community Notes ({modifications.length})</h4>
                {modifications.map(mod => (
                  <div key={mod.id} className={`p-5 rounded-xl border-l-4 ${getCommentColor(mod.modification_type)} shadow-sm hover:shadow-md transition`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {mod.profiles?.profile_pic_url ? (
                          <img src={mod.profiles.profile_pic_url} alt={mod.profiles.username || ''} className="w-10 h-10 rounded-full mr-3" />
                        ) : (
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center mr-3 text-xl">
                            {getCommentIcon(mod.modification_type)}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-800">{mod.profiles?.username || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500 ml-2">{new Date(mod.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleModificationLike(mod.id)}
                        className="flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-white transition"
                      >
                        <HeartIcon filled={modificationLikes.has(mod.id)} />
                        <span className="text-sm">{mod.likes_count}</span>
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
