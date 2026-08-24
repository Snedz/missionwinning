'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { AppLegalFooter } from '@/components/layout/AppLegalFooter';
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
    <p role="alert" aria-live="assertive" className="www-cine-foot">
      {error}
    </p>
  ) : null;

  const codeField = (
    <label className="www-cine-field">
      <span>{g('gateAccessLabel')}</span>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={g('gateAccessPlaceholder')}
        autoComplete="off"
        // Invitees land with the access form expanded — focus the code field.
        // eslint-disable-next-line jsx-a11y/no-autofocus -- invite conversion
        autoFocus={isInvitee}
        disabled={loading}
      />
    </label>
  );

  const submitLabel = loading
    ? g('gateAccessChecking')
    : g('gateAccessSubmit');

  /** Announced, never blocking — the poster is already on screen behind it. */
  const probeNote = sessionUnlocking ? (
    <p className="www-cine-foot" aria-live="polite">
      {g('gateCheckingSession')}
    </p>
  ) : null;

  /** `notice` = country unconfirmed (Tor / some VPNs). Say so; keep the form. */
  const territoryNote =
    territory.stance === 'notice' && territory.message ? (
      <p className="www-cine-foot" data-mw-territory={territory.reason}>
        {territory.message}{' '}
        <Link href="/regions">
          {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
        </Link>
      </p>
    ) : null;

  return (
    <div data-mw-invitee={isInvitee ? '1' : '0'}>
      {isInvitee ? (
        <section>
          <p className="www-cine-lede">{g('gateInviteSubtitle')}</p>
          <form onSubmit={handleSubmit}>
            {codeField}
            <div className="www-cine-row">
              <button type="submit" disabled={loading || !password} className="www-cine-ghost">
                {submitLabel}
              </button>
            </div>
            {errorNode}
            <p className="www-cine-foot">
              {g('gateBetaGuideFoot')}{' '}
              <Link href="/beta">{g('gateBetaGuide')}</Link>
              . If you installed the app before the gate, clear site data or reinstall.
            </p>
          </form>
        </section>
      ) : (
        <section>
          {territory.stance === 'refuse' ? (
            <div data-mw-territory={territory.reason}>
              <p className="www-cine-lede">
                {t('infoRegionsTitle', { defaultValue: 'Supported Regions' })}
              </p>
              <p className="www-cine-foot">{territory.message}</p>
              <p className="www-cine-foot">
                <Link href="/regions">
                  {t('infoRegionsNotSupported', {
                    defaultValue: 'Where we do not support the hosted service',
                  })}
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="www-cine-lede">{g('cineDoorLead')}</p>
              <LaunchNotifyForm
                source="launch-waitlist"
                message="Private gate waitlist"
                variant="cine"
              />
              <p className="www-cine-foot">{g('cineDoorFoot')}</p>
              {territoryNote}
            </>
          )}

          <details className="www-cine-details" open={false}>
            <summary>{g('gateAccessSummary')}</summary>
            <form onSubmit={handleSubmit}>
              {codeField}
              <div className="www-cine-row">
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="www-cine-ghost"
                >
                  {submitLabel}
                </button>
              </div>
              {errorNode}
            </form>
          </details>
        </section>
      )}

      <p className="www-cine-foot" data-mw-local-first>
        {g('gateLocalFirst')}
      </p>
      {probeNote}

      <div className="www-cine-colophon">
        <div className="www-cine-colophon-inner">
          <span>{g('gateFooterTagline')}</span>
          <AppLegalFooter className="gate-footer-links" />
        </div>
      </div>
    </div>
  );
}
