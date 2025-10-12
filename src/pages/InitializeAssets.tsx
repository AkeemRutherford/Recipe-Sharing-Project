import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeForkloreAssets, checkExistingAssets, initializeAssetsIfNeeded } from '../lib/initializeSiteAssets';
import Header from '../components/Header';

export default function InitializeAssets() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'checking' | 'uploading' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [existingCount, setExistingCount] = useState(0);
  const [existingTypes, setExistingTypes] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkAssets();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const checkAssets = async () => {
    setStatus('checking');
    addLog('Checking existing assets...');

    try {
      const existing = await checkExistingAssets();
      setExistingCount(existing.count);
      setExistingTypes(existing.types);

      if (existing.count > 0) {
        setMessage(`Found ${existing.count} existing assets in the database.`);
        addLog(`✅ Found ${existing.count} existing assets`);
      } else {
        setMessage('No assets found. Ready to initialize.');
        addLog('ℹ️ No assets found in database');
      }

      setStatus('idle');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      addLog(`❌ Error checking assets: ${error.message}`);
      setStatus('error');
    }
  };

  const handleInitialize = async () => {
    setStatus('uploading');
    setProgress(0);
    setLogs([]);
    addLog('🎨 Starting asset initialization...');

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const msg = args.join(' ');
      addLog(msg);
      originalConsoleLog(...args);
    };

    try {
      const totalAssets = 10;
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 95));
      }, 500);

      await initializeForkloreAssets();

      clearInterval(interval);
      setProgress(100);

      console.log = originalConsoleLog;

      setStatus('complete');
      setMessage('All assets uploaded successfully! 🎉');
      addLog('🎉 Initialization complete!');

      await checkAssets();

      setTimeout(() => {
        navigate('/site-assets');
      }, 2000);
    } catch (error: any) {
      console.log = originalConsoleLog;
      setStatus('error');
      setMessage(`Error: ${error.message}`);
      addLog(`❌ Initialization failed: ${error.message}`);
    }
  };

  const handleForceUpload = async () => {
    if (!confirm('This will upload assets even if some already exist. Continue?')) {
      return;
    }
    await handleInitialize();
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--forklore-cream)' }}>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Initialize Forklore Assets
          </h1>
          <p style={{ color: 'var(--forklore-warm-brown)' }}>
            Upload the Forklore logo and generate variants for the entire site
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
            Current Status
          </h2>

          {status === 'checking' ? (
            <p style={{ color: 'var(--forklore-warm-brown)' }}>Checking assets...</p>
          ) : existingCount > 0 ? (
            <div>
              <p className="mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
                ✅ Found {existingCount} assets in the database:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(existingTypes).map(([type, count]) => (
                  <div key={type} className="p-3 rounded-lg border" style={{ borderColor: 'var(--forklore-warm-brown)', background: 'var(--forklore-cream)' }}>
                    <p className="font-semibold capitalize" style={{ color: 'var(--forklore-forest-green)' }}>
                      {type.replace('-', ' ')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--forklore-warm-brown)' }}>
                      {count} variant{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--forklore-warm-brown)' }}>
              No assets found. Click "Initialize Assets" to upload the Forklore logo.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
            What Will Be Created
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Logos (3 variants)
              </h3>
              <ul className="text-sm space-y-1 ml-4" style={{ color: 'var(--forklore-warm-brown)' }}>
                <li>• Primary - Main site logo</li>
                <li>• Header - Navigation bar logo</li>
                <li>• Footer - Footer section logo</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Thumbnails (2 variants)
              </h3>
              <ul className="text-sm space-y-1 ml-4" style={{ color: 'var(--forklore-warm-brown)' }}>
                <li>• Primary - Default thumbnail</li>
                <li>• Small - Recipe card thumbnails</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                OG Images (2 variants)
              </h3>
              <ul className="text-sm space-y-1 ml-4" style={{ color: 'var(--forklore-warm-brown)' }}>
                <li>• Primary - Social media sharing</li>
                <li>• Home - Homepage specific OG image</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
                Icons & Banners (3 variants)
              </h3>
              <ul className="text-sm space-y-1 ml-4" style={{ color: 'var(--forklore-warm-brown)' }}>
                <li>• Icon Primary - Main app icon</li>
                <li>• Icon Square - Profile pictures</li>
                <li>• Banner Primary - Hero sections</li>
              </ul>
            </div>

            <p className="text-sm italic mt-4 p-3 rounded" style={{ background: 'var(--forklore-cream)', color: 'var(--forklore-warm-brown)' }}>
              Total: 10 asset variants will be created from the Forklore logo
            </p>
          </div>
        </div>

        {status === 'uploading' && (
          <div className="bg-white rounded-xl p-6 mb-6 border-2" style={{ borderColor: 'var(--forklore-warm-brown)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--forklore-forest-green)' }}>
              Upload Progress
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--forklore-warm-red)' }}
              />
            </div>
            <p className="text-center font-semibold" style={{ color: 'var(--forklore-forest-green)' }}>
              {progress}%
            </p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-xl p-4 mb-6 font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        {message && (
          <div
            className="mb-6 p-4 rounded-lg"
            style={{
              background: status === 'error' ? 'rgba(196, 69, 54, 0.1)' : 'rgba(139, 195, 74, 0.1)',
              border: `1px solid ${status === 'error' ? 'var(--forklore-warm-red)' : 'var(--forklore-forest-green)'}`,
              color: status === 'error' ? 'var(--forklore-warm-red)' : 'var(--forklore-forest-green)'
            }}
          >
            {message}
          </div>
        )}

        <div className="flex space-x-4">
          {existingCount === 0 ? (
            <button
              onClick={handleInitialize}
              disabled={status === 'uploading' || status === 'checking'}
              className="btn-primary flex-1 py-4 rounded-lg font-semibold text-lg"
            >
              {status === 'uploading' ? 'Uploading...' : 'Initialize Assets'}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/site-assets')}
                className="btn-secondary flex-1 py-4 rounded-lg font-semibold text-lg"
              >
                View Assets
              </button>
              <button
                onClick={handleForceUpload}
                disabled={status === 'uploading' || status === 'checking'}
                className="btn-primary flex-1 py-4 rounded-lg font-semibold text-lg"
              >
                Force Re-upload
              </button>
            </>
          )}
        </div>

        {status === 'complete' && (
          <p className="text-center mt-4 text-sm" style={{ color: 'var(--forklore-warm-brown)' }}>
            Redirecting to asset manager...
          </p>
        )}
      </div>
    </div>
  );
}
