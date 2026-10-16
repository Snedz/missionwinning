'use client';
/**
 * Page: / — marketing landing (port of the Z.ai "Ironhouse" V1 prototype, rebranded).
 * Review + port notes: docs live with the prototype review (/workspace/zai/review.md on the box).
 *
 * Scoped styles: MissionLanding.module.css (tokens live on .root so nothing leaks into house.css).
 * Honesty: no testimonials, member counts or invented stats. Every number on this page is a
 * real product fact: $0 logger, $99/yr Yearly, Earn It Back ($50 @ 24 in 90d, $40 @ 96 in 1y,
 * max $90), 14-day full refund, 14 languages.
 * i18n: every string goes through t() with an English defaultValue, so all 14 locales render
 * (falling back to English until translated).
 */
import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { LogToPlanHeroFallback } from '@/components/landing/LogToPlanHero';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { GrayscalePhoto } from '@/components/marketing/GrayscalePhoto';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { landingFaqKeysForSurface } from '@/i18n/landingLocales';
import s from './MissionLanding.module.css';

export const YEARLY_CHECKOUT_URL = 'https://buy.stripe.com/aFabJ00AC0Rj6fh2eW9k400';

const LogToPlanHero = dynamic(
  () => import('@/components/landing/LogToPlanHero').then((m) => m.LogToPlanHero),
  { ssr: false, loading: () => <LogToPlanHeroFallback /> }
);
const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <SkeletonBlock className="min-h-[8rem]" label="Loading coach demo" /> }
);
/** Same free-beta filter as FAQ JSON-LD (from the old LandingPage). */
const FAQ = landingFaqKeysForSurface();

const c = (names: string) =>
  names
    .split(' ')
    .map((n) => s[n] ?? n)
    .join(' ');

function Sprite() {
  return (
    <svg width="0" height="0" className={c('sr-only')} aria-hidden="true" focusable="false">
      <defs>
        <symbol id="mw-fig-dead" viewBox="0 0 320 500">
          <circle cx="160" cy="68" r="24" />
          <path d="M124 96 L196 96 L186 268 L134 268 Z" />
          <g stroke="currentColor" strokeWidth="19" strokeLinecap="round" fill="none">
            <line x1="128" y1="104" x2="102" y2="272" />
            <line x1="192" y1="104" x2="218" y2="272" />
          </g>
          <g stroke="currentColor" strokeWidth="27" strokeLinecap="round" fill="none">
            <line x1="142" y1="262" x2="126" y2="472" />
            <line x1="178" y1="262" x2="194" y2="472" />
          </g>
          <rect x="106" y="466" width="40" height="12" />
          <rect x="174" y="466" width="40" height="12" />
          <rect x="44" y="268" width="232" height="9" />
          <circle cx="78" cy="272" r="50" />
          <circle cx="242" cy="272" r="50" />
        </symbol>
        <symbol id="mw-fig-press" viewBox="0 0 380 500">
          <rect x="26" y="48" width="328" height="9" />
          <circle cx="82" cy="52" r="48" />
          <circle cx="298" cy="52" r="48" />
          <circle cx="190" cy="152" r="24" />
          <path d="M154 180 L226 180 L216 348 L164 348 Z" />
          <g stroke="currentColor" strokeWidth="19" strokeLinecap="round" fill="none">
            <line x1="150" y1="188" x2="146" y2="56" />
            <line x1="230" y1="188" x2="234" y2="56" />
          </g>
          <g stroke="currentColor" strokeWidth="27" strokeLinecap="round" fill="none">
            <line x1="172" y1="340" x2="156" y2="472" />
            <line x1="208" y1="340" x2="224" y2="472" />
          </g>
          <rect x="136" y="466" width="40" height="12" />
          <rect x="204" y="466" width="40" height="12" />
        </symbol>
      </defs>
    </svg>
  );
}

