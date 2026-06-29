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
        // Cookie set — reload to pass the gate
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || 'Incorrect access code';
        if (msg.includes('not configured')) {
          setError('Access not configured yet (builder: set PRIVATE_ACCESS_SECRET in Vercel and redeploy)');
        } else {
          setError(msg);
        }
      }
    } catch (err) {
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

        {/* Minimal access form — no product or service details shown */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-white/10 text-left space-y-3">
          <div className="text-sm text-white/70">Authorized access</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
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
            Or append <span className="font-mono">?access=YOUR_SECRET</span> to the URL (e.g. /?access=xxx). Cookie lasts 30 days.
          </div>
        </form>

        <div className="pt-4 border-t border-white/10 text-sm text-white/50">
          Not open to the public during construction.<br />
          Contact the team for authorized access.
        </div>

        <div className="text-[10px] text-white/30 pt-4">
          All domains are gated.
        </div>

        {/* Magic link for authorized early access / builders (no details leaked) */}
        <div className="pt-4 border-t border-white/10 text-left">
          <div className="text-white/70 mb-2 text-xs">Authorized early access (magic link):</div>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            if (!email) return;
            try {
              const { signInMagic } = await import('@/lib/supabase');
              await signInMagic(email);
              alert(`Magic link sent to ${email}. Check email (and spam) to bypass the gate.`);
            } catch (err: any) {
              alert('Failed to send: ' + (err.message || 'Check configuration.'));
            }
          }} className="space-y-2">
            <input name="email" type="email" required placeholder="you@email.com" className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm" />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 rounded font-medium">Send Magic Link</button>
          </form>
          <div className="text-[10px] text-white/40 mt-1">Once signed in (or with access code above) the full build loads.</div>
        </div>
      </div>
    </div>
  );
}

