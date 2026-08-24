'use client';

/**
 * Super Bundle / launch notify — email only. No checkout. No Stripe claim.
 * Same `/api/leads` path the gated `/private` form used.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';
import { gateEnFloor } from '@/i18n/gateEn';

export type LaunchNotifySource = 'launch-waitlist' | 'landing-super-bundle-notify';

type Props = {
  source: LaunchNotifySource;
  message: string;
  /** `gate` keeps the private-teaser classes; `cine` is the paper-strip door; `landing` is the public band. */
  variant?: 'landing' | 'gate' | 'cine';
};

export function LaunchNotifyForm({ source, message, variant = 'landing' }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true);
    setError(null);

    const result = await submitLead({
      name: '',
      email,
      source,
      message,
    });

    if (!result?.ok) {
      setError(
        t('landingCaptureError', {
          defaultValue: 'Could not save. Try again.',
        })
      );
      setBusy(false);
      return;
    }

    track('waitlist_joined', {
      product: source === 'landing-super-bundle-notify' ? 'super-bundle' : 'launch',
    });
    setDone(true);
    setBusy(false);
  };

  if (variant === 'gate' || variant === 'cine') {
    const cine = variant === 'cine';
    if (done) {
      return (
        <>
          <p className={cine ? 'www-cine-lede' : 'gate-done'}>
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t('gateWaitlistDone', { defaultValue: gateEnFloor('gateWaitlistDone') })}
          </p>
          <p className={cine ? 'www-cine-foot' : 'gate-foot'}>
            {t('gateWaitlistDoneFoot', {
              defaultValue: gateEnFloor('gateWaitlistDoneFoot'),
            })}{' '}
            {email}
          </p>
        </>
      );
    }

    return (
      <form onSubmit={handleSubmit} data-mw-launch-notify={cine ? 'cine' : 'gate'}>
        {cine ? (
          <label className="www-cine-field">
            <span>{t('gateWaitlistEmailLabel', { defaultValue: gateEnFloor('gateWaitlistEmailLabel') })}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('gateWaitlistPlaceholder', {
                defaultValue: gateEnFloor('gateWaitlistPlaceholder'),
              })}
              aria-label="Email for the launch waitlist"
              autoComplete="email"
              disabled={busy}
            />
          </label>
        ) : (
          <div className="gate-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('gateWaitlistPlaceholder', {
                defaultValue: gateEnFloor('gateWaitlistPlaceholder'),
              })}
              aria-label="Email for the launch waitlist"
              className="gate-input"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !email}
              className="gate-btn gate-btn-primary"
            >
              {busy
                ? t('gateWaitlistSubmitting', { defaultValue: gateEnFloor('gateWaitlistSubmitting') })
                : t('gateWaitlistSubmit', { defaultValue: gateEnFloor('gateWaitlistSubmit') })}
            </button>
          </div>
        )}
        {cine ? (
          <div className="www-cine-row">
            <button type="submit" disabled={busy || !email} className="www-cine-ghost">
              {busy
                ? t('gateWaitlistSubmitting', { defaultValue: gateEnFloor('gateWaitlistSubmitting') })
                : t('gateWaitlistTitle', { defaultValue: gateEnFloor('gateWaitlistTitle') })}
            </button>
          </div>
        ) : null}
        {error && (
          <p
            className={cine ? 'www-cine-foot' : 'gate-foot'}
            role="alert"
            style={cine ? undefined : { color: 'var(--destructive)' }}
          >
            {error}
          </p>
        )}
      </form>
    );
  }

  if (done) {
    return (
      <div data-mw-launch-notify="landing" className="border-2 border-border bg-background p-5">
        <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
          <Check className="h-4 w-4" aria-hidden />
          {t('landingCaptureDone', {
            defaultValue: 'You’re on the list. Check your inbox for a confirmation when email is live.',
          })}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{email}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-mw-launch-notify="landing"
      className="space-y-4"
    >
      <label className="block">
        <span className="sr-only">
          {t('landingCapturePlaceholder', { defaultValue: 'you@email.com' })}
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('landingCapturePlaceholder', { defaultValue: 'you@email.com' })}
          aria-label={t('landingNotifyEmailAria', {
            defaultValue: 'Email to get notified when Super Bundle checkout opens',
          })}
          className="w-full border-2 border-border bg-background px-3 py-3 text-sm min-h-[44px]"
          disabled={busy}
        />
      </label>
      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="min-h-[52px] w-full tap-target border-2 border-border bg-background px-4 text-sm font-semibold text-foreground disabled:opacity-50"
      >
        {busy
          ? t('landingCaptureSending', { defaultValue: 'Saving…' })
          : t('landingCaptureButton', { defaultValue: 'Notify me' })}
      </button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
