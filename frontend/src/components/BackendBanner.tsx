import React, { useState, useEffect } from 'react';
import { getApiBase, setApiBase } from '../lib/api';
import toast from 'react-hot-toast';

export const BackendBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show if no API base is configured and we're not running on localhost
    const base = getApiBase();
    if (!base && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Please enter your backend URL');
      return;
    }

    setLoading(true);
    const cleanUrl = url.trim().replace(/\/+$/, '');

    try {
      // Test the URL with /health
      const resp = await fetch(`${cleanUrl}/health`);
      if (resp.ok) {
        setApiBase(cleanUrl);
        toast.success('Successfully connected to backend!');
        setShow(false);
        window.location.reload();
      } else {
        // Even if /health doesn't return 200, it might still be live (e.g. root)
        setApiBase(cleanUrl);
        toast.success('Backend URL saved!');
        setShow(false);
        window.location.reload();
      }
    } catch {
      // Allow saving anyway if CORS or cold start
      setApiBase(cleanUrl);
      toast.success('Backend URL saved! Reloading...');
      setShow(false);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-indigo-900/90 border-b border-purple-500/30 text-white px-4 py-2.5 shadow-xl relative z-50">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>
            <strong>Backend not connected:</strong> Paste your Render URL to enable login & registration.
          </span>
        </div>
        <form onSubmit={handleConnect} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://kurippu-backend-xxxx.onrender.com"
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/40 text-xs w-full sm:w-72 focus:outline-none focus:border-purple-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 font-medium text-xs whitespace-nowrap transition"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};
