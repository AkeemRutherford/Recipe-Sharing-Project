import React, { useState } from 'react';

export default function TestAPI() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  const testAPIKey = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        valid: response.status === 200,
        data: data,
        keyLength: apiKey?.length || 0,
        keyStart: apiKey?.substring(0, 10) || 'NOT SET'
      });
    } catch (err: any) {
      setResult({
        valid: false,
        error: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--gradient-background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8" style={{ border: '2px solid var(--forklore-warm-brown)' }}>
          <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--forklore-forest-green)', fontFamily: 'var(--font-heading)' }}>
            Test Hugging Face API Key
          </h1>

          <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(212, 118, 74, 0.1)', border: '1px solid var(--forklore-burnt-orange)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--forklore-burnt-orange)' }}>
              Current API Key Status
            </p>
            <p className="text-sm mb-1">
              <strong>Key Set:</strong> {apiKey ? 'Yes' : 'No'}
            </p>
            <p className="text-sm mb-1">
              <strong>Length:</strong> {apiKey?.length || 0} characters (should be ~37)
            </p>
            <p className="text-sm">
              <strong>Starts With:</strong> {apiKey?.substring(0, 10) || 'NOT SET'}...
            </p>
          </div>

          <button
            onClick={testAPIKey}
            disabled={testing}
            className="btn-primary w-full py-3 rounded-lg font-semibold mb-6"
          >
            {testing ? 'Testing...' : 'Test API Key'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`} style={{ border: '2px solid' }}>
              {result.valid ? (
                <>
                  <p className="font-bold text-green-700 mb-2">✅ API KEY IS VALID!</p>
                  <p className="text-sm text-green-700">Account: {result.data?.name}</p>
                  <p className="text-sm text-green-700">Type: {result.data?.type}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-red-700 mb-2">❌ API KEY IS INVALID</p>
                  <p className="text-sm text-red-700 mb-2">Status: {result.status || 'Error'}</p>
                  <p className="text-sm text-red-700 mb-4">
                    {result.data?.error || result.error || 'Unknown error'}
                  </p>
                  
                  <div className="mt-4 p-3 bg-white rounded">
                    <p className="font-semibold text-gray-800 mb-2">How to fix:</p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-blue-600 underline">huggingface.co/settings/tokens</a></li>
                      <li>Click "New token"</li>
                      <li>Select "Read" type (FREE)</li>
                      <li>Copy the entire token</li>
                      <li>Update .env: VITE_HUGGINGFACE_API_KEY=hf_your_token</li>
                      <li>Restart dev server</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--forklore-cream)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--forklore-forest-green)' }}>
              Need Help?
            </h3>
            <ul className="text-sm space-y-1" style={{ color: 'var(--forklore-warm-brown)' }}>
              <li>• Token must be "Read" type (not Write or Fine-grained)</li>
              <li>• Should start with "hf_" and be about 37 characters</li>
              <li>• Copy the ENTIRE token from Hugging Face</li>
              <li>• Restart dev server after updating .env</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
