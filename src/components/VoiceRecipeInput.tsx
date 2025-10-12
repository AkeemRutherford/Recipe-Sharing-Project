import React, { useState, useRef, useEffect } from 'react';
import { parseVoiceToRecipe, GeneratedRecipe } from '../lib/aiRecipeGeneration';

interface VoiceRecipeInputProps {
  onRecipeGenerated: (recipe: GeneratedRecipe) => void;
  onCancel?: () => void;
}

export default function VoiceRecipeInput({ onRecipeGenerated, onCancel }: VoiceRecipeInputProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      clearInterval(intervalRef.current);
    };

    recognition.onend = () => {
      setIsListening(false);
      clearInterval(intervalRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    setError(null);
    setDuration(0);
    recognitionRef.current.start();
    setIsListening(true);

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    clearInterval(intervalRef.current);
  };

  const clearTranscript = () => {
    setTranscript('');
    setDuration(0);
    setError(null);
  };

  const processRecipe = async () => {
    if (!transcript.trim()) {
      setError('No transcript to process');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const recipe = await parseVoiceToRecipe(transcript);
      onRecipeGenerated(recipe);
    } catch (err: any) {
      setError(err.message || 'Failed to process recipe. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recipe-input p-6 rounded-xl" style={{ background: 'var(--forklore-cream)', border: '2px solid var(--forklore-warm-brown)' }}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
          Dictate Your Recipe
        </h3>
        <p style={{ color: 'var(--forklore-warm-brown)' }}>
          Speak naturally and describe your recipe. Include ingredients, amounts, and steps.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(196, 69, 54, 0.1)', border: '1px solid var(--forklore-warm-red)' }}>
          <p style={{ color: 'var(--forklore-warm-red)' }}>{error}</p>
        </div>
      )}

      <div className="flex justify-center items-center space-x-4 mb-6">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={processing}
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2"
          >
            <span>Start Recording</span>
          </button>
        ) : (
          <>
            <button
              onClick={stopListening}
              className="btn-secondary px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-2"
            >
              <span>Stop</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
                Listening... {formatTime(duration)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
            Live Transcript
          </h4>
          {transcript && !isListening && (
            <button
              onClick={clearTranscript}
              className="text-sm px-3 py-1 rounded hover:bg-white transition"
              style={{ color: 'var(--forklore-warm-red)' }}
            >
              Clear & Restart
            </button>
          )}
        </div>
        <div
          className="min-h-32 max-h-64 overflow-y-auto p-4 rounded-lg"
          style={{ background: 'white', border: '1px solid var(--forklore-warm-brown)' }}
        >
          {transcript ? (
            <p style={{ color: 'var(--forklore-forest-green)' }}>{transcript}</p>
          ) : (
            <p className="text-center italic" style={{ color: 'var(--forklore-warm-brown)' }}>
              Start speaking to see transcript...
            </p>
          )}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--forklore-warm-brown)' }}>
          Character count: {transcript.length}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg mb-6" style={{ border: '1px solid var(--forklore-warm-brown)' }}>
        <h4 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
          Tips for best results:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: 'var(--forklore-warm-brown)' }}>
          <li>• Speak clearly at a normal pace</li>
          <li>• Include amounts and units (e.g., "two cups of flour")</li>
          <li>• Describe steps in order</li>
          <li>• Pause briefly between ingredients and steps</li>
          <li>• Mention cooking times and temperatures</li>
        </ul>
      </div>

      <div className="flex justify-between space-x-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="btn-secondary px-6 py-3 rounded-lg font-semibold"
            disabled={processing || isListening}
          >
            Cancel
          </button>
        )}
        <button
          onClick={processRecipe}
          disabled={!transcript.trim() || processing || isListening}
          className="btn-primary px-8 py-3 rounded-lg font-semibold flex-1 flex items-center justify-center"
        >
          {processing ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing Recipe...
            </>
          ) : (
            <>Process Recipe →</>
          )}
        </button>
      </div>
    </div>
  );
}
