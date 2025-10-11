import React, { useEffect, useRef, useState } from 'react';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
}

export default function VoiceInput({
  value,
  onChange,
  placeholder = 'Type or speak...',
  rows = 3,
  className = '',
  required = false
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      onChange(value ? value + ' ' + transcript : transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [value, onChange]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={className}
        placeholder={placeholder}
      />

      {isSupported && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`absolute right-3 top-3 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? '⏹️ Stop' : '🎤 Speak'}
        </button>
      )}

      {isListening && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm font-medium animate-fade-in">
          <div className="flex space-x-1">
            <span className="w-1 h-4 bg-red-600 animate-wave" style={{ animationDelay: '0s' }}></span>
            <span className="w-1 h-4 bg-red-600 animate-wave" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 h-4 bg-red-600 animate-wave" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-4 bg-red-600 animate-wave" style={{ animationDelay: '0.3s' }}></span>
          </div>
          <span>Listening... Speak your description</span>
        </div>
      )}

      {!isSupported && (
        <p className="mt-2 text-sm text-gray-500">
          ℹ️ Voice input is not supported in this browser. Try Chrome, Edge, or Safari.
        </p>
      )}

      <style>{`
        @keyframes wave {
          0%, 100% { height: 0.5rem; }
          50% { height: 1.5rem; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-wave {
          animation: wave 1s infinite ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease;
        }
      `}</style>
    </div>
  );
}
