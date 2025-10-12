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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const durationIntervalRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started - microphone is active');
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: any) => {
      console.log('Speech detected!', event.results.length, 'results', 'resultIndex:', event.resultIndex);

      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log(`Result ${i}: isFinal=${event.results[i].isFinal}, text="${transcript}"`);

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
          console.log('Added final text, total now:', finalTranscriptRef.current);
        } else {
          interimTranscript += transcript;
        }
      }

      const displayText = finalTranscriptRef.current + interimTranscript;
      console.log('Display text:', displayText);
      setCurrentTranscript(displayText);

      const fullText = displayText.trim();
      if (fullText) {
        onChange(fullText);
      }

      silenceTimeoutRef.current = setTimeout(() => {
        console.log('Long pause detected, but continuing to listen...');
      }, 5000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      if (event.error === 'no-speech') {
        console.log('No speech detected yet, continuing to listen...');
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
        alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
        return;
      }

      if (event.error === 'network') {
        console.log('Network error, attempting to restart...');
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Could not restart:', err);
            }
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');

      if (isListeningRef.current) {
        console.log('Auto-restarting speech recognition...');
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log('Could not restart, user may have stopped manually');
              setIsListening(false);
              isListeningRef.current = false;
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.error('Error aborting recognition:', err);
        }
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [onChange]);

  useEffect(() => {
    if (isListening) {
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isListening]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      finalTranscriptRef.current = value ? value + ' ' : '';
      setCurrentTranscript(value || '');

      try {
        recognitionRef.current.start();
        console.log('🎤 Voice recognition starting... Please allow microphone access if prompted.');
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Could not start voice recognition. Make sure you are using Chrome, Edge, or Safari, and have granted microphone permissions.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      setIsListening(false);
      isListeningRef.current = false;

      try {
        recognitionRef.current.stop();
        console.log('✅ Stopped listening. Final text in field.');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }

      finalTranscriptRef.current = '';
      setCurrentTranscript('');
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
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-1 h-4 bg-green-600 animate-wave" style={{ animationDelay: '0s' }}></span>
                <span className="w-1 h-4 bg-green-600 animate-wave" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1 h-4 bg-green-600 animate-wave" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1 h-4 bg-green-600 animate-wave" style={{ animationDelay: '0.3s' }}></span>
              </div>
              <span className="text-sm text-green-700 font-semibold">
                🎤 Listening... Speak now!
              </span>
            </div>
            <span className="text-sm font-mono text-gray-700">
              ⏱️ {formatDuration(recordingDuration)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Natural pauses are OK. Click "Stop" when finished.
          </p>
          {currentTranscript ? (
            <div className="mt-2 p-2 bg-white rounded border border-green-300">
              <p className="text-xs text-gray-500 mb-1">Captured so far:</p>
              <p className="text-sm text-gray-800">{currentTranscript}</p>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-xs text-yellow-700">Waiting for speech... Make sure your microphone is on.</p>
            </div>
          )}
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
