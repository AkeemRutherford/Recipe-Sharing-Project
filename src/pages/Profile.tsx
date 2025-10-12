import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatTimeAgo, groupActivitiesByDate } from '../lib/timeAgo';

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.2-13.2-4.2 4.2m-6 6-4.2 4.2M1 12h6m6 0h6m-13.2 5.2 4.2-4.2m6-6 4.2-4.2"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>;

interface ProfileData {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
  favorite_tags: string[];
  created_at: string;
}

interface ProfileStats {
  recipesCount: number;
  likesReceived: number;
  commentsCount: number;
  followersCount: number;
  followingCount: number;
}

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    recipesCount: 0,
    likesReceived: 0,
    commentsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'activity' | 'followers' | 'following' | 'settings'>('recipes');
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  const [editBio, setEditBio] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [editFavoriteTags, setEditFavoriteTags] = useState<string[]>([]);

  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [recipeUpdates, setRecipeUpdates] = useState(false);
  const [measurementUnits, setMeasurementUnits] = useState('imperial');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const availableTags = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Quick', 'Easy', 'Healthy', 'Comfort Food', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Holiday', 'Weeknight', 'Kosher'];

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', username!)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        alert('Profile not found');
        navigate('/');
        return;
      }

      setProfile(profileData);
      setEditBio(profileData.bio || '');
      setEditProfilePic(profileData.profile_pic_url || '');
      setEditFavoriteTags(profileData.favorite_tags || []);

      await Promise.all([
        loadRecipes(profileData.id),
        loadStats(profileData.id),
        loadFollowStatus(profileData.id),
      ]);

      if (isOwnProfile) {
        loadUserPreferences();
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, profiles!recipes_user_id_fkey(username, profile_pic_url)')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error loading recipes:', err);
    }
  };

  const loadStats = async (profileId: string) => {
    try {
      const [recipesCount, likesData, commentsData, followersData, followingData] = await Promise.all([
        supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
        supabase.from('recipe_likes').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
        supabase.from('recipe_modifications').select('id', { count: 'exact', head: true }).eq('user_id', profileId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profileId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', profileId),
      ]);

      const likesReceived = await supabase
        .from('recipe_likes')
        .select('recipe_id')
        .in('recipe_id', recipes.map(r => r.id));

      setStats({
        recipesCount: recipesCount.count || 0,
        likesReceived: likesReceived.data?.length || 0,
        commentsCount: commentsData.count || 0,
        followersCount: followersData.count || 0,
        followingCount: followingData.count || 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadFollowStatus = async (profileId: string) => {
    if (!user || user.id === profileId) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profileId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (err) {
      console.error('Error loading follow status:', err);
    }
  };

  const loadActivities = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          recipes(title),
          profiles!activities_target_user_id_fkey(username)
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error('Error loading activities:', err);
    }
  };

  const loadFollowers = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, profiles!follows_follower_id_fkey(id, username, profile_pic_url, bio)')
        .eq('following_id', profileId);

      if (error) throw error;
      setFollowers(data?.map(f => f.profiles) || []);
    } catch (err) {
      console.error('Error loading followers:', err);
    }
  };

  const loadFollowing = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(id, username, profile_pic_url, bio)')
        .eq('follower_id', profileId);

      if (error) throw error;
      setFollowing(data?.map(f => f.profiles) || []);
    } catch (err) {
      console.error('Error loading following:', err);
    }
  };

  const toggleFollow = async () => {
    if (!user || !profile) return;

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.id });
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: editBio,
          profile_pic_url: editProfilePic,
          favorite_tags: editFavoriteTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, bio: editBio, profile_pic_url: editProfilePic, favorite_tags: editFavoriteTags });
      setEditModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  const toggleFavoriteTag = (tag: string) => {
    setEditFavoriteTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const loadUserPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEmailNotifications(data.email_notifications);
        setRecipeUpdates(data.recipe_updates);
        setMeasurementUnits(data.measurement_units);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_preferences')
          .update({
            email_notifications: emailNotifications,
            recipe_updates: recipeUpdates,
            measurement_units: measurementUnits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            email_notifications: emailNotifications,
            recipe_updates: recipeUpdates,
            measurement_units: measurementUnits,
          });

        if (error) throw error;
      }

      alert('Settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      navigate('/login');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      alert(`Failed to delete account: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-airbnb-dark-gray">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
              <div className="flex items-end space-x-6">
                {profile.profile_pic_url ? (
                  <img
                    src={profile.profile_pic_url}
                    alt={profile.username}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-700">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="pb-4">
                  <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
                  {profile.full_name && (
                    <p className="text-gray-600">{profile.full_name}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                {isOwnProfile ? (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="btn-primary flex items-center space-x-2 px-6 py-3 text-white rounded-full font-semibold"
                  >
                    <EditIcon />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={toggleFollow}
                    className={`px-6 py-3 rounded-full font-semibold transition ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'btn-primary text-white'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-6 text-gray-700 leading-relaxed">{profile.bio}</p>
            )}

            {profile.favorite_tags && profile.favorite_tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.favorite_tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('recipes')}
            className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-3xl font-bold text-airbnb-rausch">{stats.recipesCount}</div>
            <div className="text-sm text-gray-600 mt-1">Recipes</div>
          </button>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-airbnb-rausch">{stats.likesReceived}</div>
            <div className="text-sm text-gray-600 mt-1">Likes</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-airbnb-rausch">{stats.commentsCount}</div>
            <div className="text-sm text-gray-600 mt-1">Comments</div>
          </div>
          <button
            onClick={() => {
              setActiveTab('followers');
              if (profile) loadFollowers(profile.id);
            }}
            className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-3xl font-bold text-airbnb-rausch">{stats.followersCount}</div>
            <div className="text-sm text-gray-600 mt-1">Followers</div>
          </button>
          <button
            onClick={() => {
              setActiveTab('following');
              if (profile) loadFollowing(profile.id);
            }}
            className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <div className="text-3xl font-bold text-airbnb-rausch">{stats.followingCount}</div>
            <div className="text-sm text-gray-600 mt-1">Following</div>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`pb-4 px-6 font-semibold transition whitespace-nowrap ${
                activeTab === 'recipes'
                  ? 'text-airbnb-rausch border-b-2 border-airbnb-rausch'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Recipes ({stats.recipesCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('activity');
                if (profile) loadActivities(profile.id);
              }}
              className={`pb-4 px-6 font-semibold transition whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'text-airbnb-rausch border-b-2 border-airbnb-rausch'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => {
                setActiveTab('followers');
                if (profile) loadFollowers(profile.id);
              }}
              className={`pb-4 px-6 font-semibold transition whitespace-nowrap ${
                activeTab === 'followers'
                  ? 'text-airbnb-rausch border-b-2 border-airbnb-rausch'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Followers ({stats.followersCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('following');
                if (profile) loadFollowing(profile.id);
              }}
              className={`pb-4 px-6 font-semibold transition whitespace-nowrap ${
                activeTab === 'following'
                  ? 'text-airbnb-rausch border-b-2 border-airbnb-rausch'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Following ({stats.followingCount})
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-4 px-6 font-semibold transition whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'text-airbnb-rausch border-b-2 border-airbnb-rausch'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Settings
              </button>
            )}
          </div>

          {activeTab === 'recipes' && (
            <div>
              {recipes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No recipes yet</p>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate('/add-recipe')}
                      className="btn-primary mt-4 px-6 py-3 text-white rounded-full font-semibold"
                    >
                      Create Your First Recipe
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                    >
                      <div className="relative h-48">
                        {recipe.image_url ? (
                          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-5xl">
                            🍳
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{recipe.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <HeartIcon />
                            <span>{recipe.likes_count || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ClockIcon />
                            <span>{recipe.total_time} min</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupActivitiesByDate(activities)).map(([period, acts]) => (
                    acts.length > 0 && (
                      <div key={period}>
                        <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">{period}</h3>
                        <div className="space-y-3">
                          {acts.map((activity: any) => (
                            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                              <div className="flex-shrink-0 mt-1">
                                {activity.activity_type === 'posted_recipe' && <span className="text-2xl">📝</span>}
                                {activity.activity_type === 'commented' && <span className="text-2xl font-bold">C</span>}
                                {activity.activity_type === 'liked' && <span className="text-2xl font-bold">L</span>}
                                {activity.activity_type === 'saved' && <span className="text-2xl font-bold">S</span>}
                                {activity.activity_type === 'followed' && <span className="text-2xl font-bold">F</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800">
                                  {activity.activity_type === 'posted_recipe' && (
                                    <>
                                      Posted recipe{' '}
                                      <button
                                        onClick={() => navigate(`/recipe/${activity.recipe_id}`)}
                                        className="font-semibold text-airbnb-rausch hover:underline"
                                      >
                                        {activity.recipes?.title}
                                      </button>
                                    </>
                                  )}
                                  {activity.activity_type === 'commented' && (
                                    <>
                                      Commented on{' '}
                                      <button
                                        onClick={() => navigate(`/recipe/${activity.recipe_id}`)}
                                        className="font-semibold text-airbnb-rausch hover:underline"
                                      >
                                        {activity.recipes?.title}
                                      </button>
                                    </>
                                  )}
                                  {activity.activity_type === 'liked' && (
                                    <>
                                      Liked{' '}
                                      <button
                                        onClick={() => navigate(`/recipe/${activity.recipe_id}`)}
                                        className="font-semibold text-airbnb-rausch hover:underline"
                                      >
                                        {activity.recipes?.title}
                                      </button>
                                    </>
                                  )}
                                  {activity.activity_type === 'saved' && (
                                    <>
                                      Saved{' '}
                                      <button
                                        onClick={() => navigate(`/recipe/${activity.recipe_id}`)}
                                        className="font-semibold text-airbnb-rausch hover:underline"
                                      >
                                        {activity.recipes?.title}
                                      </button>
                                    </>
                                  )}
                                  {activity.activity_type === 'followed' && (
                                    <>
                                      Started following{' '}
                                      <button
                                        onClick={() => navigate(`/profile/${activity.profiles?.username}`)}
                                        className="font-semibold text-airbnb-rausch hover:underline"
                                      >
                                        {activity.profiles?.username}
                                      </button>
                                    </>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(activity.created_at)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">No followers yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followers.map((follower: any) => (
                    <div
                      key={follower.id}
                      onClick={() => navigate(`/profile/${follower.username}`)}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                      {follower.profile_pic_url ? (
                        <img src={follower.profile_pic_url} alt={follower.username} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700">
                          {follower.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{follower.username}</p>
                        {follower.bio && (
                          <p className="text-sm text-gray-600 truncate">{follower.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">Not following anyone yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {following.map((followed: any) => (
                    <div
                      key={followed.id}
                      onClick={() => navigate(`/profile/${followed.username}`)}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                      {followed.profile_pic_url ? (
                        <img src={followed.profile_pic_url} alt={followed.username} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700">
                          {followed.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{followed.username}</p>
                        {followed.bio && (
                          <p className="text-sm text-gray-600 truncate">{followed.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && isOwnProfile && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <SettingsIcon />
                    <h3 className="text-xl font-bold text-gray-800">Account Settings</h3>
                  </div>
                  {settingsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>

                {settingsExpanded && (
                  <div className="p-6 pt-0 space-y-6">
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailNotifications}
                              onChange={(e) => setEmailNotifications(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-airbnb-rausch rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-airbnb-rausch"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Recipe Updates</p>
                            <p className="text-sm text-gray-600">Get notified about recipe interactions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={recipeUpdates}
                              onChange={(e) => setRecipeUpdates(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-airbnb-rausch rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-airbnb-rausch"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Display Preferences</h4>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block">
                          <span className="font-medium text-gray-800 mb-2 block">Measurement Units</span>
                          <select
                            value={measurementUnits}
                            onChange={(e) => setMeasurementUnits(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch"
                          >
                            <option value="imperial">Imperial (cups, oz, °F)</option>
                            <option value="metric">Metric (ml, g, °C)</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <button
                        onClick={handleSaveSettings}
                        className="btn-primary w-full px-6 py-3 text-white rounded-full font-semibold"
                      >
                        Save Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition mb-3"
                      >
                        Sign Out
                      </button>

                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Delete Account</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your recipes and data will be permanently deleted.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold"
              >
                Delete Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture URL</label>
                <input
                  type="text"
                  value={editProfilePic}
                  onChange={(e) => setEditProfilePic(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch"
                />
                <p className="text-sm text-gray-500 mt-1">{editBio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Favorite Tags</label>
                <p className="text-xs text-gray-600 mb-3">Select tags to personalize your feed</p>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFavoriteTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        editFavoriteTags.includes(tag)
                          ? 'bg-airbnb-rausch text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">{editFavoriteTags.length} tags selected</p>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleSaveProfile}
                className="btn-primary flex-1 px-6 py-3 text-white rounded-full font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
