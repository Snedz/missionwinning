'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { submitLead } from '@/lib/supabase';

export default function PrivateTeaser() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone, setWaitDone] = useState(false);
  const [waitBusy, setWaitBusy] = useState(false);

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

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitEmail || waitBusy) return;
    setWaitBusy(true);
    try {
      await submitLead({
        name: '',
        email: waitEmail,
        source: 'launch-waitlist',
        message: 'Private gate waitlist',
      });
    } catch {
      // Best-effort — submissions are reviewed manually during beta.
    }
    setWaitDone(true);
    setWaitBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md page-enter">
          <div className="text-center mb-10">
            <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              MW
            </span>
            <p className="eyebrow-live mb-4">Private beta in progress</p>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              Train anywhere.
              <br />
              Win daily.
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The free health everything app — training, nutrition, mobility, mind, activity, and
              learning, scored together. Launching soon, free core forever.
            </p>
          </div>

          {waitDone ? (
            <div className="content-card p-6 text-center">
              <p className="inline-flex items-center gap-1.5 font-semibold text-primary">
                <Check className="h-4 w-4" /> You&apos;re on the list.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll email {waitEmail} the moment doors open.
              </p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="content-card space-y-3 p-6">
              <p className="eyebrow">Get notified at launch</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  value={waitEmail}
                  onChange={(e) => setWaitEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email for the launch waitlist"
                  className="tap-target w-full flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={waitBusy}
                />
                <button
                  type="submit"
                  disabled={waitBusy || !waitEmail}
                  className="primary-action sm:w-auto sm:px-6 disabled:opacity-50"
                >
                  {waitBusy ? 'Joining…' : 'Notify me'}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                No spam — one email when the beta opens, one at launch.
              </p>
            </form>
          )}

          <details className="group mt-6">
            <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground hover:text-foreground marker:content-none">
              Have a beta access code?
            </summary>
            <form onSubmit={handleSubmit} className="content-card mt-3 space-y-4 p-6">
              <label className="block space-y-2 text-sm">
                <span className="text-muted-foreground">Access code</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter code from your invite"
                  autoComplete="off"
                  className="tap-target w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </label>
              <button
                type="submit"
                disabled={loading || !password}
                className="primary-action disabled:opacity-50"
              >
                {loading ? 'Checking…' : 'Enter the beta'}
              </button>
              {error && (
                <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Invited testers: see the{' '}
                <Link href="/beta" className="text-primary hover:underline">
                  beta start guide
                </Link>
                . If you installed the app before the gate, clear site data or reinstall.
              </p>
            </form>
          </details>
        </div>
      </div>
      <AppLegalFooter className="border-t border-border/30 pb-6" />
    </div>
  );
}
