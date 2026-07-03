'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { submitLead } from '@/lib/supabase';

/**
 * 1:1 coaching interest page. Coaching is not a live offer yet — this page
 * collects genuine interest so the founder can shape and price the program
 * with real demand data. No fictional price cards, no pressure copy.
 */
export function CoachingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await submitLead({
      name,
      email,
      goals: message,
      package_interest: 'coaching-interest',
      source: 'coaching-page',
      message,
    });
    setLoading(false);
    if (result.ok) {
      setSubmitted(true);
    } else {
      setError('Could not submit right now. Try again or email support@missionwinning.com');
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Mission Winning
        </Link>

        <header className="mb-10 mt-8">
          <p className="eyebrow mb-4">1:1 Coaching · Interest list</p>
          <h1 className="display-section mb-4">A coach in your corner.</h1>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            We&apos;re building a small 1:1 coaching program on top of the free core: custom
            programming, nutrition guidance, and regular check-ins with a real coach. It opens to a
            limited first group. Tell us about your goals and we&apos;ll reach out as spots open —
            no commitment, no payment today.
          </p>
        </header>

        {submitted ? (
          <div className="content-card p-8 text-center">
            <h2 className="font-display mb-2 text-2xl font-semibold uppercase">Received.</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Thanks — we read every note and reply personally, usually within 48 hours.
            </p>
            <Button onClick={() => (window.location.href = '/log')}>Back to Today</Button>
          </div>
        ) : (
          <form className="content-card space-y-4 p-6 sm:p-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Name"
                aria-label="Name"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="tap-target rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Email"
                aria-label="Email"
              />
            </div>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your goals, your current training, and what you'd want from a coach…"
              aria-label="Your goals and current training"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Join the coaching interest list'}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Free to join. We&apos;ll only email you about coaching.
            </p>
          </form>
        )}

        <p className="mx-auto mt-10 max-w-prose text-center text-xs leading-relaxed text-muted-foreground/80">
          Coaching is education and accountability — results depend on your consistency and
          circumstances. Always clear new training or nutrition plans with your physician.
        </p>
      </div>
    </div>
  );
}
