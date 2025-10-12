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
  const [enhanceDescription, setEnhanceDescription] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      finalTranscriptRef.current = '';
      setTranscript('');
      setDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const tokenResponse = await fetch(`${supabaseUrl}/functions/v1/deepgram-token`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Deepgram token');
      }

      const { apiKey } = await tokenResponse.json();

      const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true&smart_format=true`;
      const ws = new WebSocket(deepgramUrl, ['token', apiKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Deepgram');
        setIsListening(true);

        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        mediaRecorder.start(250);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcriptText = data.channel.alternatives[0].transcript;

            if (transcriptText.trim()) {
              if (data.is_final) {
                finalTranscriptRef.current += transcriptText + ' ';
                setTranscript(finalTranscriptRef.current.trim());
              }
            }
          }
        } catch (err) {
          console.error('Error parsing Deepgram response:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please try again.');
        stopListening();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (isListening) {
          stopListening();
        }
      };

    } catch (err: any) {
      console.error('Error starting voice input:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError('Could not start voice input. Please check your microphone.');
      }
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    wsRef.current = null;
    mediaRecorderRef.current = null;
    setIsListening(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setDuration(0);
    setError(null);
    finalTranscriptRef.current = '';
  };

  const processRecipe = async () => {
    if (!transcript.trim()) {
      setError('No transcript to process');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const recipe = await parseVoiceToRecipe(transcript, enhanceDescription);
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
            className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2"
          >
            <span className="text-2xl">🎤</span>
            <span>Start Recording</span>
          </button>
        ) : (
          <>
            <button
              onClick={stopListening}
              className="btn-secondary px-8 py-4 rounded-xl font-semibold text-lg flex items-center space-x-2"
            >
              <span className="text-2xl">⏹</span>
              <span>Stop</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-2xl animate-pulse" style={{ color: 'var(--forklore-warm-red)' }}>🔴</span>
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
          💡 Tips for best results:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: 'var(--forklore-warm-brown)' }}>
          <li>• Speak clearly at a normal pace</li>
          <li>• Include amounts and units (e.g., "two cups of flour")</li>
          <li>• Describe steps in order</li>
          <li>• Pause briefly between ingredients and steps</li>
          <li>• Mention cooking times and temperatures</li>
        </ul>
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enhanceDescription}
            onChange={(e) => setEnhanceDescription(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-forklore-red text-forklore-red focus:ring-2 focus:ring-forklore-red"
          />
          <span className="font-medium" style={{ color: 'var(--forklore-forest-green)' }}>
            ✨ Enhance description (AI will rewrite to sound more appetizing)
          </span>
        </label>
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