export function MissionLanding() {
  const { t } = useTranslation();
  const tx = (k: string, d: string) => t(k, { defaultValue: d });
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const faqId = useId();
  useEffect(() => {
    const ready = () => setBelowFoldReady(true);
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(ready, { timeout: 1800 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(ready, 200);
    return () => clearTimeout(timer);
  }, []);

  const ticker = [
    tx('mwlTick1', 'Log it live'),
    tx('mwlTick2', 'Three sets is a workout'),
    tx('mwlTick3', 'One workout a day counts'),
    tx('mwlTick4', 'Earn it back'),
    tx('mwlTick5', 'No wearable needed'),
  ];

  const rules = [
    ['mwlRule1', 'Log it live.', 'Sets go in while you train, not reconstructed tonight. Live logs are what the coach and Earn It Back trust.'],
    ['mwlRule2', 'Three sets is a workout.', 'A session counts once it has at least three logged sets. Short days still count.'],
    ['mwlRule3', 'One a day.', 'One workout per calendar day counts toward your milestones. Consistency beats volume.'],
    ['mwlRule4', 'A missed day is not a failed plan.', 'Mission Coach rebuilds the week from what you actually did, not what you meant to do.'],
    ['mwlRule5', 'The logger stays free.', 'Logging, history and the exercise library are free. Yearly is optional.'],
  ] as const;

  return (
    <div className={c('root')}>
      <Sprite />
      <MarketingNav variant="full" />

      <main id="content">
        <section className={c('hero')} id="top">
          <div className={c('container hero-split')}>
            <div>
              <p className={c('eyebrow')}>
                {tx('landingHeroEyebrowLoop', 'Free · offline · no account')}
              </p>
              <h1>
                {tx('landingHeroLine1', 'Log a set.')}
                <br />
                <span className={c('hl')}>{tx('landingHeroLine2', 'Your week rewrites itself.')}</span>
              </h1>
              <p className={c('lead')} style={{ marginTop: 'var(--g-md)' }}>
                {tx(
                  'landingHeroSubtitleLoop',
                  'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever. Works offline, anywhere you train.'
                )}
              </p>
              <div className={c('hero-cta')}>
                <Link className={c('btn btn-primary')} href="/welcome">
                  {tx('landingNavStart', 'Start free')}
                </Link>
                <Link className={c('btn btn-secondary btn-arrow')} href="/log">
                  {tx('mwlHeroCtaLog', 'Open the logger')}
                </Link>
              </div>
              <p className={c('hero-note')}>
                {tx('landingHeroProofLoop', 'Under three minutes to your first logged set.')}{' '}
                <a href="#join" style={{ borderBottom: '1px solid var(--border-2)' }}>{tx('landingYearlyLink', 'Mission Winning Yearly — $99/year, earn back up to $90')}</a>
              </p>
              <div className={c('standards')}>
                {[
                  ['landingStatExercisesV', String(CONTENT_FLOORS.exercisePages), 'landingStatExercisesL', 'Exercises, bodyweight and minimal gear first'],
                  ['landingStatMinutesV', '3min', 'landingStatMinutesL', 'From landing to your first logged set'],
                  ['landingStatZeroV', '0', 'landingStatZeroL', 'Wearables, accounts, or app stores required'],
                  ['landingStatFreeV', '$0', 'landingStatFreeL', 'The logger, forever — not a trial'],
                ].map(([k, v, lk, l]) => (
                  <div key={k}>
                    <b className={c('num')}>{tx(k, v)}</b>
                    <span>{tx(lk, l)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className={c('demo')}>
                <LogToPlanHero staticFallback={<LogToPlanHeroFallback />} />
              </div>
              <div className={c('rail')} aria-label={tx('mwlRailLabel', 'What is inside')}>
                <a href="#how"><span className={c('rname')}>{tx('mwlRail1', 'Logger')}</span><span className={c('rrole')}>{tx('mwlRail1b', 'Sets, reps, rest')}</span></a>
                <a href="#coach"><span className={c('rname')}>{tx('mwlRail2', 'Coach')}</span><span className={c('rrole')}>{tx('mwlRail2b', 'Plan from logs')}</span></a>
                <a href="#product"><span className={c('rname')}>{tx('mwlRail3', 'History')}</span><span className={c('rrole')}>{tx('mwlRail3b', 'Every set, kept')}</span></a>
                <a href="#product"><span className={c('rname')}>{tx('mwlRail4', 'Offline')}</span><span className={c('rrole')}>{tx('mwlRail4b', 'No signal needed')}</span></a>
                <a href="#earn"><span className={c('rname')}>{tx('mwlRail5', 'Earn back')}</span><span className={c('rrole')}>{tx('mwlRail5b', 'Up to $90')}</span></a>
              </div>
            </div>
          </div>
        </section>

        <div className={c('ticker')} aria-hidden="true">
          <div className={c('ticker-track')}>
            {[...ticker, ...ticker].map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
        </div>

        <section className={c('section')} id="rules">
          <div className={c('container')}>
            <div className={c('row-between')} style={{ marginBottom: 'var(--g-lg)', alignItems: 'flex-end' }}>
              <div>
                <p className={c('idx')}>{tx('mwlRulesIdx', '02 / The rules')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('mwlRulesH2', 'Five rules. All of them about showing up.')}</h2>
              </div>
              <p className={c('meta')} style={{ maxWidth: '38ch' }}>
                {tx('mwlRulesMeta', 'The same rules decide what Mission Coach plans and what Earn It Back pays. No fine print beyond these.')}
              </p>
            </div>
            <ul className={c('rules')}>
              {rules.map(([k, h, b], i) => (
                <li key={k}>
                  <span className={c('rnum')}>{tx('mwlRuleNum', 'Rule')} 0{i + 1}</span>
                  <strong>{tx(`${k}H`, h)}</strong>
                  <p>{tx(`${k}B`, b)}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={c('section')} id="how">
          <div className={c('container')}>
            <div className={c('row-between')} style={{ marginBottom: 'var(--g-lg)', alignItems: 'flex-end' }}>
              <div>
                <p className={c('idx')}>{tx('mwlHowIdx', '03 / How it works')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('mwlHowH2', 'Log. Adapt. Earn it back.')}</h2>
              </div>
              <p className={c('meta')} style={{ maxWidth: '40ch' }}>
                {tx('mwlHowMeta', 'Three parts, one loop. Start with the free logger; add Yearly when you want your consistency to pay.')}
              </p>
            </div>
            <div className={c('grid-3')}>
              <article className={c('track')}>
                <div className={c('track-head')}>
                  <p className={c('meta-xs')}>01</p>
                  <p className={c('tgoal')}>{tx('mwlT1', 'Log')}</p>
                  <p className={c('meta')} style={{ marginTop: 5 }}>{tx('mwlT1s', 'The workout logger · free')}</p>
                </div>
                <dl className={c('track-dl')}>
                  <div><dt>{tx('mwlPrice', 'Price')}</dt><dd>$0</dd></div>
                  <div><dt>{tx('mwlNeeds', 'Needs')}</dt><dd>{tx('mwlT1n', 'Your phone or laptop')}</dd></div>
                </dl>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT1p1', 'Sets, reps, RPE and rest')}</p>
                  <p className={c('pdesc')}>{tx('mwlT1p1d', 'Fast entry built for between sets, with rest timers, supersets and PRs.')}</p>
                </div>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT1p2', 'Works offline')}</p>
                  <p className={c('pdesc')}>{tx('mwlT1p2d', 'Train in a basement or a park. Your log saves on the device.')}</p>
                </div>
                <div className={c('track-foot')}>
                  <Link className={c('btn btn-ghost btn-arrow')} href="/log">{tx('mwlT1cta', 'Open the logger')}</Link>
                </div>
              </article>
              <article className={c('track')}>
                <div className={c('track-head')}>
                  <p className={c('meta-xs')}>02</p>
                  <p className={c('tgoal')}>{tx('mwlT2', 'Adapt')}</p>
                  <p className={c('meta')} style={{ marginTop: 5 }}>{tx('mwlT2s', 'Mission Coach · AI')}</p>
                </div>
                <dl className={c('track-dl')}>
                  <div><dt>{tx('mwlInput', 'Input')}</dt><dd>{tx('mwlT2i', 'Your logs')}</dd></div>
                  <div><dt>{tx('mwlOutput', 'Output')}</dt><dd>{tx('mwlT2o', 'Next week’s plan')}</dd></div>
                </dl>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT2p1', 'A plan from what you did')}</p>
                  <p className={c('pdesc')}>{tx('mwlT2p1d', 'The coach reads your logged sets and builds the next week around them, not around an ideal you.')}</p>
                </div>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT2p2', 'Missed a day? It adjusts')}</p>
                  <p className={c('pdesc')}>{tx('mwlT2p2d', 'Skipped sessions reshape the week instead of breaking it.')}</p>
                </div>
                <div className={c('track-foot')}>
                  <Link className={c('btn btn-ghost btn-arrow')} href="/log">{tx('mwlT2cta', 'Log a set to start')}</Link>
                </div>
              </article>
              <article className={c('track')}>
                <div className={c('track-head')}>
                  <p className={c('meta-xs')}>03</p>
                  <p className={c('tgoal')}>{tx('mwlT3', 'Earn')}</p>
                  <p className={c('meta')} style={{ marginTop: 5 }}>{tx('mwlT3s', 'Yearly · $99 / year')}</p>
                </div>
                <dl className={c('track-dl')}>
                  <div><dt>{tx('mwlBack', 'Back')}</dt><dd>{tx('mwlT3b', 'Up to $90')}</dd></div>
                  <div><dt>{tx('mwlRefund', 'Refund')}</dt><dd>{tx('mwlT3r', 'Full, 14 days')}</dd></div>
                </dl>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT3p1', 'Paid for consistency')}</p>
                  <p className={c('pdesc')}>{tx('mwlT3p1d', '$50 back after 24 workouts in your first 90 days, then $40 more after 96 workouts in the year.')}</p>
                </div>
                <div className={c('prog')}>
                  <p className={c('pname')}>{tx('mwlT3p2', 'No risk to try')}</p>
                  <p className={c('pdesc')}>{tx('mwlT3p2d', 'Change your mind within 14 days of the first charge and get the full $99 back.')}</p>
                </div>
                <div className={c('track-foot')}>
                  <a className={c('btn btn-ghost btn-arrow')} href="#join">{tx('mwlT3cta', 'See Yearly')}</a>
                </div>
              </article>
            </div>
          </div>
        </section>


        <section className={c('section')} id="coach">
          <div className={c('container hero-split')}>
            <div>
              <p className={c('idx')}>{tx('mwlAdaptIdx', '04 / Mission Coach')}</p>
              <p className={c('eyebrow')} style={{ marginTop: 'var(--g-sm)' }}>{tx('landingAdaptEyebrow', 'When you miss')}</p>
              <h2>{tx('landingAdaptTitle', 'A missed day is not a failed plan')}</h2>
              <p className={c('lead')} style={{ marginTop: 'var(--g-md)' }}>
                {tx('landingAdaptBody', 'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.')}
              </p>
            </div>
            <div className={c('demo')}>
              {belowFoldReady ? <CoachAdaptDemo /> : <SkeletonBlock className="min-h-[16rem]" label="Loading coach demo" />}
            </div>
          </div>
        </section>

        <section className={c('section')} id="anywhere">
          <div className={c('container')}>
            <div className={c('row-between')} style={{ marginBottom: 'var(--g-lg)', alignItems: 'flex-end' }}>
              <div>
                <p className={c('idx')}>{tx('mwlAnyIdx', '05 / Where you train')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('landingAnywhereTitle', 'Built for one bar of signal and no rack')}</h2>
              </div>
            </div>
            <div className={c('grid-3')}>
              {[
                ['landingAnywhereOffline', tx('landingAnywhereOfflineH', 'Offline first'), tx('landingAnywhereOfflineB', 'Sets save on the device the moment you log them. Signal is optional; the log is not.'), 'Phone on a bench, mid-set', '/photo/phone-bench'],
                ['landingAnywhereGear', tx('landingAnywhereGearH', 'Your gear, not a gym'), tx('landingAnywhereGearB', 'Tell it what you have — a bar, two bands, nothing — and the week is built from that.'), 'Home rack, bar loaded', '/photo/home-rack'],
                ['landingAnywhereNoSensor', tx('landingAnywhereNoSensorH', 'No wearable'), tx('landingAnywhereNoSensorB', 'The plan comes from logged sets, so nothing needs charging for it to work.'), 'Bare wrist on a barbell', '/photo/bare-wrist'],
              ].map(([k, h, b, shot, photo]) => (
                <article key={k} className={c('story')}>
                  <GrayscalePhoto base={photo} alt={shot} caption={shot} />
                  <h3>{h}</h3>
                  <p className={c('meta')}>{b}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={c('section')} id="earn">
          <div className={c('container')}>
            <div className={c('row-between')} style={{ alignItems: 'flex-end' }}>
              <div>
                <p className={c('idx')}>{tx('mwlEarnIdx', '06 / Earn It Back')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('mwlEarnH2', 'Show up. Get paid back.')}</h2>
              </div>
              <p className={c('meta')} style={{ maxWidth: '40ch' }}>
                {tx('mwlEarnMeta', 'Two milestones, checked against your live-logged workouts. Claim by email within 30 days of reaching one.')}
              </p>
            </div>
            <div className={c('tablewrap')}>
              <table className={c('ds-table')}>
                <caption className={c('sr-only')}>{tx('mwlEarnCap', 'Earn It Back milestones')}</caption>
                <thead>
                  <tr>
                    <th scope="col">{tx('mwlEarnTh1', 'Milestone')}</th>
                    <th scope="col" className={c('num-col')}>{tx('mwlEarnTh2', 'Workouts')}</th>
                    <th scope="col" className={c('num-col')}>{tx('mwlEarnTh3', 'Window')}</th>
                    <th scope="col" className={c('num-col')}>{tx('mwlEarnTh4', 'Back to you')}</th>
                    <th scope="col">{tx('mwlEarnTh5', 'What counts')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={c('pcell')}>{tx('mwlEarnR0', 'Change of mind')}</td>
                    <td className={c('num-col')}>—</td>
                    <td className={c('num-col')}>{tx('mwlEarnR0w', '14 days')}</td>
                    <td className={c('num-col')}>$99</td>
                    <td>{tx('mwlEarnR0c', 'Full refund from the first charge, nothing to prove')}</td>
                  </tr>
                  <tr>
                    <td className={c('pcell')}>{tx('mwlEarnR1', 'First milestone')}</td>
                    <td className={c('num-col')}>24</td>
                    <td className={c('num-col')}>{tx('mwlEarnR1w', '90 days')}</td>
                    <td className={c('num-col')}>$50</td>
                    <td>{tx('mwlEarnRc', 'Logged live, 3+ sets, one per day')}</td>
                  </tr>
                  <tr>
                    <td className={c('pcell')}>{tx('mwlEarnR2', 'Second milestone')}</td>
                    <td className={c('num-col')}>96</td>
                    <td className={c('num-col')}>{tx('mwlEarnR2w', '1 year')}</td>
                    <td className={c('num-col')}>$40</td>
                    <td>{tx('mwlEarnRc', 'Logged live, 3+ sets, one per day')}</td>
                  </tr>
                  <tr>
                    <td className={c('pcell')}>{tx('mwlEarnR3', 'Most you can earn back')}</td>
                    <td className={c('num-col')}>—</td>
                    <td className={c('num-col')}>—</td>
                    <td className={c('num-col')}>$90</td>
                    <td>{tx('mwlEarnR3c', 'Yearly costs you as little as $9')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={c('expect')}>
              <p className={c('idx')}>{tx('mwlHonestIdx', 'No testimonials here, on purpose')}</p>
              <h3>{tx('mwlHonestH3', 'We would rather show you the rules than show you a stranger’s results.')}</h3>
              <p className={c('meta')} style={{ marginTop: 'var(--g-sm)', maxWidth: '82ch' }}>
                {tx('mwlHonestB', 'Results depend on your training history, sleep and how often you show up. Earn It Back exists so the price follows the effort. Full terms are on the refunds page.')}{' '}
                <Link href="/refunds" style={{ borderBottom: '1px solid var(--border-2)' }}>{tx('mwlRefundsLink', 'Read the refund terms')}</Link>
              </p>
            </div>
          </div>
        </section>

        <section className={c('section')} id="product">
          <div className={c('container')}>
            <div className={c('row-between')} style={{ marginBottom: 'var(--g-lg)', alignItems: 'flex-end' }}>
              <div>
                <p className={c('idx')}>{tx('mwlSpecIdx', '07 / The product')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('mwlSpecH2', 'Your gear. Your schedule. No wearable.')}</h2>
              </div>
              <p className={c('meta')} style={{ maxWidth: '40ch' }}>
                {tx('mwlSpecMeta', 'Built for lifting where you are: a full gym, a garage, or a pull-up bar.')}
              </p>
            </div>
            <dl className={c('spec')}>
              <div><dt>{tx('mwlSp1', 'Logger')}</dt><dd>{tx('mwlSp1d', 'Sets, reps, RPE, rest timers, supersets, PRs')}</dd></div>
              <div><dt>{tx('mwlSp2', 'Mission Coach')}</dt><dd>{tx('mwlSp2d', 'AI coach that plans next week from your logs')}</dd></div>
              <div><dt>{tx('mwlSp3', 'History')}</dt><dd>{tx('mwlSp3d', 'Every workout you log, kept')}</dd></div>
              <div><dt>{tx('mwlSp4', 'Offline')}</dt><dd>{tx('mwlSp4d', 'Logs save on your device with no signal')}</dd></div>
              <div><dt>{tx('mwlSp5', 'Hardware')}</dt><dd>{tx('mwlSp5d', 'No wearable or sensor required')}</dd></div>
              <div><dt>{tx('mwlSp6', 'Languages')}</dt><dd>{tx('mwlSp6d', 'Available in 14 languages')}</dd></div>
              <div><dt>{tx('mwlSp7', 'Devices')}</dt><dd>{tx('mwlSp7d', 'Runs in the browser on desktop and phone')}</dd></div>
              <div><dt>{tx('mwlSp8', 'Price')}</dt><dd>{tx('mwlSp8d', 'Logger free · Yearly $99 with up to $90 back')}</dd></div>
              <div><dt>{tx('mwlSp9', 'Refunds')}</dt><dd><Link href="/refunds">{tx('mwlSp9d', '14-day full refund · see terms')}</Link></dd></div>
            </dl>
          </div>
        </section>


        <section className={c('section')} id="free">
          <div className={c('container hero-split')} style={{ alignItems: 'start' }}>
            <div>
              <p className={c('idx')}>{tx('mwlFreeIdx', '08 / The free core')}</p>
              <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('landingFreeTitleLoop', 'Free is the mission, not the trial')}</h2>
              <p className={c('lead')} style={{ marginTop: 'var(--g-md)' }}>
                {tx('landingFreeBody', 'The fundamentals that make people healthier should have no price of admission — anywhere in the world. That is the founding promise, written into our vision, and it does not expire.')}
              </p>
              <dl className={c('bars')} style={{ marginTop: 'var(--g-md)' }}>
                <div><dt>{tx('landingFreeTermLogger', 'The logger')}</dt><dd>{tx('landingFreeLogger', 'Sets, reps, RPE, rest timers, supersets, PRs.')}</dd></div>
                <div><dt>{tx('landingFreeTermCoach', 'Mission Coach')}</dt><dd>{tx('landingFreeCoachLine', 'A week built from your logs, regenerated every week.')}</dd></div>
                <div><dt>{tx('landingFreeTermLibrary', `${CONTENT_FLOORS.exercisePages} exercises`)}</dt><dd>{tx('landingFreeLibrary', 'Bodyweight and minimal gear first, with form cues.')}</dd></div>
                <div><dt>{tx('landingFreeTermAccount', 'No account')}</dt><dd>{tx('landingFreeOffline', 'Works offline. Nothing to install, nothing to sign up for.')}</dd></div>
              </dl>
              <p className={c('meta')} style={{ marginTop: 'var(--g-sm)' }}>
                <Link href="/about" style={{ borderBottom: '1px solid var(--border-2)' }}>{tx('landingAboutLink', 'About Mission Winning')}</Link>
              </p>
            </div>
            <div aria-labelledby={faqId}>
              <p id={faqId} className={c('eyebrow')}>{tx('landingFaqEyebrow', 'Straight answers')}</p>
              <div className={c('faq')}>
                {FAQ.map((f) => (
                  <details key={f.qKey} open={openFaq === f.qKey}>
                    <summary
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenFaq((prev) => (prev === f.qKey ? null : f.qKey));
                      }}
                    >
                      <span>{t(f.qKey, { defaultValue: f.qDefault })}</span>
                      <span aria-hidden>+</span>
                    </summary>
                    <p>{t(f.aKey, { defaultValue: f.aDefault })}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={c('section')} id="join">
          <div className={c('container')}>
            <div className={c('hero-split')} style={{ alignItems: 'start' }}>
              <div>
                <p className={c('idx')}>{tx('mwlJoinIdx', '09 / Mission Winning Yearly')}</p>
                <h2 style={{ marginTop: 'var(--g-xs)' }}>{tx('mwlJoinH2', '$99 a year. Earn back up to $90.')}</h2>
                <p className={c('lead')} style={{ marginTop: 'var(--g-md)' }}>
                  {tx('mwlJoinLead', 'Start with the free logger. When you are ready to commit, go Yearly and let your training pay part of it back.')}
                </p>
                <ol className={c('steps')} style={{ marginTop: 'var(--g-md)' }}>
                  <li><span className={c('snum')}>01</span><span>{tx('mwlStep1', 'Log your workouts free, as long as you like.')}</span></li>
                  <li><span className={c('snum')}>02</span><span>{tx('mwlStep2', 'Go Yearly for $99. Full refund within 14 days if it is not for you.')}</span></li>
                  <li><span className={c('snum')}>03</span><span>{tx('mwlStep3', 'Hit 24 workouts in 90 days for $50 back, then 96 in the year for $40 more.')}</span></li>
                </ol>
              </div>
              <div className={c('card')}>
                <p className={c('eyebrow')}>{tx('mwlCardEyebrow', 'Yearly')}</p>
                <p className={c('mega')} style={{ fontSize: 'calc(64px * var(--ts))' }}>$99<span className={c('meta')} style={{ fontSize: 'var(--fs-sm)' }}> / {tx('mwlYear', 'year')}</span></p>
                <dl className={c('bars')} style={{ marginTop: 'var(--g-md)' }}>
                  <div><dt>{tx('mwlB1', 'After 24 workouts in 90 days')}</dt><dd>$50 {tx('mwlBack2', 'back')}</dd></div>
                  <div><dt>{tx('mwlB2', 'After 96 workouts in a year')}</dt><dd>$40 {tx('mwlBack2', 'back')}</dd></div>
                  <div><dt>{tx('mwlB3', 'Change your mind')}</dt><dd>{tx('mwlB3d', 'Full refund, 14 days')}</dd></div>
                  <div><dt>{tx('mwlB4', 'Workout logger')}</dt><dd>{tx('mwlB4d', 'Free, always')}</dd></div>
                </dl>
                <div style={{ display: 'grid', gap: 'var(--g-sm)', marginTop: 'var(--g-md)' }}>
                  <a className={c('btn btn-primary btn-block')} href={YEARLY_CHECKOUT_URL} rel="noopener">
                    {tx('mwlBuy', 'Get Yearly — $99')}
                  </a>
                  <Link className={c('btn btn-secondary btn-block')} href="/log">
                    {tx('mwlFree', 'Start free instead')}
                  </Link>
                </div>
                <p className={c('meta')} style={{ marginTop: 'var(--g-sm)', letterSpacing: '.03em' }}>
                  {tx('mwlCardFine', 'Secure checkout by Stripe. Earn It Back claims are made by email within 30 days of a milestone.')}{' '}
                  <Link href="/refunds" style={{ borderBottom: '1px solid var(--border-2)' }}>{tx('mwlRefundsLink2', 'Refund terms')}</Link>
                  {' · '}
                  <Link href="/private" style={{ borderBottom: '1px solid var(--border-2)' }}>{tx('mwlCodeLink', 'Enter an access code')}</Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className={c('poster')}>
        <div className={c('container')}>
          <h2>{tx('landingFinalCtaTitleLoop', 'One set is the whole beginning')}</h2>
          <div className={c('hero-cta')}>
            <Link className={c('btn btn-ink')} href="/welcome">{tx('landingFinalCtaButton', 'Start free — no account')}</Link>
            <Link className={c('btn btn-secondary')} href="/private">{tx('mwlCodeLink', 'Enter an access code')}</Link>
          </div>
          <p className={c('hero-note')}>{tx('landingFinalCtaFoot', 'Under three minutes to your first session. Nothing to install, nothing to pay.')}</p>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
