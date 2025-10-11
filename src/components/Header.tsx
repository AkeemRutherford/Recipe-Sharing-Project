import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Notifications from './Notifications';


const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      loadUsername();
    }
  }, [user]);

  const loadUsername = async () => {
    try {
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
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <div className="flex flex-col items-start">
              <img
                src="/forklore-logo.png"
                alt="Forklore"
                className="h-12 w-auto"
              />
              <p className="forklore-tagline text-airbnb-foggy mt-1">
                Share Your Culinary Journey
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`font-medium transition ${
                isActive('/') ? 'text-airbnb-black border-b-2 border-airbnb-black pb-1' : 'text-airbnb-dark-gray hover:text-airbnb-black'
              }`}
            >
              Explore Recipes
            </button>
            <button
              onClick={() => navigate('/users')}
              className={`font-medium transition ${
                isActive('/users') ? 'text-airbnb-black border-b-2 border-airbnb-black pb-1' : 'text-airbnb-dark-gray hover:text-airbnb-black'
              }`}
            >
              Community
            </button>
            <button
              onClick={() => navigate('/my-recipes')}
              className={`font-medium transition ${
                isActive('/my-recipes') ? 'text-airbnb-black border-b-2 border-airbnb-black pb-1' : 'text-airbnb-dark-gray hover:text-airbnb-black'
              }`}
            >
              My Recipes
            </button>
            {username && (
              <button
                onClick={() => navigate(`/profile/${username}`)}
                className={`font-medium transition ${
                  isActive(`/profile/${username}`) ? 'text-airbnb-black border-b-2 border-airbnb-black pb-1' : 'text-airbnb-dark-gray hover:text-airbnb-black'
                }`}
              >
                My Profile
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/add-recipe')}
              className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold"
            >
              <UploadIcon />
              <span className="hidden md:inline">Share Recipe</span>
            </button>

            <Notifications />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 rounded-full p-2 border border-gray-300 hover:shadow-md transition text-airbnb-dark-gray hover:text-airbnb-black bg-white"
              >
                <UserIcon />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (username) {
                          navigate(`/profile/${username}`);
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/my-recipes');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100"
                    >
                      My Recipes
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/site-assets');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 text-sm"
                    >
                      Site Assets
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/initialize-assets');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 text-sm"
                      style={{ color: 'var(--forklore-warm-red)' }}
                    >
                      Initialize Assets
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition text-red-600 font-semibold flex items-center space-x-2"
                    >
                      <LogoutIcon />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
