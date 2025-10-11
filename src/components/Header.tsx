import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Notifications from './Notifications';

const ChefHatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
    <line x1="6" y1="17" x2="18" y2="17"/>
  </svg>
);

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
    <header className="shadow-lg sticky top-0 z-50" style={{ background: 'var(--forklore-forest-green)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <div className="flex items-center space-x-3">
              <ChefHatIcon />
              <div>
                <h1 className="forklore-logo text-3xl" style={{ color: 'var(--forklore-cream)' }}>
                  Forklore
                </h1>
                <p className="forklore-tagline" style={{ color: 'var(--forklore-golden-yellow)' }}>
                  Share Your Culinary Journey
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className={`font-semibold transition ${
                isActive('/') ? 'underline' : 'hover:underline'
              }`}
              style={{ color: isActive('/') ? 'var(--forklore-golden-yellow)' : 'var(--forklore-cream)' }}
            >
              Explore Recipes
            </button>
            <button
              onClick={() => navigate('/users')}
              className={`font-semibold transition ${
                isActive('/users') ? 'underline' : 'hover:underline'
              }`}
              style={{ color: isActive('/users') ? 'var(--forklore-golden-yellow)' : 'var(--forklore-cream)' }}
            >
              Community
            </button>
            <button
              onClick={() => navigate('/my-recipes')}
              className={`font-semibold transition ${
                isActive('/my-recipes') ? 'underline' : 'hover:underline'
              }`}
              style={{ color: isActive('/my-recipes') ? 'var(--forklore-golden-yellow)' : 'var(--forklore-cream)' }}
            >
              My Recipes
            </button>
            {username && (
              <button
                onClick={() => navigate(`/profile/${username}`)}
                className={`font-semibold transition ${
                  isActive(`/profile/${username}`) ? 'underline' : 'hover:underline'
                }`}
                style={{ color: isActive(`/profile/${username}`) ? 'var(--forklore-golden-yellow)' : 'var(--forklore-cream)' }}
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
                className="flex items-center space-x-2 rounded-lg p-2 transition"
                style={{ color: 'var(--forklore-cream)', background: 'rgba(255, 255, 255, 0.1)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
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
