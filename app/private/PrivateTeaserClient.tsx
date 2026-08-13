'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { gateEnFloor } from '@/i18n/gateEn';
import {
  grantPrivateAccessFromSession,
  navigateAfterPrivateGateUnlock,
} from '@/lib/grantPrivateAccessFromSession';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import {
  waitlistTerritoryFromGeo,
  type WaitlistTerritory,
} from '@/lib/legal/waitlistTerritory';
import { submitLead } from '@/lib/supabase';
import { track } from '@/lib/analytics';

type Props = {
  /** Server-resolved invite so SSR HTML exposes data-mw-invitee for gate-smoke. */
  initialInvite?: string;
  /** Server-resolved `?next=` — read here so the gate needs no Suspense boundary. */
  initialNext?: string;
};

export function PrivateTeaserClient({ initialInvite = '', initialNext = '' }: Props) {
  const { t } = useTranslation();
  /**
   * Every string on this page is floored from the English gate pack, so the
   * server paint and the post-hydration paint are the same sentence. Typing the
   * fallback by hand is how the gate came to promise two different things a
   * couple of seconds apart — see `gateEn.ts`.
   */
  const g = (key: string) => t(key, { defaultValue: gateEnFloor(key) });
  const isInvitee = Boolean(initialInvite.trim());

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waitEmail, setWaitEmail] = useState('');
  const [waitDone, setWaitDone] = useState(false);
  const [waitBusy, setWaitBusy] = useState(false);
  const [waitError, setWaitError] = useState<string | null>(null);
  const [sessionUnlocking, setSessionUnlocking] = useState(true);
  const [territory, setTerritory] = useState<WaitlistTerritory>({ stance: 'capture' });

  // Signed-in (localStorage) but missing gate cookie — typical after Google OAuth.
  // Bounded + fail-open: code-only invitees must reach the access-code form.
  //
  // `.745` — this probe used to replace the whole page with "Checking sign-in…"
  // for up to 6s. With PRIVATE_MODE on, `/` redirects here, so those three words
  // were the entire server-rendered website. The probe now runs underneath the
  // poster and only announces itself in one line; on success it still hard-navs.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const ok = await grantPrivateAccessFromSession();
        if (cancelled) return;
        if (ok) {
          navigateAfterPrivateGateUnlock(privateGateReturnPath(initialNext));
          return;
        }
      } finally {
        if (!cancelled) setSessionUnlocking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialNext]);

  // Territory truth before the ask: /api/geo is public while gated (privateGate.ts).
  useEffect(() => {
    if (isInvitee) return; // Invitees were chosen by hand — no capture to police.
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/geo', { credentials: 'same-origin' });
        if (!res.ok || cancelled) return;
        const stance = waitlistTerritoryFromGeo(await res.json());
        if (!cancelled) setTerritory(stance);
      } catch {
        /* Fail-open: never tell a supported athlete they are excluded. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isInvitee]);

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
        navigateAfterPrivateGateUnlock(privateGateReturnPath(initialNext));
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
        g('gateWaitlistFailed')
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
        {g('gateAccessLabel')}
      </span>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={g('gateAccessPlaceholder')}
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
    ? g('gateAccessChecking')
    : g('gateAccessSubmit');

  /** Announced, never blocking — the poster is already on screen behind it. */
  const probeNote = sessionUnlocking ? (
    <p className="gate-foot" aria-live="polite">
      {g('gateCheckingSession')}
    </p>
  ) : null;

  /** `notice` = country unconfirmed (Tor / some VPNs). Say so; keep the form. */
  const territoryNote =
    territory.stance === 'notice' && territory.message ? (
      <p className="gate-foot" data-mw-territory={territory.reason}>
        {territory.message}{' '}
        <Link href="/regions">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
      </p>
    ) : null;

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
          {g('gateEyebrow')}
        </p>
      </header>
      <hr className="gate-rule" />

      {/* Field manual: eyebrow → display → one red (invite = enter beta; cold = notify). */}
      <main className="gate-main">
        <div className="gate-col">
          <h1 className="gate-h1">
            <span>{g('gateTitle1')}</span>
            <span>{g('gateTitle2')}</span>
          </h1>
          <p className="gate-lede">
            {g('gateSubtitle')}
          </p>

          {isInvitee ? (
            <section className="gate-section">
              <p className="gate-kicker">
                {g('gateInviteEyebrow')}
              </p>
              <p className="gate-invite-copy">
                {g('gateInviteSubtitle')}
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
                  {g('gateBetaGuideFoot')}{' '}
                  <Link href="/beta">
                    {g('gateBetaGuide')}
                  </Link>
                  . If you installed the app before the gate, clear site data or reinstall.
                </p>
              </form>
            </section>
          ) : (
            <section className="gate-section">
              {territory.stance === 'refuse' ? (
                /*
                 * A named excluded territory. The poster still stands — the
                 * product exists and the source is public — but we do not ask
                 * for an address we could only ever ignore. The access-code
                 * details below stay open, so a hand-picked tester passing
                 * through is not locked out of their own invite.
                 */
                <div data-mw-territory={territory.reason}>
                  <p className="gate-kicker">
                    {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
                  </p>
                  <p className="gate-invite-copy">{territory.message}</p>
                  <p className="gate-foot">
                    <Link href="/regions">
                      {t('infoRegionsNotSupported', {
                        defaultValue: 'Where we do not support the hosted service',
                      })}
                    </Link>
                  </p>
                </div>
              ) : waitDone ? (
                <>
                  <p className="gate-done">
                    <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
                    {g('gateWaitlistDone')}
                  </p>
                  <p className="gate-foot">
                    {g('gateWaitlistDoneFoot')}{' '}
                    {waitEmail}
                  </p>
                </>
              ) : (
                <form onSubmit={handleWaitlist}>
                  <p className="gate-kicker">
                    {g('gateWaitlistTitle')}
                  </p>
                  <div className="gate-row">
                    <input
                      type="email"
                      required
                      value={waitEmail}
                      onChange={(e) => setWaitEmail(e.target.value)}
                      placeholder={g('gateWaitlistPlaceholder')}
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
                        ? g('gateWaitlistSubmitting')
                        : g('gateWaitlistSubmit')}
                    </button>
                  </div>
                  {waitError && (
                    <p className="gate-foot" role="alert" style={{ color: 'var(--destructive)' }}>
                      {waitError}
                    </p>
                  )}
                  <p className="gate-foot">
                    {g('gateWaitlistFoot')}
                  </p>
                  {territoryNote}
                </form>
              )}

              {/* Access code secondary — never competes with Notify me red. */}
              <details className="gate-details" open={false}>
                <summary className="gate-details-summary">
                  {g('gateAccessSummary')}
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

          {probeNote}
        </div>
      </main>

      <div className="gate-footer">
        <div className="gate-footer-inner">
          <span>
            Mission Winning —{' '}
            {g('gateFooterTagline')}
          </span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </div>
  );
}
