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
  const freeBeta = t('gateEyebrow', { defaultValue: 'Alpha' });
  const navLabel =
    mode === 'gate' ? freeBeta : t('landingNavStart', { defaultValue: 'Start free' });
  const doorHref = mode === 'gate' ? '#door' : '/welcome';

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
            <div className="www-cine-cover">
              <div className="www-cine-mark">
                <Mark size={96} />
              </div>
              <p className="eyebrow-live www-cine-kicker www-cine-mark-follow">
                {t('cinePublicLine', { defaultValue: 'Train Anywhere. Win Daily.' })}
              </p>
              <h1 className="display-hero">
                {t('cineHeroHeadline', { defaultValue: 'Log a set. Offline.' })}
              </h1>
              <p className="www-cine-lede">
                {t('cineHeroLead', {
                  defaultValue:
                    'Mission Coach plans the week from the log. No wearable.',
                })}
              </p>
            </div>
            <CinematicLogger doneHref={doorHref} doneLabel={navLabel} />
          </div>
        </section>

        <section className="www-cine-scene www-cine-anywhere" id="anywhere">
          <div className="www-cine-on-photo">
            <p className="eyebrow www-cine-kicker">
              {t('cineAnywhereKicker', { defaultValue: 'Anywhere' })}
            </p>
            <h2 className="display-section">
              {t('cineAnywhereTitle', {
                defaultValue: 'Garage. Hotel carpet. A park at dusk.',
              })}
            </h2>
            <p className="www-cine-lede">
              {t('cineAnywhereLead', {
                defaultValue:
                  'Sets save on the device. Signal is optional. The plan comes from what you logged, so nothing needs charging for it to work.',
              })}
            </p>
            <p className="www-cine-mark-follow">
              <a className="www-cine-ghost" href={doorHref}>
                {navLabel}
              </a>
            </p>
          </div>
        </section>

        <section className="www-cine-scene www-cine-week" id="week">
          <p className="eyebrow www-cine-kicker">
            {t('cineWeekKicker', { defaultValue: 'Mission Coach' })}
          </p>
          <h2 className="display-section">
            {t('cineWeekTitle', { defaultValue: 'The week does not fail.' })}
          </h2>
          <p className="www-cine-lede">
            {t('cineWeekLead', {
              defaultValue:
                'Authored from the log. Not a calendar you already broke. Not a wearable.',
            })}
          </p>
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
          <div className="www-cine-door-inner">{door}</div>
        </section>
      </main>
      <p className="www-cine-later">
        {t('cineLater', {
          defaultValue:
            'Mission Winning Health. Later: an athlete page you author. Not a feed.',
        })}
      </p>
    </div>
  );
}
