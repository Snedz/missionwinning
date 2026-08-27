'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
import { BrandMonogram } from '@/components/brand/BrandMonogram';
import { GateSetTable } from '@/components/public/GateSetTable';
import { LaunchNotifyForm } from '@/components/public/LaunchNotifyForm';
import { gateEnFloor } from '@/i18n/gateEn';
import { confirmPrivateGateCookie } from '@/lib/confirmPrivateGateCookie';
import {
  grantPrivateAccessFromSession,
  navigateAfterPrivateGateUnlock,
} from '@/lib/grantPrivateAccessFromSession';
import { privateGateReturnPath } from '@/lib/privateGateReturn';
import {
  waitlistTerritoryFromGeo,
  type WaitlistTerritory,
} from '@/lib/legal/waitlistTerritory';

type Props = {
  /** Server-resolved invite so SSR HTML exposes data-mw-invitee for gate-smoke. */
  initialInvite?: string;
  /** Server-resolved `?next=` — read here so the gate needs no Suspense boundary. */
  initialNext?: string;
  /**
   * Preview / local: PRIVATE_MODE is off. Unlock still POSTs Done so the
   * gate cookie is set, then `/` can paint the homepage (not I-Day).
   */
  walkOpen?: boolean;
};

const NAV = [
  { href: '/active', label: 'Train' },
  { href: '#coach', label: 'Coach' },
  { href: '#history', label: 'History' },
  { href: '/about', label: 'About' },
] as const;

export function PrivateTeaserClient({
  initialInvite = '',
  initialNext = '',
  walkOpen = false,
}: Props) {
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
  const [sessionUnlocking, setSessionUnlocking] = useState(!walkOpen);
  const [territory, setTerritory] = useState<WaitlistTerritory>({ stance: 'capture' });

  // Signed-in (localStorage) but missing gate cookie — typical after Google OAuth.
  // Bounded + fail-open: code-only invitees must reach the access-code form.
  //
  // `.765` — this probe used to replace the whole page with a session spinner
  // for up to 6s. With PRIVATE_MODE on, `/` redirects here, so those words
  // were the entire server-rendered website. The probe now runs underneath the
  // poster and only announces itself in one line; on success it still hard-navs.
  const unlockHref = privateGateReturnPath(initialNext);

  useEffect(() => {
    if (walkOpen) {
      setSessionUnlocking(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const ok = await grantPrivateAccessFromSession(initialInvite);
        if (cancelled) return;
        if (ok) {
          navigateAfterPrivateGateUnlock(unlockHref);
          return;
        }
      } finally {
        if (!cancelled) setSessionUnlocking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialInvite, unlockHref, walkOpen]);

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
    const code = password.trim();
    if (!code) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/private-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password: code }),
      });

      if (res.ok) {
        const kept = await confirmPrivateGateCookie();
        if (!kept) {
          setError(
            'The code was accepted but this host did not keep the gate cookie. On a Vercel Preview, set PRIVATE_ACCESS_SECRET and PRIVATE_ACCESS_CODES for Preview (same values as Production) and redeploy. If you see a Vercel login instead of this page, that is Deployment Protection — not the Done code.'
          );
          return;
        }
        navigateAfterPrivateGateUnlock(unlockHref);
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

  const doorForms = isInvitee ? (
    <section className="gate-section" id="door">
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
    <section className="gate-section" id="door">
      {territory.stance === 'refuse' ? (
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
      ) : (
        <>
          <p className="gate-kicker">{g('gateWaitlistTitle')}</p>
          <LaunchNotifyForm
            source="launch-waitlist"
            message="Private gate waitlist"
            variant="gate"
          />
          <p className="gate-foot">{g('gateWaitlistFoot')}</p>
          {territoryNote}
        </>
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
  );

  return (
    <div className="gate-shell page-enter" data-mw-invitee={isInvitee ? '1' : '0'}>
      <header className="gate-nav">
        <div className="gate-nav-inner">
          <span className="gate-brand">
            <BrandMonogram className="h-8 w-8 text-sm" />
            <span className="gate-brandname">Mission Winning</span>
          </span>
          <nav className="gate-nav-cluster" aria-label="Product">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="gate-nav-end">
            <a href="#door" className="gate-nav-login">
              {g('gateWaitlistTitle')}
            </a>
            <a href="#door" className="gate-nav-login">
              {g('gateAccessSubmit')}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="gate-hero">
          <div className="gate-hero-copy">
            <p className="gate-kicker">{g('gateEyebrow')}</p>
            <h1 className="gate-h1">
              <span>{g('gateTitle1')}</span>
              <span>{g('gateTitle2')}</span>
            </h1>
            <p className="gate-lede" data-mw-wedge-teaser>
              {g('gateSubtitle')}
            </p>
            <p className="gate-foot" data-mw-local-first>
              {g('gateLocalFirst')}
            </p>
          </div>
          <GateSetTable />
        </section>

        <section className="gate-shelf" id="train">
          <p className="gate-kicker">{g('gateSubtitle')}</p>
          <h2 className="gate-h2">{g('cineAnywhereTitle')}</h2>
          <div className="gate-cards">
            <article className="gate-card">
              <h3>{g('cineAnywhereKicker')}</h3>
              <p>{g('cineAnywhereLead')}</p>
            </article>
            <article className="gate-card">
              <h3>{g('cinePublicLine')}</h3>
              <p>{g('cineLater')}</p>
            </article>
            <article className="gate-card">
              <h3>{g('cineWeekKicker')}</h3>
              <p>{g('cineWeekLead')}</p>
            </article>
          </div>
        </section>

        <section className="gate-ink" id="today">
          <p className="gate-kicker">Today</p>
          <h2 className="gate-h2">{g('cinePublicLine')}</h2>
          <p className="gate-lede">
            {g('cineDoorFoot')}
          </p>
          <Link href="/active" className="gate-btn gate-btn-on-ink">
            Start
          </Link>
        </section>

        <section className="gate-shelf" id="history">
          <p className="gate-kicker">History</p>
          <h2 className="gate-h2">{g('cineLater')}</h2>
          <div className="gate-month" aria-hidden>
            {Array.from({ length: 35 }, (_, i) => (
              <span key={i} className="gate-month-cell" />
            ))}
          </div>
        </section>

        <section className="gate-shelf gate-shelf-card" id="coach">
          <p className="gate-kicker">{g('cineWeekKicker')}</p>
          <h2 className="gate-h2">{g('cineWeekTitle')}</h2>
          <p className="gate-lede">{g('cineWeekLead')}</p>
          <p className="gate-foot">{g('cineWeekWhy')}</p>
        </section>

        {doorForms}

        {probeNote}
      </main>

      <div className="gate-footer">
        <div className="gate-footer-inner">
          <span>
            {g('gateFooterTagline')}
          </span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </div>
  );
}
