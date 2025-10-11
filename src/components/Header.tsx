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

const ForkloreLogoIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg
    viewBox="0 0 243.5 217.9"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M107.2,22.5c2.4.5,2.8,2.5,2.9,4.7-.3,10.8-.3,21.6.1,32.3s.1.9.3,1.3h0c.4,1.1,1.4,1.8,2.5,2.1,3.2.7,5.7-.5,6.6-4.2s0-.5,0-.8c-.2-11.3-.2-22.6,0-33.8,0-.2,0-.4,0-.5,1.9-1.6,4.8-2,6.1.2s.4,1,.5,1.6c.5,8.6.5,17.2,0,25.8s0,.3,0,.4c.2,2.4.3,4.8.3,7.4.7,6.4,10.4,5.6,9.5-1.1-.4-10.3-.3-21.1,0-31.6s.1-.9.3-1.3l.4-.9c2.1-3.8,6.5-1.5,6.3,2.7.3,11.9.6,23.8,1,35.8,0,.1,0,.2,0,.4-.3,3.9-.8,8-3.1,11.3s-.2.3-.3.5c-.7,1.6-1.7,3-2.9,4.3l-.9.7c-3.6,2.3-9.6,4-9.1,8.6,1,9.7,1.8,42.3,2,51.3s.3,7.1-.9,8.9-5.1,2.7-5.8,2.7c-1.2,0-2.7-.6-3.8-1.3s-1.9-1.4-2-1.5c-.9-2-.6-11.1-.5-13.9.2-13.1,1.3-26.2,1.5-39.3s.7-3.7.5-6c-.5-5.2-2.6-5.2-5.8-7.7s-.3-.2-.4-.3c-2.3-1.2-4.4-2.9-6.3-4.9,0-.1,0-.4,0-.5-3.7-5.2-4.2-11.5-4.3-17.6s0-32.6,1.8-35,2.6-1.4,3.5-.8Z"/>
    <g>
      <path d="M21,163.1h23.4v7.1h-14.7v8.8h13.8v7.1h-13.8v15.4h-8.7v-38.3Z"/>
      <path d="M76.7,187.2c0,10.2-7.2,14.8-14.7,14.8s-14.4-5.3-14.4-14.3,5.9-14.7,14.8-14.7,14.2,5.9,14.2,14.2ZM56.5,187.5c0,4.8,2,8.4,5.7,8.4s5.5-3.4,5.5-8.4-1.6-8.4-5.5-8.4-5.7,4.3-5.7,8.4Z"/>
      <path d="M82,182.8c0-4.1-.1-6.8-.2-9.2h7.5l.3,5.1h.2c1.4-4,4.8-5.7,7.5-5.7s1.2,0,1.8.1v8.1c-.6-.1-1.4-.2-2.3-.2-3.2,0-5.3,1.7-5.9,4.4-.1.6-.2,1.3-.2,1.9v14.1h-8.6v-18.7Z"/>
      <path d="M112.1,185.3h.1c.6-1.1,1.3-2.3,2-3.4l5.6-8.4h10.4l-10,11.3,11.4,16.6h-10.6l-6.7-11.4-2.2,2.7v8.7h-8.6v-40.4h8.6v24.3Z"/>
      <path d="M134.9,161h8.6v40.4h-8.6v-40.4Z"/>
      <path d="M178,187.2c0,10.2-7.2,14.8-14.7,14.8s-14.4-5.3-14.4-14.3,5.9-14.7,14.8-14.7,14.2,5.9,14.2,14.2ZM157.9,187.5c0,4.8,2,8.4,5.7,8.4s5.5-3.4,5.5-8.4-1.6-8.4-5.5-8.4-5.7,4.3-5.7,8.4Z"/>
      <path d="M183.4,182.8c0-4.1-.1-6.8-.2-9.2h7.5l.3,5.1h.2c1.4-4,4.8-5.7,7.5-5.7s1.2,0,1.8.1v8.1c-.6-.1-1.4-.2-2.3-.2-3.2,0-5.3,1.7-5.9,4.4-.1.6-.2,1.3-.2,1.9v14.1h-8.6v-18.7Z"/>
      <path d="M211.2,190.3c.3,3.6,3.8,5.3,7.9,5.3s5.3-.4,7.7-1.1l1.1,5.9c-2.8,1.1-6.3,1.7-10.1,1.7-9.4,0-14.8-5.5-14.8-14.2s4.4-14.8,14.1-14.8,12.4,7,12.4,13.9-.2,2.8-.3,3.4h-17.9ZM221.4,184.4c0-2.1-.9-5.6-4.9-5.6s-5.1,3.3-5.3,5.6h10.2Z"/>
    </g>
    <path d="M109.5,90.6l-15.1-18.3c-.8-1.1-1.3-2.4-1.3-3.8v-30.3c0-.2-.2-.4-.4-.4l-13.3-2.6s0,0,0,0c-.7,0-8.9,0-9.6,0-1.6.3-3.1.9-4.4,2h0c-.2,0-.4.2-.6.4-1,1.2-2.9,4.8-2.9,5.9v67.1c0,2.2.7,4.3,2,6.1h0c1.2,1.7,3,2.7,5,2.9,6.2.5,19.4,1.7,19.4,1.7,1.1,0,2.1.4,3,.9l17.4,8.2"/>
    <path d="M136.3,90.6l15.1-18.3c.8-1.1,1.3-2.4,1.3-3.8v-30.3c0-.2.2-.4.4-.4l13.3-2.6s0,0,0,0c.7,0,8.9,0,9.6,0,1.6.3,3.1.9,4.4,2h0c.2,0,.4.2.6.4,1,1.2,2.9,4.8,2.9,5.9v67.1c0,2.2-.7,4.3-2,6.1h0c-1.2,1.7-3,2.7-5,2.9-6.2.5-19.4,1.7-19.4,1.7-1.1,0-2.1.4-3,.9l-17.4,8.2"/>
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
            className="cursor-pointer hover:opacity-90 transition flex items-center space-x-3"
          >
            <ForkloreLogoIcon className="w-10 h-10" style={{ color: 'var(--forklore-warm-red)' }} />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
                Forklore
              </h1>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--forklore-warm-brown)' }}>
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
