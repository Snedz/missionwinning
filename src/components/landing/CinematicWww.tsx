'use client';

/**
 * Four-scene cinematic www plus a quiet later line (not a fifth scene).
 * Marketing / gated door only. L1 Train+Coach on fold 1 (quiet Coach line under the h1).
 * Design N1: SET logger field → type-on-still → authored week breaks → poster-red door.
 * docs/design/WWW_NIGHT.md
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { CinematicLoggerFallback } from '@/components/landing/CinematicLogger';
import { gateEnFloor } from '@/i18n/gateEn';
import './cinematic.css';

const CinematicLogger = dynamic(
  () => import('@/components/landing/CinematicLogger').then((m) => m.CinematicLogger),
  { ssr: false, loading: () => <CinematicLoggerFallback /> }
);

const BREAKS = [
  { k: 'Miss.', b: 'Wednesday went. The week did not fail.' },
  { k: 'Travel.', b: 'Hotel room. Push-ups from the log.' },
  { k: 'Band.', b: 'Only a band. The session still counts.' },
] as const;

type Props = {
  /** gate = cold /private. open = post-unlock landing. */
  mode: 'gate' | 'open';
  door: ReactNode;
};

function Mark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/brand/logo-icon.svg"
      alt=""
      width={size}
      height={size}
    />
  );
}

export function CinematicWww({ mode, door }: Props) {
  const { t } = useTranslation();
  const g = (key: string) => t(key, { defaultValue: gateEnFloor(key) });
  const doorGhost = g('gateEyebrow');
  const navLabel =
    mode === 'gate' ? doorGhost : t('landingNavStart', { defaultValue: 'Start free' });
  const doorHref = mode === 'gate' ? '/private#door' : '/welcome';

  return (
    <div className="www-cine">
      <a className="sr-only" href="#set">
        Skip to content
      </a>
      <header className="www-cine-nav">
        <Link className="www-cine-brand" href={mode === 'gate' ? '/private' : '/'}>
          <Mark size={28} />
        </Link>
        <a className="www-cine-ghost" href={doorHref}>
          {navLabel}
        </a>
      </header>

      <main>
        <section className="www-cine-scene www-cine-set" id="set">
          <div className="www-cine-set-inner">
            <div className="www-cine-cover www-cine-rise">
              <p className="eyebrow-live www-cine-kicker">{g('cineSetEyebrow')}</p>
              <h1 className="display-hero">{g('cineHeroHeadline')}</h1>
              <p className="www-cine-lede" data-mw-wedge-teaser>
                {g('cineHeroLead')}
              </p>
            </div>
            <CinematicLogger doneHref={doorHref} doneLabel={navLabel} />
          </div>
        </section>

        <section className="www-cine-scene www-cine-anywhere" id="anywhere">
          <div className="www-cine-on-photo">
            <p className="eyebrow www-cine-kicker">{g('cineAnywhereKicker')}</p>
            <h2 className="display-section">{g('cineAnywhereTitle')}</h2>
            <p className="www-cine-lede">{g('cineAnywhereLead')}</p>
            <p className="www-cine-mark-follow">
              <a className="www-cine-ghost" href={doorHref}>
                {navLabel}
              </a>
            </p>
          </div>
        </section>

        <section className="www-cine-scene www-cine-week www-cine-rise" id="week">
          <p className="eyebrow www-cine-kicker">{g('cineWeekKicker')}</p>
          <h2 className="display-section">{g('cineWeekTitle')}</h2>
          <p className="www-cine-lede">{g('cineWeekLead')}</p>
          <ol className="www-cine-breaks">
            {BREAKS.map((beat) => (
              <li key={beat.k}>
                <strong>{beat.k}</strong>
                <span>{beat.b}</span>
              </li>
            ))}
          </ol>
          <p className="www-cine-mark-follow">
            <a className="www-cine-ghost" href={doorHref}>
              {navLabel}
            </a>
          </p>
        </section>

        <section className="www-cine-scene www-cine-door" id="door">
          <div className="www-cine-door-inner">
            <div className="www-cine-mark www-cine-rise">
              <Mark size={72} />
            </div>
            <p className="www-cine-kicker eyebrow-live">{doorGhost}</p>
            <h2 className="display-section">{g('gateWaitlistTitle')}.</h2>
            <div className="www-cine-strip">{door}</div>
          </div>
        </section>
      </main>
      <p className="www-cine-later">{g('cineLater')}</p>
    </div>
  );
}
