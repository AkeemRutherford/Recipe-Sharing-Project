import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import CreateRecipeMethod from './pages/CreateRecipeMethod';
import EditRecipe from './pages/EditRecipe';
import MyRecipes from './pages/MyRecipes';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Header from './components/Header';
import Onboarding from './components/Onboarding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setShowOnboarding(!data?.onboarding_completed);
    } catch (err) {
      console.error('Error checking onboarding:', err);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-background)' }}>
        <div className="text-xl" style={{ color: 'var(--forklore-warm-brown)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <Header />
      <main style={{ background: 'var(--gradient-background)', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/recipe/:id/edit" element={<EditRecipe />} />
          <Route path="/create-recipe-method" element={<CreateRecipeMethod />} />
          <Route path="/add-recipe/:method" element={<AddRecipe />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
