'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md page-enter">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20 border border-emerald-500/30">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Private Development</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mission Winning is in private beta. Enter your access code to continue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="content-card p-6 space-y-4"
          >
            <label className="block space-y-2 text-sm">
              <span className="text-muted-foreground">Access code</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter code from your invite"
                autoComplete="off"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                disabled={loading}
              />
            </label>
            <button
              type="submit"
              disabled={loading || !password}
              className="primary-action disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Unlock Mission Winning'}
            </button>
            {error && (
              <p className="text-sm text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Or visit any URL once with{' '}
              <span className="font-mono text-emerald-400/90">?access=YOUR_SECRET</span>. Cookie
              lasts 30 days.
            </p>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Need access?{' '}
            <Link href="/beta" className="text-emerald-400 hover:underline">
              Beta start guide
            </Link>
          </p>

          <p className="text-[10px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
            If you installed the PWA before the gate, clear site data or reinstall — an old cache
            may bypass this screen.
          </p>
        </div>
      </div>
      <AppLegalFooter className="border-t border-border/30 pb-6" />
    </div>
  );
}
