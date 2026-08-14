'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import {
  APP_PUBLIC_PRODUCT_VERSION,
  APP_PUBLIC_VERSION,
} from '@/lib/buildInfo';
import {
  grantPrivateAccessFromSession,
  navigateAfterPrivateGateUnlock,
} from '@/lib/grantPrivateAccessFromSession';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import { LaunchNotifyForm } from '@/components/public/LaunchNotifyForm';

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
    : t('gateAccessSubmit', { defaultValue: 'Enter the beta' });

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
        <p className="gate-kicker" data-mw-public-version={APP_PUBLIC_VERSION}>
          {APP_PUBLIC_VERSION}
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
              <LaunchNotifyForm
                source="launch-waitlist"
                message="Private gate waitlist"
                variant="gate"
              />

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
            {APP_PUBLIC_PRODUCT_VERSION} —{' '}
            {t('gateFooterTagline', { defaultValue: 'free core forever' })}
          </span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </div>
  );
}
