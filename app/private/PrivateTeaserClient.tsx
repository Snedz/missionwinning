'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { grantPrivateAccessFromSession } from '@/lib/grantPrivateAccessFromSession';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';

type Props = {
  /** Server-resolved invite so SSR HTML exposes data-mw-invitee for gate-smoke. */
  initialInvite?: string;
};

export function PrivateTeaserClient({ initialInvite = '' }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = (searchParams.get('invite')?.trim() || initialInvite).trim();
  const isInvitee = Boolean(inviteCode);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone, setWaitDone] = useState(false);
  const [waitBusy, setWaitBusy] = useState(false);
  const [sessionUnlocking, setSessionUnlocking] = useState(true);

  // Signed-in (localStorage) but missing gate cookie — typical after Google OAuth.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await grantPrivateAccessFromSession();
      if (cancelled) return;
      if (ok) {
        const next = searchParams.get('next')?.trim();
        const dest =
          next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
        router.replace(dest);
        router.refresh();
        return;
      }
      setSessionUnlocking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const next = searchParams.get('next')?.trim();
        const dest =
          next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
        router.push(dest);
        router.refresh();
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
    track('waitlist_joined', { product: 'launch' });
    setWaitDone(true);
    setWaitBusy(false);
  };

  const accessForm = (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-border/40 pt-6">
      {isInvitee ? (
        <p className="text-sm font-medium text-foreground">
          {t('gateInviteHeadline', {
            defaultValue: "You're invited — enter your access code to join the beta.",
          })}
        </p>
      ) : null}
      <label className="block space-y-2 text-sm">
        <span className="eyebrow text-muted-foreground">
          {t('gateAccessLabel', { defaultValue: 'Access code' })}
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('gateAccessPlaceholder', {
            defaultValue: 'Enter code from your invite',
          })}
          autoComplete="off"
          // Invitees land with the access form expanded — focus the code field.
          // eslint-disable-next-line jsx-a11y/no-autofocus -- invite conversion
          autoFocus={isInvitee}
          className="tap-target w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={loading}
        />
      </label>
      <button
        type="submit"
        disabled={loading || !password}
        className="primary-action disabled:opacity-50"
      >
        {loading
          ? t('gateAccessChecking', { defaultValue: 'Checking…' })
          : t('gateAccessSubmit', { defaultValue: 'Enter the beta' })}
      </button>
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-[hsl(var(--status-danger))]"
        >
          {error}
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t('gateBetaGuideFoot', { defaultValue: 'Invited testers: see the' })}{' '}
        <Link href="/beta" className="text-muted-foreground underline-offset-2 hover:underline">
          {t('gateBetaGuide', { defaultValue: 'beta start guide' })}
        </Link>
        . If you installed the app before the gate, clear site data or reinstall.
      </p>
    </form>
  );

  if (sessionUnlocking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm"
        data-mw-invitee={isInvitee ? '1' : '0'}
      >
        {t('gateCheckingSession', { defaultValue: 'Checking sign-in…' })}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-background text-foreground"
      data-mw-invitee={isInvitee ? '1' : '0'}
    >
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md page-enter">
          <div className="text-center mb-10">
            <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              MW
            </span>
            <p className="eyebrow-live mb-4">
              {isInvitee
                ? t('gateInviteEyebrow', { defaultValue: 'Beta invite' })
                : t('gateEyebrow', { defaultValue: 'Private beta in progress' })}
            </p>
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-5xl">
              {t('gateTitle1', { defaultValue: 'Train anywhere.' })}
              <br />
              {t('gateTitle2', { defaultValue: 'Win daily.' })}
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {isInvitee
                ? t('gateInviteSubtitle', {
                    defaultValue:
                      'Enter the access code from your invite email, then complete I-Day and log your first workout.',
                  })
                : t('gateSubtitle', {
                    defaultValue:
                      'Free offline workout logging + adaptive Mission Coach from your logs (no wearable). Launching soon — free core forever.',
                  })}
            </p>
          </div>

          {isInvitee ? (
            accessForm
          ) : (
            <>
              {waitDone ? (
                <div className="mt-6 border-t border-border/40 pt-6 text-center">
                  <p className="inline-flex items-center gap-1.5 font-semibold text-primary">
                    <Check className="h-4 w-4" />{' '}
                    {t('gateWaitlistDone', { defaultValue: "You're on the list." })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('gateWaitlistDoneFoot', {
                      defaultValue: "We'll email you the moment doors open.",
                    })}{' '}
                    {waitEmail}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="mt-6 space-y-3 border-t border-border/40 pt-6">
                  <p className="eyebrow">
                    {t('gateWaitlistTitle', { defaultValue: 'Get notified at launch' })}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      required
                      value={waitEmail}
                      onChange={(e) => setWaitEmail(e.target.value)}
                      placeholder={t('gateWaitlistPlaceholder', {
                        defaultValue: 'you@example.com',
                      })}
                      aria-label="Email for the launch waitlist"
                      className="tap-target w-full flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={waitBusy}
                    />
                    <button
                      type="submit"
                      disabled={waitBusy || !waitEmail}
                      className="primary-action sm:w-auto sm:px-6 disabled:opacity-50"
                    >
                      {waitBusy
                        ? t('gateWaitlistSubmitting', { defaultValue: 'Joining…' })
                        : t('gateWaitlistSubmit', { defaultValue: 'Notify me' })}
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t('gateWaitlistFoot', {
                      defaultValue: 'No spam — one email when the beta opens, one at launch.',
                    })}
                  </p>
                </form>
              )}

              <details className="group mt-6" open={false}>
                <summary className="cursor-pointer list-none text-center text-xs text-muted-foreground hover:text-foreground marker:content-none">
                  {t('gateAccessSummary', { defaultValue: 'Have a beta access code?' })}
                </summary>
                {accessForm}
              </details>
            </>
          )}
        </div>
      </div>
      <AppLegalFooter className="border-t border-border/30 pb-6" />
    </div>
  );
}
