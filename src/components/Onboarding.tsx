import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OnboardingData {
  display_name: string;
  username: string;
  profile_pic_url: string;
  bio: string;
  cooking_experience: string;
  dietary_practices: string[];
  dietary_restrictions: string[];
  health_goals: string[];
  favorite_cooking_styles: string[];
  favorite_cuisines: string[];
  favorite_meal_types: string[];
  community_goals: string[];
  email_notifications: boolean;
  comment_notifications: boolean;
  follower_notifications: boolean;
  trending_notifications: boolean;
  profile_privacy: string;
}

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<OnboardingData>({
    display_name: '',
    username: '',
    profile_pic_url: '',
    bio: '',
    cooking_experience: '',
    dietary_practices: [],
    dietary_restrictions: [],
    health_goals: [],
    favorite_cooking_styles: [],
    favorite_cuisines: [],
    favorite_meal_types: [],
    community_goals: [],
    email_notifications: true,
    comment_notifications: true,
    follower_notifications: true,
    trending_notifications: false,
    profile_privacy: 'public',
  });

  const totalSteps = 5;

  const toggleArrayItem = (field: keyof OnboardingData, value: string) => {
    const currentArray = data[field] as string[];
    if (currentArray.includes(value)) {
      setData({ ...data, [field]: currentArray.filter(v => v !== value) });
    } else {
      setData({ ...data, [field]: [...currentArray, value] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...data,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      onComplete();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return data.display_name && data.username;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(44, 85, 48, 0.95)' }}>
      <div className="w-full max-w-2xl rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 my-8" style={{ background: 'var(--forklore-cream)' }}>
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Welcome to Forklore! 🍴
          </h2>
          <p className="text-sm sm:text-base" style={{ color: 'var(--forklore-warm-brown)' }}>Let's personalize your culinary journey</p>
        </div>

        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-airbnb-dark-gray">Step {step} of {totalSteps}</span>
            <span className="text-sm text-airbnb-dark-gray">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-300 bg-airbnb-rausch"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto mb-4 sm:mb-6 px-1">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-airbnb-black">Tell us about yourself</h3>

            <div>
              <label className="block mb-2 font-medium text-airbnb-black">
                Display Name *
              </label>
              <input
                type="text"
                value={data.display_name}
                onChange={(e) => setData({ ...data, display_name: e.target.value })}
                placeholder="How you'll appear to other cooks"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-airbnb-black">
                Username *
              </label>
              <input
                type="text"
                value={data.username}
                onChange={(e) => setData({ ...data, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="unique_handle"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch bg-white"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-airbnb-black">
                Profile Picture URL (optional)
              </label>
              <input
                type="url"
                value={data.profile_pic_url}
                onChange={(e) => setData({ ...data, profile_pic_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch bg-white"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-airbnb-black">Share your cooking story</h3>

            <div>
              <label className="block mb-2 font-medium text-airbnb-black">
                Short Bio (optional)
              </label>
              <textarea
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                placeholder="Tell other cooks about your culinary background..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-airbnb-rausch resize-none bg-white"
              />
              <p className="text-sm mt-1 text-gray-600">{data.bio.length}/500 characters</p>
            </div>

            <div>
              <label className="block mb-3 font-medium text-airbnb-black">
                Cooking Experience
              </label>
              <div className="space-y-2">
                {[
                  { value: 'beginner', label: 'Just starting out' },
                  { value: 'home_cook', label: 'Home cook (1-5 years)' },
                  { value: 'experienced', label: 'Experienced (5-10 years)' },
                  { value: 'seasoned', label: 'Seasoned cook (10+ years)' },
                  { value: 'professional', label: 'Professional chef' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center p-3 rounded-lg cursor-pointer transition hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cooking_experience"
                      value={option.value}
                      checked={data.cooking_experience === option.value}
                      onChange={(e) => setData({ ...data, cooking_experience: e.target.value })}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-airbnb-black">Your dietary preferences</h3>
            <p className="text-sm mb-4 text-gray-600">Select all that apply - helps us recommend recipes</p>

            <div>
              <h4 className="font-medium mb-3 text-airbnb-black">Dietary Practices</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Vegan', 'Vegetarian', 'Pescatarian', 'Kosher', 'Halal', 'Paleo', 'Keto', 'Low-carb', 'Mediterranean'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('dietary_practices', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                      data.dietary_practices.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Dietary Restrictions</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Gluten-free', 'Dairy-free', 'Nut-free', 'Soy-free', 'Egg-free', 'Shellfish-free'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('dietary_restrictions', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                      data.dietary_restrictions.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Health Goals</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['High protein', 'Low sodium', 'Low sugar', 'Heart healthy', 'Diabetic-friendly'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('health_goals', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium ${
                      data.health_goals.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-airbnb-black">What kind of recipes interest you?</h3>
            <p className="text-sm mb-4 text-gray-600">Select 3-10 tags to personalize your feed</p>

            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Cooking Style</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Quick & Easy', 'Comfort Food', 'Healthy', 'Gourmet', 'Family-Friendly', 'Meal Prep', 'One-Pot', 'Slow Cooker', 'Instant Pot'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('favorite_cooking_styles', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                      data.favorite_cooking_styles.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Cuisines</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'French', 'American', 'Middle Eastern', 'Caribbean', 'Japanese', 'Thai', 'Greek'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('favorite_cuisines', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                      data.favorite_cuisines.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Meal Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Appetizers', 'Baking', 'Beverages', 'Soups & Stews'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleArrayItem('favorite_meal_types', item)}
                    className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                      data.favorite_meal_types.includes(item) ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Selected: {data.favorite_cooking_styles.length + data.favorite_cuisines.length + data.favorite_meal_types.length} tags
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-airbnb-black">Join the Forklore community</h3>

            <div>
              <h4 className="font-medium mb-3 text-airbnb-black">I'm here to:</h4>
              <div className="space-y-2">
                {['Share my family recipes', 'Discover new recipes', 'Learn cooking techniques', 'Connect with other home cooks', 'Preserve culinary traditions'].map((item) => (
                  <label key={item} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="checkbox"
                      checked={data.community_goals.includes(item)}
                      onChange={() => toggleArrayItem('community_goals', item)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-airbnb-black">Notification Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={data.email_notifications}
                    onChange={(e) => setData({ ...data, email_notifications: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Email me weekly recipe recommendations</span>
                </label>
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={data.comment_notifications}
                    onChange={(e) => setData({ ...data, comment_notifications: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Notify me when someone comments on my recipes</span>
                </label>
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={data.follower_notifications}
                    onChange={(e) => setData({ ...data, follower_notifications: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Notify me when someone follows me</span>
                </label>
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    checked={data.trending_notifications}
                    onChange={(e) => setData({ ...data, trending_notifications: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Send me trending recipes in my favorite categories</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-airbnb-black">Privacy</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={data.profile_privacy === 'public'}
                    onChange={(e) => setData({ ...data, profile_privacy: e.target.value })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Public profile (anyone can see my recipes)</span>
                </label>
                <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={data.profile_privacy === 'private'}
                    onChange={(e) => setData({ ...data, profile_privacy: e.target.value })}
                    className="mr-3"
                  />
                  <span className="text-gray-700">Private profile (only followers see my recipes)</span>
                </label>
              </div>
            </div>
          </div>
        )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-4 sm:mt-6 pt-4 border-t" style={{ borderColor: 'rgba(139, 111, 71, 0.2)' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
              disabled={loading}
            >
              ← Back
            </button>
          )}

          <div className="sm:ml-auto flex gap-2 flex-1 sm:flex-initial">
            {step < totalSteps ? (
              <>
                {step > 2 && (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base flex-1 sm:flex-initial"
                    style={{ color: 'var(--forklore-warm-brown)', background: 'transparent' }}
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={() => setStep(step + 1)}
                  className="btn-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base flex-1 sm:flex-initial"
                  disabled={!canContinue() || loading}
                >
                  Continue →
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base flex-1 sm:flex-initial"
                disabled={loading || !canContinue()}
              >
                {loading ? 'Saving...' : 'Complete Setup →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
