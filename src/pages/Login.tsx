import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);


export default function Login() {
  const { signInWithGoogle, signInWithGitHub, signInWithTestAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGitHub();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub');
      setLoading(false);
    }
  };

  const handleTestAccountSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithTestAccount();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with test account');
      setLoading(false);
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000);
      const demoEmail = `${cleanUsername}_${randomSuffix}@demo.forklore.app`;
      const demoPassword = `demo_${cleanUsername}_${Date.now()}_${Math.random().toString(36)}`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            username: username.trim(),
            is_demo_user: true,
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      if (data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: username.trim(),
            bio: 'Demo user - exploring Forklore',
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      setShowUsernameModal(false);
      setUsername('');
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError(err.message || 'Failed to create demo account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="rounded-lg shadow-lg p-8 bg-white border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/forklore-logo.png"
                alt="Forklore"
                className="h-16 w-auto"
              />
            </div>
            <p className="forklore-tagline mb-3 text-airbnb-foggy">Share Your Culinary Journey</p>
            <p className="text-sm text-airbnb-dark-gray">Join the Forklore community and discover family recipes passed down through generations</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <GoogleIcon />
              <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                {loading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitHubIcon />
              <span className="font-semibold">
                {loading ? 'Signing in...' : 'Continue with GitHub'}
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={handleTestAccountSignIn}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-3 px-6 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="font-semibold">
                {loading ? 'Signing in...' : 'Test Account (Demo)'}
              </span>
            </button>

            <button
              onClick={() => setShowUsernameModal(true)}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-airbnb-dark-gray text-white rounded-lg hover:bg-gray-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span className="font-semibold">
                Quick Demo Login
              </span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              By continuing, you agree to share recipes and collaborate with your team
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Secure authentication powered by Supabase
          </p>
        </div>
      </div>

      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Demo Login</h2>
            <p className="text-gray-600 mb-6">
              Enter a username to create a temporary demo account. No password needed!
            </p>

            <form onSubmit={handleUsernameLogin}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., chefmike, foodlover, testuser"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-rausch focus:border-transparent"
                  autoFocus
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Min 3 characters. Letters, numbers, and underscores only.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUsernameModal(false);
                    setUsername('');
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="flex-1 px-6 py-3 bg-airbnb-rausch text-white font-semibold rounded-lg hover:bg-airbnb-rausch-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create & Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
