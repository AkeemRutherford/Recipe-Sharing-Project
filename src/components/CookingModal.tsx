import React from 'react';

interface CookingModalProps {
  isOpen: boolean;
}

export default function CookingModal({ isOpen }: CookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-airbnb-rausch via-airbnb-rausch-dark to-airbnb-rausch rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <svg
                className="w-20 h-20 text-white animate-bounce"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
              </svg>
            </div>

            <div className="absolute -top-2 -right-2 w-8 h-8 bg-airbnb-rausch rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-airbnb-rausch-dark rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -top-2 -left-2 w-7 h-7 bg-airbnb-rausch rounded-full animate-ping opacity-75" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          AI is cooking up the dish!
        </h2>

        <p className="text-gray-600 mb-6">
          Generating your delicious recipe image...
        </p>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-airbnb-rausch via-airbnb-rausch-dark to-airbnb-rausch rounded-full animate-pulse shadow-lg" style={{ width: '100%' }}></div>
        </div>

        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-airbnb-rausch rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-airbnb-rausch-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-airbnb-rausch rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
