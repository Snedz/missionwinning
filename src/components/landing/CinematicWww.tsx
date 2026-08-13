'use client';

/**
 * Four-scene cinematic www. Marketing / gated door only.
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

const WEEK = [
  { d: 'Mon', w: 'Squat', n: '8 × 82.5' },
  { d: 'Tue', w: 'Push', n: 'floor' },
  { d: 'Wed', w: 'Hotel', n: 'push-up', rewrite: true },
  { d: 'Thu', w: 'Hinge', n: '8 × 100' },
  { d: 'Fri', w: 'Pull', n: 'bar' },
  { d: 'Sat', w: 'Walk', n: '—' },
  { d: 'Sun', w: 'Rest', n: '—' },
] as const;

type Props = {
  /** gate = cold /private. open = post-unlock landing. */
  mode: 'gate' | 'open';
  door: ReactNode;
};

function Mark({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- real brand SVG, not a raster
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
  const freeBeta = t('gateEyebrow', { defaultValue: 'Free beta' });
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
          <Mark />
          <span className="www-cine-word">Mission Winning</span>
        </Link>
        <a className="www-cine-ghost" href={doorHref}>
          {navLabel}
        </a>
      </header>

      <main>
        <section className="www-cine-scene www-cine-set" id="set">
          <div className="www-cine-split">
            <div>
              <div className="www-cine-mark">
                <Mark size={96} />
              </div>
              <p className="eyebrow-live www-cine-kicker www-cine-mark-follow">
                {t('landingHeroEyebrowLoop', { defaultValue: 'Free · offline · no account' })}
              </p>
              <h1 className="display-hero">{t('landingHeroLine1', { defaultValue: 'Log a set.' })}</h1>
              <p className="www-cine-lede">
                {t('landingHeroLine2', { defaultValue: 'Your week rewrites itself.' })}{' '}
                {t('landingHeroSubtitleLoop', {
                  defaultValue:
                    'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever.',
                })}
              </p>
            </div>
            <CinematicLogger doneHref={doorHref} doneLabel={navLabel} />
          </div>
        </section>

        <section className="www-cine-scene www-cine-week" id="week">
          <div className="www-cine-split">
            <div>
              <p className="eyebrow www-cine-kicker">
                {t('cineWeekKicker', { defaultValue: 'The week' })}
              </p>
              <h2 className="display-section">
                {t('cineWeekTitle', { defaultValue: 'A logged set is a new plan.' })}
              </h2>
              <p className="www-cine-lede">
                {t('cineWeekLead', {
                  defaultValue:
                    'Miss a day, travel, only a band — the week reshapes from the log. Not from a wearable, not from a schedule you already broke.',
                })}
              </p>
              <p className="www-cine-mark-follow">
                <a className="www-cine-ghost" href={doorHref}>
                  {navLabel}
                </a>
              </p>
            </div>
            <div>
              <div className="www-cine-week-grid" aria-label="This week">
                {WEEK.map((day) => (
                  <div
                    key={day.d}
                    className={day.rewrite ? 'www-cine-day is-rewritten' : 'www-cine-day'}
                  >
                    <strong>{day.d}</strong>
                    <b>{day.w}</b>
                    <span>{day.n}</span>
                  </div>
                ))}
              </div>
              <p className="www-cine-why">
                {t('cineWeekWhy', {
                  defaultValue:
                    'Wednesday was a gym squat. You logged travel. The session became a hotel-room push-up. The week did not fail.',
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="www-cine-scene www-cine-anywhere" id="anywhere">
          <div className="www-cine-slab">
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

        <section className="www-cine-scene www-cine-door" id="door">
          <div className="www-cine-door-inner">{door}</div>
        </section>
      </main>
    </div>
  );
}
