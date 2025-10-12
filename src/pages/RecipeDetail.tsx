import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Recipe, RecipeModification } from '../lib/supabase';
import { formatIngredientAmount } from '../lib/fractions';
import { convertIngredient, detectCurrentSystem, MeasurementSystem } from '../lib/unitConversion';

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const ScaleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;
const ChefHatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;

function RecipeScaler({ originalServings, currentServings, onServingsChange }: { originalServings: number; currentServings: number; onServingsChange: (n: number) => void }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ScaleIcon />
          <span className="font-semibold text-gray-700">Scale Recipe</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onServingsChange(Math.max(1, currentServings - 1))}
            className="w-8 h-8 rounded-full bg-white border-2 border-airbnb-rausch text-airbnb-rausch font-bold hover:bg-gray-50 transition"
          >
            -
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold text-airbnb-rausch">{currentServings}</div>
            <div className="text-xs text-gray-500">servings</div>
          </div>
          <button
            onClick={() => onServingsChange(currentServings + 1)}
            className="w-8 h-8 rounded-full bg-white border-2 border-airbnb-rausch text-airbnb-rausch font-bold hover:bg-gray-50 transition"
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
  const [comments, setComments] = useState<any[]>([]);
  const [modificationLikes, setModificationLikes] = useState<Set<string>>(new Set());
  const [commentLikes, setCommentLikes] = useState<Set<string>>(new Set());
  const [currentServings, setCurrentServings] = useState(4);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'tip' | 'suggestion' | 'question'>('tip');
  const [useFractions, setUseFractions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('imperial');
  const [originalSystem, setOriginalSystem] = useState<MeasurementSystem>('imperial');
  const [commentSortBy, setCommentSortBy] = useState<'recent' | 'liked' | 'oldest'>('recent');
  const [appliedModifications, setAppliedModifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadRecipe();
      loadModifications();
      loadComments();
      if (user) {
        loadModificationLikes();
        loadCommentLikes();
      }
    }
  }, [id, user]);

  const loadComments = async () => {
    try {
      setComments([]);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const loadRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles!recipes_user_id_fkey(username, display_name, profile_pic_url)
        `)
        .eq('id', id!)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setRecipe(data);
        setCurrentServings(data.servings);

        const detectedSystem = detectCurrentSystem(data.ingredients);
        setOriginalSystem(detectedSystem);
        setMeasurementSystem(detectedSystem);
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
          profiles!recipe_modifications_user_id_fkey(username, display_name, profile_pic_url)
        `)
        .eq('recipe_id', id!)
        .order('created_at', { ascending: false});

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

  const loadCommentLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      setCommentLikes(new Set(data.map(like => like.comment_id)));
    } catch (err) {
      console.error('Error loading comment likes:', err);
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

  const toggleCommentLike = async (commentId: string) => {
    if (!user) return;

    try {
      if (commentLikes.has(commentId)) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        setCommentLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        await supabase
          .from('comment_likes')
          .insert({ user_id: user.id, comment_id: commentId });

        setCommentLikes(prev => new Set(prev).add(commentId));
      }

      await loadComments();
    } catch (err) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase.from('comments').insert({
        recipe_id: id!,
        user_id: user.id,
        type: commentType,
        text: newComment,
      });

      if (error) {
        console.error('Error submitting comment:', error);
        alert(`Failed to post comment: ${error.message}`);
        return;
      }

      setNewComment('');
      await loadComments();
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

        if (measurementSystem !== originalSystem) {
          const converted = convertIngredient(scaledAmount, ing.unit || '', measurementSystem);
          if (converted) {
            return {
              ...ing,
              amount: converted.amount,
              unit: converted.unit,
              originalAmount: converted.originalAmount,
              originalUnit: converted.originalUnit,
            };
          }
        }

        return { ...ing, amount: scaledAmount };
      }
      return ing;
    });
  }, [recipe, scaleFactor, measurementSystem, originalSystem]);

  const aggregatedSuggestions = useMemo(() => {
    const suggestions = comments.filter(c => c.type === 'suggestion');
    const groups: any[] = [];

    suggestions.forEach(comment => {
      const text = comment.text.toLowerCase();

      let foundGroup = false;
      for (const group of groups) {
        const groupText = group.comment.text.toLowerCase();

        const words1 = text.split(/\s+/).filter(w => w.length > 3);
        const words2 = groupText.split(/\s+/).filter(w => w.length > 3);
        const commonWords = words1.filter(w => words2.includes(w));

        const similarity = commonWords.length / Math.max(words1.length, words2.length);

        if (similarity > 0.4) {
          group.count++;
          group.users.push(comment.profiles?.username || 'Anonymous');
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push({
          count: 1,
          users: [comment.profiles?.username || 'Anonymous'],
          comment: comment,
        });
      }
    });

    return groups.sort((a, b) => b.count - a.count);
  }, [comments]);

  const getCommentIcon = (type: string) => {
    switch(type) {
      case 'suggestion': return '💡';
      case 'tip': return '⭐';
      case 'question': return '❓';
      default: return '💬';
    }
  };

  const getCommentColor = (type: string) => {
    switch(type) {
      case 'suggestion': return 'border-blue-400 bg-blue-50';
      case 'tip': return 'border-yellow-400 bg-yellow-50';
      case 'question': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-airbnb-rausch hover:text-airbnb-rausch-dark font-semibold mb-6 group">
          <BackIcon />
          <span className="group-hover:underline">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative h-96">
            {recipe.image_url ? (
              <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
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
                      <img src={recipe.profiles.profile_pic_url} alt={recipe.profiles.display_name || recipe.profiles.username || ''} className="w-12 h-12 rounded-full border-3 border-white" />
                    )}
                    <div>
                      <p className="text-sm opacity-90">Created by</p>
                      <span className="font-semibold text-lg">
                        {recipe.profiles?.display_name || recipe.profiles?.username || 'Unknown Cook'}
                      </span>
                    </div>
                  </div>
                </div>
                {user && recipe.user_id === user.id && (
                  <button
                    onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                    className="px-6 py-3 bg-white/90 hover:bg-white text-airbnb-rausch font-semibold rounded-full shadow-lg transition backdrop-blur-sm"
                  >
                    Edit Recipe
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <ClockIcon />
                <div className="mt-2 text-sm text-gray-600">Prep Time</div>
                <div className="font-bold text-lg text-gray-800">{recipe.prep_time}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
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
                  className="bg-gradient-to-r from-gray-100 to-gray-100 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 hover:from-gray-200 hover:to-gray-200 hover:scale-105 transition"
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

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Unit System</span>
                </div>
                <button
                  onClick={() => setMeasurementSystem(measurementSystem === 'imperial' ? 'metric' : 'imperial')}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition font-semibold shadow-md"
                >
                  {measurementSystem === 'imperial' ? 'Convert to Metric' : 'Convert to Imperial'}
                </button>
              </div>
              {measurementSystem !== originalSystem && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing {measurementSystem === 'metric' ? 'metric' : 'imperial'} units (original: {originalSystem === 'metric' ? 'metric' : 'imperial'})
                </p>
              )}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <span className="w-1 h-8 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full mr-3"></span>
                    Ingredients
                  </h3>
                  <button
                    onClick={() => setUseFractions(!useFractions)}
                    className="text-sm px-3 py-1 bg-gray-100 text-airbnb-rausch rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    {useFractions ? '1.5' : '1½'}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-50 rounded-xl p-6 border border-gray-200">
                  <ul className="space-y-3">
                    {scaledIngredients.map((ing: any, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <span className="text-airbnb-rausch font-bold">{formatIngredientAmount(ing.amount, useFractions)}</span>
                          {ing.unit && <span className="text-amber-600 ml-1">{ing.unit}</span>}
                          {ing.originalAmount && ing.originalUnit && (
                            <span className="text-gray-500 text-sm ml-1">
                              ({ing.originalAmount} {ing.originalUnit})
                            </span>
                          )}
                          <span className="text-gray-700 ml-2">{ing.ingredient || ing.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {recipe.nutrition_facts && (
                  <div className="mt-6 bg-white rounded-xl p-6 border-2 border-gray-300 shadow-md">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Nutrition Facts</h4>
                    <p className="text-sm text-gray-600 mb-4">Per Serving</p>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b-4 border-black pb-2">
                        <span className="font-bold text-2xl">Calories</span>
                        <span className="font-bold text-2xl">{recipe.nutrition_facts.per_serving.calories}</span>
                      </div>
                      <div className="text-right text-xs text-gray-600 border-b border-gray-300 pb-1">% Daily Value*</div>
                      <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                        <span><span className="font-bold">Total Fat</span> {recipe.nutrition_facts.per_serving.total_fat}g</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.total_fat / 78) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-200 py-1 pl-4">
                        <span>Saturated Fat {recipe.nutrition_facts.per_serving.saturated_fat}g</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.saturated_fat / 20) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                        <span><span className="font-bold">Cholesterol</span> {recipe.nutrition_facts.per_serving.cholesterol}mg</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.cholesterol / 300) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                        <span><span className="font-bold">Sodium</span> {recipe.nutrition_facts.per_serving.sodium}mg</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.sodium / 2300) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-300 py-1">
                        <span><span className="font-bold">Total Carbohydrates</span> {recipe.nutrition_facts.per_serving.carbohydrates}g</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.carbohydrates / 275) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-200 py-1 pl-4">
                        <span>Dietary Fiber {recipe.nutrition_facts.per_serving.fiber}g</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.fiber / 28) * 100)}%</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-gray-300 py-1 pl-4">
                        <span>Total Sugars {recipe.nutrition_facts.per_serving.sugar}g</span>
                        <span></span>
                      </div>
                      <div className="flex justify-between text-sm border-b-4 border-black py-1">
                        <span><span className="font-bold">Protein</span> {recipe.nutrition_facts.per_serving.protein}g</span>
                        <span className="font-bold">{Math.round((recipe.nutrition_facts.per_serving.protein / 50) * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      ⚠️ {recipe.nutrition_facts.disclaimer || 'Estimated values based on ingredients. Actual nutrition may vary based on specific brands and preparation methods.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-gray-500 to-gray-500 rounded-full mr-3"></span>
                  Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-500 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-2">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 border-t-4 border-gray-200 pt-8">
              <h3 className="text-3xl font-bold mb-2 text-gray-800 flex items-center">
                <span className="text-4xl mr-3">👥</span>
                Community Kitchen
              </h3>
              <p className="text-gray-600 mb-6">See how others have adapted this recipe</p>

              {aggregatedSuggestions.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-gray-50 rounded-xl border-2 border-purple-200 shadow-lg">
                  <h4 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
                    <span className="text-3xl mr-2">🔥</span>
                    Popular Modifications
                  </h4>
                  <div className="space-y-3">
                    {aggregatedSuggestions.map((agg: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition border border-purple-100">
                        <div className="flex items-start">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full h-8 w-8 text-sm flex items-center justify-center font-bold mr-3 flex-shrink-0">
                            {agg.count}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 mb-2">{agg.comment.text}</p>
                            <p className="text-xs text-gray-500">
                              {agg.count === 1 ? (
                                <>✓ Suggested by {agg.users[0]}</>
                              ) : (
                                <>✓ {agg.count} users suggest this: {agg.users.join(', ')}</>
                              )}
                            </p>
                          </div>
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
                      onClick={() => setCommentType('suggestion')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${commentType === 'suggestion' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
                    >
                      💡 Suggestion
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
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                    rows={4}
                    placeholder="Share a substitution, scaling tip, or ask a question..."
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-airbnb-rausch text-white font-bold rounded-lg hover:bg-airbnb-rausch-dark transition shadow-sm"
                    >
                      Post Community Note
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">All Community Notes ({comments.length})</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select
                      value={commentSortBy}
                      onChange={(e) => setCommentSortBy(e.target.value as 'recent' | 'liked' | 'oldest')}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="liked">Most Liked</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                </div>
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  [...comments].sort((a, b) => {
                    if (commentSortBy === 'liked') {
                      return (b.likes_count || 0) - (a.likes_count || 0);
                    } else if (commentSortBy === 'oldest') {
                      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    } else {
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    }
                  }).map(comment => (
                    <div key={comment.id} className={`p-5 rounded-xl border-l-4 ${getCommentColor(comment.type)} shadow-sm hover:shadow-md transition`}>
                      <div className="flex items-start mb-3">
                        {comment.profiles?.profile_pic_url ? (
                          <img src={comment.profiles.profile_pic_url} alt={comment.profiles.display_name || comment.profiles.username || ''} className="w-10 h-10 rounded-full mr-3" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-xl">
                            {getCommentIcon(comment.type)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-800">{comment.profiles?.display_name || comment.profiles?.username || 'Unknown Cook'}</span>
                              <span className="inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                                {comment.type}
                              </span>
                              {(comment.likes_count || 0) >= 10 && (
                                <span className="inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  ⭐ Top Comment
                                </span>
                              )}
                              {comment.user_id === recipe?.user_id && (
                                <span className="inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  👨‍🍳 Author
                                </span>
                              )}
                              <span className="block text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed mt-2">{comment.text}</p>
                          <div className="flex items-center space-x-2 mt-3">
                            {user && (
                              <button
                                onClick={() => toggleCommentLike(comment.id)}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition text-sm font-semibold ${
                                  commentLikes.has(comment.id)
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <span>{commentLikes.has(comment.id) ? '❤️' : '🤍'}</span>
                                <span>{commentLikes.has(comment.id) ? 'Liked' : 'Like'} ({comment.likes_count || 0})</span>
                              </button>
                            )}
                            {comment.type === 'suggestion' && user && (
                              <button
                                onClick={() => {
                                  if (appliedModifications.has(comment.id)) {
                                    setAppliedModifications(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(comment.id);
                                      return newSet;
                                    });
                                  } else {
                                    setAppliedModifications(prev => new Set(prev).add(comment.id));
                                  }
                                }}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition text-sm font-semibold ${
                                  appliedModifications.has(comment.id)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                <span>{appliedModifications.has(comment.id) ? '✓ Applied' : 'Apply to Recipe'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
