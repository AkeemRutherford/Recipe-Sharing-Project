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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

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

  const startListening = async () => {
    try {
      setError(null);
      finalTranscriptRef.current = value ? value + ' ' : '';
      setCurrentTranscript(value || '');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const wsUrl = `${supabaseUrl.replace('https://', 'wss://')}/functions/v1/deepgram-streaming`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Deepgram');
        setIsListening(true);

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
            const transcript = data.channel.alternatives[0].transcript;

            if (transcript.trim()) {
              if (data.is_final) {
                finalTranscriptRef.current += transcript + ' ';
                const fullText = finalTranscriptRef.current.trim();
                setCurrentTranscript(fullText);
                onChange(fullText);
              } else {
                const fullText = finalTranscriptRef.current + transcript;
                setCurrentTranscript(fullText);
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
        setError('Microphone access denied. Please enable microphone permissions.');
      } else {
        setError('Could not start voice input. Please check your microphone.');
      }
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
    finalTranscriptRef.current = '';
    setCurrentTranscript('');

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
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

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
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
