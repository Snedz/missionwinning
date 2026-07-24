'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * Quiet waitlist band — outline CTA only (preserves one-emerald-primary rule).
 */
export function EmailCaptureBand({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setDone(true);
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError(t('landingCaptureInvalid', { defaultValue: 'Enter a valid email.' }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitLead({
        name: 'Landing updates',
        email: trimmed,
        source: 'landing-updates',
        goals: 'Launch updates + free core news',
      });
      if (!result.ok) {
        setError(t('landingCaptureError', { defaultValue: 'Could not save. Try again.' }));
        setBusy(false);
        return;
      }
      track('waitlist_joined', { product: 'landing' });
      setDone(true);
    } catch {
      setError(t('landingCaptureError', { defaultValue: 'Could not save. Try again.' }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cn('border-t border-border/40 bg-muted/10', className)}>
      <div className="mx-auto max-w-xl px-5 py-14 text-center lg:py-16">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground">
          {t('landingCaptureEyebrow', { defaultValue: 'Stay in the loop' })}
        </p>
        <h2 className="mb-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          {t('landingCaptureTitle', { defaultValue: 'Get launch notes. Stay free forever.' })}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {t('landingCaptureBody', {
            defaultValue:
              'One email when we go public, plus rare free-core tips. No spam. Unsubscribe anytime.',
          })}
        </p>

        {done ? (
          <p className="text-sm font-medium text-primary">
            {t('landingCaptureDone', {
              defaultValue: 'You’re on the list. Check your inbox for a confirmation when email is live.',
            })}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="mw-landing-email">
              {t('landingCapturePlaceholder', { defaultValue: 'you@email.com' })}
            </label>
            <input
              id="mw-landing-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('landingCapturePlaceholder', { defaultValue: 'you@email.com' })}
              className="min-h-[44px] flex-1 rounded-xl border border-border/60 bg-background px-3 text-sm"
            />
            {/* Honeypot — leave empty */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden
            />
            <Button
              type="submit"
              variant="outline"
              disabled={busy}
              className="min-h-[44px] shrink-0 border-border/70"
            >
              {busy
                ? t('landingCaptureSending', { defaultValue: 'Saving…' })
                : t('landingCaptureButton', { defaultValue: 'Notify me' })}
            </Button>
          </form>
        )}

        {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

        <p className="mt-4 text-[11px] text-muted-foreground">
          {t('landingCapturePrivacy', {
            defaultValue: 'We store your email only for launch updates.',
          })}{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            {t('analyticsBannerPrivacyLink', { defaultValue: 'Privacy policy' })}
          </Link>
        </p>
      </div>
    </section>
  );
}
