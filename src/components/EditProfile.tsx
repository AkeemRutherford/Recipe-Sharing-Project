import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EditProfileProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function EditProfile({ onClose, onSaved }: EditProfileProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'dietary' | 'favorites' | 'community'>('basic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    display_name: '',
    username: '',
    profile_pic_url: '',
    bio: '',
    cooking_experience: '',
    dietary_practices: [] as string[],
    dietary_restrictions: [] as string[],
    health_goals: [] as string[],
    favorite_cuisines: [] as string[],
    favorite_meal_types: [] as string[],
    favorite_cooking_styles: [] as string[],
    community_goals: [] as string[],
    email_notifications: true,
    comment_notifications: true,
    follower_notifications: true,
    trending_notifications: false,
    profile_privacy: 'public',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setProfileData({
          display_name: data.display_name || '',
          username: data.username || '',
          profile_pic_url: data.profile_pic_url || '',
          bio: data.bio || '',
          cooking_experience: data.cooking_experience || '',
          dietary_practices: data.dietary_practices || [],
          dietary_restrictions: data.dietary_restrictions || [],
          health_goals: data.health_goals || [],
          favorite_cuisines: data.favorite_cuisines || [],
          favorite_meal_types: data.favorite_meal_types || [],
          favorite_cooking_styles: data.favorite_cooking_styles || [],
          community_goals: data.community_goals || [],
          email_notifications: data.email_notifications ?? true,
          comment_notifications: data.comment_notifications ?? true,
          follower_notifications: data.follower_notifications ?? true,
          trending_notifications: data.trending_notifications ?? false,
          profile_privacy: data.profile_privacy || 'public',
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (field: keyof typeof profileData, value: string) => {
    const currentArray = profileData[field] as string[];
    if (currentArray.includes(value)) {
      setProfileData({ ...profileData, [field]: currentArray.filter(v => v !== value) });
    } else {
      setProfileData({ ...profileData, [field]: [...currentArray, value] });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(44, 85, 48, 0.95)' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(44, 85, 48, 0.95)' }}>
      <div className="w-full max-w-4xl rounded-xl shadow-2xl my-8" style={{ background: 'var(--forklore-cream)' }}>
        <div className="flex items-center justify-between p-6 border-b-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-3xl hover:opacity-70 transition"
            style={{ color: 'var(--forklore-warm-brown)' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg" style={{ background: 'rgba(196, 69, 54, 0.1)', border: '1px solid var(--forklore-warm-red)' }}>
            <p style={{ color: 'var(--forklore-warm-red)' }}>{error}</p>
          </div>
        )}

        <div className="border-b-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
          <div className="flex overflow-x-auto">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'dietary', label: 'Dietary' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'community', label: 'Community' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id ? 'border-b-4' : 'hover:bg-white'
                }`}
                style={{
                  color: activeTab === tab.id ? 'var(--forklore-burnt-orange)' : 'var(--forklore-warm-brown)',
                  borderColor: activeTab === tab.id ? 'var(--forklore-burnt-orange)' : 'transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--forklore-warm-brown)', background: 'white' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--forklore-warm-brown)', background: 'white' }}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={profileData.profile_pic_url}
                  onChange={(e) => setProfileData({ ...profileData, profile_pic_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--forklore-warm-brown)', background: 'white' }}
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: 'var(--forklore-warm-brown)', background: 'white' }}
                  placeholder="Tell others about your culinary journey..."
                />
                <p className="text-sm mt-1" style={{ color: 'var(--forklore-warm-brown)' }}>
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block mb-3 font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
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
                    <label key={option.value} className="flex items-center p-3 rounded-lg cursor-pointer transition hover:bg-white">
                      <input
                        type="radio"
                        name="cooking_experience"
                        value={option.value}
                        checked={profileData.cooking_experience === option.value}
                        onChange={(e) => setProfileData({ ...profileData, cooking_experience: e.target.value })}
                        className="mr-3"
                      />
                      <span style={{ color: 'var(--forklore-forest-green)' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dietary' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Dietary Practices</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Vegan', 'Vegetarian', 'Pescatarian', 'Kosher', 'Halal', 'Paleo', 'Keto', 'Low-carb', 'Mediterranean'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('dietary_practices', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium ${
                        profileData.dietary_practices.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Dietary Restrictions</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Gluten-free', 'Dairy-free', 'Nut-free', 'Soy-free', 'Egg-free', 'Shellfish-free'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('dietary_restrictions', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium ${
                        profileData.dietary_restrictions.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Health Goals</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['High protein', 'Low sodium', 'Low sugar', 'Heart healthy', 'Diabetic-friendly'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('health_goals', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium ${
                        profileData.health_goals.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Cooking Styles</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Quick & Easy', 'Comfort Food', 'Healthy', 'Gourmet', 'Family-Friendly', 'Meal Prep', 'One-Pot', 'Slow Cooker', 'Instant Pot'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('favorite_cooking_styles', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                        profileData.favorite_cooking_styles.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Favorite Cuisines</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'French', 'American', 'Middle Eastern', 'Caribbean', 'Japanese', 'Thai', 'Greek'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('favorite_cuisines', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                        profileData.favorite_cuisines.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Meal Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Appetizers', 'Baking', 'Beverages', 'Soups & Stews'].map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('favorite_meal_types', item)}
                      className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                        profileData.favorite_meal_types.includes(item) ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Community Goals</h4>
                <div className="space-y-2">
                  {['Share my family recipes', 'Discover new recipes', 'Learn cooking techniques', 'Connect with other home cooks', 'Preserve culinary traditions'].map((item) => (
                    <label key={item} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                      <input
                        type="checkbox"
                        checked={profileData.community_goals.includes(item)}
                        onChange={() => toggleArrayItem('community_goals', item)}
                        className="mr-3"
                      />
                      <span style={{ color: 'var(--forklore-forest-green)' }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Notification Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="checkbox"
                      checked={profileData.email_notifications}
                      onChange={(e) => setProfileData({ ...profileData, email_notifications: e.target.checked })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Email me weekly recipe recommendations</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="checkbox"
                      checked={profileData.comment_notifications}
                      onChange={(e) => setProfileData({ ...profileData, comment_notifications: e.target.checked })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Notify me when someone comments on my recipes</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="checkbox"
                      checked={profileData.follower_notifications}
                      onChange={(e) => setProfileData({ ...profileData, follower_notifications: e.target.checked })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Notify me when someone follows me</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="checkbox"
                      checked={profileData.trending_notifications}
                      onChange={(e) => setProfileData({ ...profileData, trending_notifications: e.target.checked })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Send me trending recipes</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>Privacy</h4>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={profileData.profile_privacy === 'public'}
                      onChange={(e) => setProfileData({ ...profileData, profile_privacy: e.target.value })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Public profile (anyone can see my recipes)</span>
                  </label>
                  <label className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={profileData.profile_privacy === 'private'}
                      onChange={(e) => setProfileData({ ...profileData, profile_privacy: e.target.value })}
                      className="mr-3"
                    />
                    <span style={{ color: 'var(--forklore-forest-green)' }}>Private profile (only followers see my recipes)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
          <button
            onClick={onClose}
            className="btn-secondary px-6 py-3 rounded-lg font-semibold"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-8 py-3 rounded-lg font-semibold"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
