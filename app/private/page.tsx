'use client';

import { useState } from 'react';

export default function PrivateTeaser() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Cookie set — go to app root (gate will pass on next request).
        window.location.href = '/log';
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || 'Incorrect access code';
        if (msg.includes('not configured')) {
          setError(
            'Access not configured yet. Add PRIVATE_ACCESS_SECRET in the Vercel dashboard (Production + Preview), redeploy, then try again.'
          );
        } else {
          setError(msg);
        }
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] text-white p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-3xl font-bold tracking-tight">Private Development</div>

        <div className="text-lg text-white/80">
          This site is in private development and is not available to the public.
        </div>

        <form onSubmit={handleSubmit} className="pt-4 border-t border-white/10 text-left space-y-3">
          <div className="text-sm text-white/70">Authorized access</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
            autoComplete="off"
            className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Unlock'}
          </button>
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <div className="text-[10px] text-white/40">
            Or visit any URL with <span className="font-mono">?access=YOUR_SECRET</span> once.
            The access cookie lasts 30 days.
          </div>
        </form>

        <div className="pt-4 border-t border-white/10 text-sm text-white/50">
          Not open to the public during construction.
          <br />
          Contact the team for authorized access.
        </div>

        <div className="text-[10px] text-white/30 pt-2">
          If you previously installed the app, clear your browser cache or uninstall the PWA —
          an old cached version may show the full site without the gate.
        </div>
      </div>
    </div>
  );
}
