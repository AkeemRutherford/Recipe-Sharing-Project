import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Notifications from './Notifications';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const UserCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="10" r="3"/>
    <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"/>
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

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export default function Header({ onSearchChange, searchQuery = '' }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    if (user) {
      loadUsername();
    }
  }, [user]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

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

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const showSearchBar = location.pathname === '/' || location.pathname.startsWith('/saved');

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer hover:opacity-90 transition flex items-center"
          >
            <ForkloreLogoIcon className="w-8 h-8 md:w-10 md:h-10" style={{ color: '#FF4D6A' }} />
            <span className="ml-2 text-lg md:text-xl font-bold hidden sm:inline" style={{ color: '#222' }}>
              Forklore
            </span>
          </div>

          {/* Search Bar - centered on home page */}
          {showSearchBar && (
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <SearchIcon />
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-gray-400 focus:shadow-md transition"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
              </div>
            </div>
          )}

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/users')}
              className={`p-2 rounded-full hover:bg-gray-100 transition ${
                isActive('/users') ? 'text-forklore-red' : 'text-gray-600'
              }`}
              title="Community"
            >
              <UsersIcon />
            </button>

            <button
              onClick={() => navigate('/saved')}
              className={`p-2 rounded-full hover:bg-gray-100 transition ${
                isActive('/saved') ? 'text-forklore-red' : 'text-gray-600'
              }`}
              title="Saved Recipes"
            >
              <BookmarkIcon />
            </button>

            <button
              onClick={() => navigate('/add-recipe')}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600"
              title="Add Recipe"
            >
              <PlusIcon />
            </button>

            <button
              onClick={() => username ? navigate(`/profile/${username}`) : navigate('/login')}
              className={`p-2 rounded-full hover:bg-gray-100 transition ${
                location.pathname.includes('/profile') ? 'text-forklore-red' : 'text-gray-600'
              }`}
              title="Profile"
            >
              <UserCircleIcon />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
