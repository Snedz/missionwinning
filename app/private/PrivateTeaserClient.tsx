'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import {
  grantPrivateAccessFromSession,
  navigateAfterPrivateGateUnlock,
} from '@/lib/grantPrivateAccessFromSession';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';

type Props = {
  /** Server-resolved invite so SSR HTML exposes data-mw-invitee for gate-smoke. */
  initialInvite?: string;
};

export function PrivateTeaserClient({ initialInvite = '' }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const inviteCode = (searchParams.get('invite')?.trim() || initialInvite).trim();
  const isInvitee = Boolean(inviteCode);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone, setWaitDone] = useState(false);
  const [waitBusy, setWaitBusy] = useState(false);
  const [waitError, setWaitError] = useState<string | null>(null);
  const [sessionUnlocking, setSessionUnlocking] = useState(true);

  // Signed-in (localStorage) but missing gate cookie — typical after Google OAuth.
  // Bounded + fail-open: code-only invitees must reach the access-code form.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ok = await grantPrivateAccessFromSession();
        if (cancelled) return;
        if (ok) {
          navigateAfterPrivateGateUnlock(
            privateGateReturnPath(searchParams.get('next'))
          );
          return;
        }
      } finally {
        if (!cancelled) setSessionUnlocking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

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
        navigateAfterPrivateGateUnlock(
          privateGateReturnPath(searchParams.get('next'))
        );
        return;
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
    setWaitError(null);

    // Same defect as UnlockButton had: `submitLead` never throws — it reports
    // failure through `{ ok }` — so the old try/catch was dead and the result was
    // discarded. This is the private gate, the only public capture point while
    // PRIVATE_MODE is on, so a silently dropped address here is a launch-day lead
    // that never existed. `ok` is still true for the local-only fallback, which is
    // recoverable; only a hard failure shows the error.
    const result = await submitLead({
      name: '',
      email: waitEmail,
      source: 'launch-waitlist',
      message: 'Private gate waitlist',
    });

    if (!result?.ok) {
      setWaitError(
        t('gateWaitlistFailed', {
          defaultValue: 'That did not save. Check your connection and try again.',
        })
      );
      setWaitBusy(false);
      return;
    }

    track('waitlist_joined', { product: 'launch' });
    setWaitDone(true);
    setWaitBusy(false);
  };

  const errorNode = error ? (
    <p role="alert" aria-live="assertive" className="gate-error">
      {error}
    </p>
  ) : null;

  const codeField = (
    <label className="gate-field">
      <span className="gate-label">
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
        className="gate-input"
        disabled={loading}
      />
    </label>
  );

  const submitLabel = loading
    ? t('gateAccessChecking', { defaultValue: 'Checking…' })
    : t('gateAccessSubmit', { defaultValue: 'Enter with code' });

  if (sessionUnlocking) {
    return (
      <div
        className="gate-shell gate-center"
        data-mw-invitee={isInvitee ? '1' : '0'}
      >
        {t('gateCheckingSession', { defaultValue: 'Checking sign-in…' })}
      </div>
    );
  }

  return (
    <div className="gate-shell page-enter" data-mw-invitee={isInvitee ? '1' : '0'}>
      <header className="gate-header">
        <span className="gate-brand">
          <span className="gate-mark" data-brand-monogram aria-hidden>
            MW
          </span>
          <span className="gate-brandname">Mission Winning</span>
        </span>
        <p className="gate-kicker">
          {t('gateEyebrow', { defaultValue: 'Free beta' })}
        </p>
      </header>
      <hr className="gate-rule" />

      {/* Field manual: eyebrow → display → one red (invite = enter beta; cold = notify). */}
      <main className="gate-main">
        <div className="gate-col">
          <h1 className="gate-h1">
            <span>{t('gateTitle1', { defaultValue: 'Train anywhere.' })}</span>
            <span>{t('gateTitle2', { defaultValue: 'Win daily.' })}</span>
          </h1>
          <p className="gate-lede">
            {t('gateSubtitle', {
              defaultValue:
                'Free offline workout logging plus Mission Coach — weekly plans from your logs alone, no wearable. Launching soon; the core is free forever.',
            })}
          </p>

          {isInvitee ? (
            <section className="gate-section">
              <p className="gate-kicker">
                {t('gateInviteEyebrow', { defaultValue: 'Beta invite' })}
              </p>
              <p className="gate-invite-copy">
                {t('gateInviteSubtitle', {
                  defaultValue:
                    "You're invited — enter the access code from your invite email, then complete I-Day and log your first workout.",
                })}
              </p>
              <form onSubmit={handleSubmit}>
                {codeField}
                <div className="gate-actions">
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="gate-btn gate-btn-primary"
                  >
                    {submitLabel}
                  </button>
                </div>
                {errorNode}
                <p className="gate-foot">
                  {t('gateBetaGuideFoot', { defaultValue: 'Invited testers: see the' })}{' '}
                  <Link href="/beta">
                    {t('gateBetaGuide', { defaultValue: 'beta start guide' })}
                  </Link>
                  . If you installed the app before the gate, clear site data or reinstall.
                </p>
              </form>
            </section>
          ) : (
            <section className="gate-section">
              {waitDone ? (
                <>
                  <p className="gate-done">
                    <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                    {t('gateWaitlistDone', { defaultValue: "You're on the list." })}
                  </p>
                  <p className="gate-foot">
                    {t('gateWaitlistDoneFoot', {
                      defaultValue: "We'll email you the moment doors open.",
                    })}{' '}
                    {waitEmail}
                  </p>
                </>
              ) : (
                <form onSubmit={handleWaitlist}>
                  <p className="gate-kicker">
                    {t('gateWaitlistTitle', { defaultValue: 'Get notified' })}
                  </p>
                  <div className="gate-row">
                    <input
                      type="email"
                      required
                      value={waitEmail}
                      onChange={(e) => setWaitEmail(e.target.value)}
                      placeholder={t('gateWaitlistPlaceholder', {
                        defaultValue: 'you@example.com',
                      })}
                      aria-label="Email for the launch waitlist"
                      className="gate-input"
                      disabled={waitBusy}
                    />
                    <button
                      type="submit"
                      disabled={waitBusy || !waitEmail}
                      className="gate-btn gate-btn-primary"
                    >
                      {waitBusy
                        ? t('gateWaitlistSubmitting', { defaultValue: 'Joining…' })
                        : t('gateWaitlistSubmit', { defaultValue: 'Get notified' })}
                    </button>
                  </div>
                  {waitError && (
                    <p className="gate-foot" role="alert" style={{ color: 'var(--destructive)' }}>
                      {waitError}
                    </p>
                  )}
                  <p className="gate-foot">
                    {t('gateWaitlistFoot', {
                      defaultValue: 'No spam — one email when the beta opens, one at launch.',
                    })}
                  </p>
                </form>
              )}

              {/* Access code secondary — never competes with Notify me red. */}
              <details className="gate-details" open={false}>
                <summary className="gate-details-summary">
                  {t('gateAccessSummary', { defaultValue: 'Have a beta access code?' })}
                </summary>
                <form onSubmit={handleSubmit}>
                  {codeField}
                  <div className="gate-actions">
                    <button
                      type="submit"
                      disabled={loading || !password}
                      className="gate-btn gate-btn-secondary"
                    >
                      {submitLabel}
                    </button>
                  </div>
                  {errorNode}
                </form>
              </details>
            </section>
          )}
        </div>
      </main>

      <div className="gate-footer">
        <div className="gate-footer-inner">
          <span>
            Mission Winning —{' '}
            {t('gateFooterTagline', { defaultValue: 'free core forever' })}
          </span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </div>
  );
}
