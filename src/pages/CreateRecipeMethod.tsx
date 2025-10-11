import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpoonIcon, ForkIcon, CookbookIcon } from '../components/ForkloreIcons';

export default function CreateRecipeMethod() {
  const navigate = useNavigate();

  const methods = [
    {
      id: 'manual',
      title: 'Manual Entry',
      description: 'Type your recipe step by step',
      icon: <CookbookIcon size={48} color="var(--forklore-burnt-orange)" />,
      badge: 'Traditional',
      color: 'var(--forklore-burnt-orange)'
    },
    {
      id: 'voice',
      title: 'Voice Dictation',
      description: 'Speak your recipe naturally',
      icon: <span className="text-5xl">🎤</span>,
      badge: 'Quick & Easy',
      color: 'var(--forklore-sage-green)'
    },
    {
      id: 'image',
      title: 'From Photo',
      description: 'AI generates recipe from food image',
      icon: <span className="text-5xl">📸</span>,
      badge: 'AI Powered',
      color: 'var(--forklore-golden-yellow)'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--gradient-background)' }}>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 hover:opacity-70 transition"
          style={{ color: 'var(--forklore-warm-brown)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Share Your Recipe
          </h1>
          <p className="text-xl" style={{ color: 'var(--forklore-warm-brown)' }}>
            Choose how you'd like to add your culinary creation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => navigate(`/add-recipe/${method.id}`)}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-current"
              style={{ borderColor: 'transparent' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = method.color}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div className="absolute top-4 right-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${method.color}22`, color: method.color }}
                >
                  {method.badge}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>

                <h3 className="text-2xl font-bold" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
                  {method.title}
                </h3>

                <p style={{ color: 'var(--forklore-warm-brown)' }}>
                  {method.description}
                </p>

                <div
                  className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all group-hover:px-8"
                  style={{ background: `${method.color}22`, color: method.color }}
                >
                  Get Started →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg" style={{ border: '2px solid var(--forklore-warm-brown)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--forklore-forest-green)' }}>
            💡 Which method should I choose?
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'var(--forklore-warm-brown)' }}>
            <div className="flex items-start space-x-2">
              <span className="font-semibold min-w-[120px]">Manual Entry:</span>
              <span>Best for precise control, family recipes, or when you have written notes</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold min-w-[120px]">Voice Dictation:</span>
              <span>Perfect for hands-free cooking, quick capture, or when you know the recipe by heart</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-semibold min-w-[120px]">From Photo:</span>
              <span>Great for recreating dishes you've seen, experimenting, or getting inspiration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
