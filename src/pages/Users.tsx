import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  profile_pic_url: string | null;
  created_at: string;
  recipe_count?: number;
  follower_count?: number;
}

export default function Users() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'active' | 'followers' | 'newest' | 'alphabetical'>('active');
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
    if (user) {
      loadFollowing();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, sortBy]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithStats = await Promise.all(
        (data || []).map(async (profile) => {
          const [recipesCount, followersCount] = await Promise.all([
            supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
            supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.id),
          ]);

          return {
            ...profile,
            recipe_count: recipesCount.count || 0,
            follower_count: followersCount.count || 0,
          };
        })
      );

      setUsers(usersWithStats);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowingIds(new Set(data.map(f => f.following_id)));
    } catch (err) {
      console.error('Error loading following:', err);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(u =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'active':
          return (b.recipe_count || 0) - (a.recipe_count || 0);
        case 'followers':
          return (b.follower_count || 0) - (a.follower_count || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alphabetical':
          return (a.username || '').localeCompare(b.username || '');
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const toggleFollow = async (userId: string) => {
    if (!user) {
      alert('Please log in to follow users');
      return;
    }

    try {
      if (followingIds.has(userId)) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: userId });

        setFollowingIds(prev => new Set(prev).add(userId));
      }

      await loadUsers();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-semibold" style={{ color: 'var(--forklore-red)' }}>Loading community...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-color)', fontFamily: 'var(--font-heading)' }}>
            Forklore Community
          </h1>
          <p className="text-xl text-gray-600">Connect with fellow home cooks and discover their culinary journeys</p>
        </div>

        <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, username, or bio..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('active')}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  sortBy === 'active'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
                style={sortBy === 'active' ? { background: 'var(--forklore-red)' } : {}}
              >
                Most Active
              </button>
              <button
                onClick={() => setSortBy('followers')}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  sortBy === 'followers'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
                style={sortBy === 'followers' ? { background: 'var(--forklore-red)' } : {}}
              >
                Most Followers
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  sortBy === 'newest'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
                style={sortBy === 'newest' ? { background: 'var(--forklore-red)' } : {}}
              >
                Newest Members
              </button>
              <button
                onClick={() => setSortBy('alphabetical')}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  sortBy === 'alphabetical'
                    ? 'text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
                style={sortBy === 'alphabetical' ? { background: 'var(--forklore-red)' } : {}}
              >
                A-Z
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 text-gray-700">
          <span className="font-semibold">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'} found
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-2xl text-gray-500">No users found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map(userProfile => (
              <div key={userProfile.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    {userProfile.profile_pic_url ? (
                      <img
                        src={userProfile.profile_pic_url}
                        alt={userProfile.username}
                        className="w-24 h-24 rounded-full mb-4 border-2 border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 border-2 border-gray-200"
                        style={{ background: 'var(--forklore-red)' }}
                      >
                        {userProfile.username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/profile/${userProfile.username}`)}
                      className="text-xl font-bold text-gray-800 hover:opacity-80 transition mb-2"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {userProfile.username}
                    </button>

                    {userProfile.bio && (
                      <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>
                        {userProfile.bio.length > 100 ? `${userProfile.bio.substring(0, 100)}...` : userProfile.bio}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500" style={{ fontFamily: 'var(--font-body)' }}>
                      <span>{userProfile.recipe_count} {userProfile.recipe_count === 1 ? 'recipe' : 'recipes'}</span>
                      <span>•</span>
                      <span>{userProfile.follower_count} {userProfile.follower_count === 1 ? 'follower' : 'followers'}</span>
                    </div>

                    <div className="flex space-x-2 w-full">
                      <button
                        onClick={() => navigate(`/profile/${userProfile.username}`)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        View Profile
                      </button>
                      {user && user.id !== userProfile.id && (
                        <button
                          onClick={() => toggleFollow(userProfile.id)}
                          className={`flex-1 px-4 py-2 rounded-lg transition font-semibold text-sm ${
                            followingIds.has(userProfile.id)
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'btn-primary text-white'
                          }`}
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {followingIds.has(userProfile.id) ? '✓ Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
