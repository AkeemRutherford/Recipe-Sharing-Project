import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SearchMagnifyIcon, ChefHatsIcon, CookbookIcon, RecipeBookIcon } from './ForkloreIcons';


export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadUsername();
    }
  }, [user]);

  const loadUsername = async () => {
    try {
      setUsernameLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUsername(data.username);
      }
    } catch (err) {
      console.error('Error loading username:', err);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const isProfileActive = () => {
    return location.pathname === '/profile' ||
           (username && location.pathname === `/profile/${username}`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition flex-shrink-0"
          >
            <img src="/forklore-logo.svg" alt="Forklore" className="w-10 h-10" />
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchMagnifyIcon size={20} />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/users')}
              className={`p-2 rounded-full transition ${
                isActive('/users')
                  ? 'bg-gray-100 text-airbnb-rausch'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-airbnb-black'
              }`}
              title="Community"
              aria-label="Community"
            >
              <ChefHatsIcon size={24} />
            </button>

            <button
              onClick={() => navigate('/saved-recipes')}
              className={`p-2 rounded-full transition ${
                isActive('/saved-recipes')
                  ? 'bg-gray-100 text-airbnb-rausch'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-airbnb-black'
              }`}
              title="Saved Recipes"
              aria-label="Saved Recipes"
            >
              <CookbookIcon size={24} />
            </button>

            <button
              onClick={() => navigate('/add-recipe')}
              className={`p-2 rounded-full transition ${
                isActive('/add-recipe')
                  ? 'bg-gray-100 text-airbnb-rausch'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-airbnb-black'
              }`}
              title="Add Recipe"
              aria-label="Add Recipe"
            >
              <RecipeBookIcon size={24} />
            </button>

            <button
              onClick={() => {
                if (username) {
                  navigate(`/profile/${username}`);
                } else {
                  navigate('/profile');
                }
              }}
              className={`p-2 rounded-full transition ${
                isProfileActive()
                  ? 'bg-gray-100 text-airbnb-rausch'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-airbnb-black'
              }`}
              title={usernameLoading ? 'Loading profile...' : 'My Profile'}
              aria-label="My Profile"
            >
              <ChefHatsIcon size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
