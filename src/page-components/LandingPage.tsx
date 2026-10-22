'use client';
/**
 * Page: / — the door first, then the forge sheet.
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Content is the product loop: log → where you train → adapt → earn back → free → start.
 * Visual skin is scoped in landingForge.module.css. No fabricated coaches,
 * member counts, or testimonials. The hero stills are the documentary frames
 * in /public/photo. Earn It Back figures match /refunds. The stat band is
 * static product facts.
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { LogToPlanHeroFallback } from '@/components/landing/LogToPlanHero';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { GrayscalePhoto } from '@/components/marketing/GrayscalePhoto';
import { isFreeBeta } from '@/lib/freeBeta';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { landingFaqKeysForSurface } from '@/i18n/landingSurface';
import { LandingDoor } from '@/page-components/LandingDoor';
import { forgeFontClass } from '@/page-components/landingForgeFonts';
import s from './landingForge.module.css';

const LogToPlanHero = dynamic(
  () => import('@/components/landing/LogToPlanHero').then((m) => m.LogToPlanHero),
  { ssr: false, loading: () => <LogToPlanHeroFallback /> }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <SkeletonBlock className="min-h-[8rem]" label="Loading coach demo" /> }
);

/** Same free-beta filter as FAQ JSON-LD — one list, two surfaces. */
const FAQ = landingFaqKeysForSurface();

export const YEARLY_CHECKOUT_URL = 'https://buy.stripe.com/aFabJ00AC0Rj6fh2eW9k400';

const FRAME_MS = 5000;

const FREE_CORE = [
  {
    termKey: 'landingFreeTermLogger',
    term: 'The logger',
    key: 'landingFreeLogger',
    defaultValue: 'Sets, reps, RPE, rest timers, supersets, PRs.',
  },
  {
    termKey: 'landingFreeTermCoach',
    term: 'Mission Coach',
    key: 'landingFreeCoachLine',
    defaultValue: 'A week built from your logs, regenerated every week.',
  },
  {
    termKey: 'landingFreeTermLibrary',
    term: `${CONTENT_FLOORS.exercisePages} exercises`,
    key: 'landingFreeLibrary',
    defaultValue: 'Bodyweight and minimal gear first, with form cues.',
  },
  {
    termKey: 'landingFreeTermAccount',
    term: 'No account',
    key: 'landingFreeOffline',
    defaultValue: 'Works offline. Nothing to install, nothing to sign up for.',
  },
] as const;

const REEL = [
  { base: '/photo/phone-bench', alt: 'Phone on a bench, mid-set' },
  { base: '/photo/home-rack', alt: 'Home rack, bar loaded' },
  { base: '/photo/bare-wrist', alt: 'Bare wrist on a barbell' },
] as const;

const COACH_CARDS = [
  {
    photo: '/photo/phone-bench',
    alt: 'Phone on a bench, mid-set',
    index: '01',
    tagKey: 'landingFreeTermCoach',
    tag: 'Mission Coach',
    titleKey: 'landingForgeCoachWeek',
    title: 'A week from your logs',
    bodyKey: 'landingFreeCoachLine',
    body: 'A week built from your logs, regenerated every week.',
  },
  {
    photo: '/photo/home-rack',
    alt: 'Home rack, bar loaded',
    index: '02',
    tagKey: 'landingAdaptEyebrow',
    tag: 'When you miss',
    titleKey: 'landingAdaptTitle',
    title: 'A missed day is not a failed plan',
    bodyKey: 'landingAdaptBody',
    body: 'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.',
  },
  {
    photo: '/photo/bare-wrist',
    alt: 'Bare wrist on a barbell',
    index: '03',
    tagKey: 'landingAnywhereNoSensorH',
    tag: 'No wearable',
    titleKey: 'landingForgeCoachLogs',
    title: 'The plan is the log',
    bodyKey: 'landingAnywhereNoSensorB',
    body: 'The plan comes from logged sets, so nothing needs charging for it to work.',
  },
  {
    photo: '/brand/log-a-set.webp',
    alt: 'The logger, mid set',
    index: '04',
    tagKey: 'landingFreeTermLogger',
    tag: 'The logger',
    titleKey: 'landingForgeCoachSets',
    title: 'Sets, reps, rest',
    bodyKey: 'landingFreeLogger',
    body: 'Sets, reps, RPE, rest timers, supersets, PRs.',
  },
] as const;

type Story = {
  image?: string;
  alt: string;
  kickerKey: string;
  kicker: string;
  titleKey: string;
  title: string;
  bodyKey: string;
  body: string;
  href?: string;
};

type Spec = readonly [labelKey: string, label: string, valueKey: string, value: string];

function Still({
  base,
  alt,
  className,
}: {
  base: string;
  alt: string;
  className?: string;
}) {
  const file = base.endsWith('.webp');
  return (
    <picture className={className}>
      {file ? null : <source srcSet={`${base}.avif`} type="image/avif" />}
      <img src={file ? base : `${base}.webp`} alt={alt} />
    </picture>
  );
}

function splitLine(line: string): { outline: string; solid: string; hot: string } {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return { outline: '', solid: '', hot: line.trim() };
  const hot = words[words.length - 1] ?? line;
  const rest = words.slice(0, -1);
  if (rest.length <= 2) return { outline: rest.join(' '), solid: '', hot };
  return { outline: rest.slice(0, 2).join(' '), solid: rest.slice(2).join(' '), hot };
}

export function LandingPage() {
  const { t } = useTranslation();
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'offline' | 'gear' | 'sensor'>('all');
  const [flipped, setFlipped] = useState<string | null>(null);
  const [sticky, setSticky] = useState(false);
  const faqListId = useId();
  const faqSummaryRefs = useRef<(HTMLElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const reelClock = useRef({ start: 0, spent: 0 });

  const focusFaq = useCallback((index: number) => {
    faqSummaryRefs.current[index]?.focus();
  }, []);

  const onFaqSummaryKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, index: number) => {
      const last = FAQ.length - 1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusFaq(Math.min(index + 1, last));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusFaq(Math.max(index - 1, 0));
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        focusFaq(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        focusFaq(last);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const key = FAQ[index]?.qKey;
        if (key) setOpenFaq((prev) => (prev === key ? null : key));
      }
    },
    [focusFaq]
  );

  useEffect(() => {
    const ready = () => setBelowFoldReady(true);
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(ready, { timeout: 1800 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(ready, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;
    const clock = reelClock.current;
    let raf = 0;
    clock.start = performance.now();
    const tick = (now: number) => {
      const elapsed = clock.spent + (now - clock.start);
      if (elapsed >= FRAME_MS) {
        clock.spent = 0;
        clock.start = now;
        setFrame((n) => (n + 1) % REEL.length);
        if (fillRef.current) fillRef.current.style.width = '0%';
      } else if (fillRef.current) {
        fillRef.current.style.width = `${(elapsed / FRAME_MS) * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clock.spent += performance.now() - clock.start;
      cancelAnimationFrame(raf);
    };
  }, [paused]);

  useEffect(() => {
    const hero = heroRef.current;
    const end = endRef.current;
    if (!hero || !end) return;
    let heroOn = true;
    let endOn = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroOn = entry.isIntersecting;
          if (entry.target === end) endOn = entry.isIntersecting;
        }
        setSticky(!heroOn && !endOn);
      },
      { threshold: 0 }
    );
    io.observe(hero);
    io.observe(end);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    root.classList.add(s.js);
    const nodes = root.querySelectorAll(`.${s.rise}, .${s.stagger}`);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(
            entry.target.classList.contains(s.stagger) ? s.staggerIn : s.riseIn
          );
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const grain = grainRef.current;
    const reel = reelRef.current;
    let target = 0;
    let current = 0;
    let raf = 0;
    const onScroll = () => {
      target = window.scrollY * 0.15;
      if (reel && window.scrollY < window.innerHeight) {
        reel.style.transform = `translate3d(0, ${window.scrollY * 0.3}px, 0)`;
      }
    };
    const tick = () => {
      current += (target - current) * 0.08;
      if (grain) grain.style.transform = `translate3d(0, ${current}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const line1 = t('landingHeroLine1', { defaultValue: 'Log a set.' });
  const line2 = t('landingHeroLine2', { defaultValue: 'Your week rewrites itself.' });
  const parts = splitLine(line2);
  const startLabel = t('landingForgeStart', { defaultValue: 'Start logging free' });
  const joinLabel = t('landingForgeJoin', { defaultValue: 'Join $99/yr' });

  const anywhere = [
    {
      id: 'offline' as const,
      k: 'landingAnywhereOffline',
      index: '01',
      badgeKey: 'landingForgeBadgeDevice',
      badge: 'On device',
      h: t('landingAnywhereOfflineH', { defaultValue: 'Offline first' }),
      b: t('landingAnywhereOfflineB', {
        defaultValue:
          'Sets save on the device the moment you log them. Signal is optional; the log is not.',
      }),
      shot: 'Phone on a bench, mid-set',
      photo: '/photo/phone-bench',
      specs: [
        ['landingForgeOffline1L', 'Signal', 'landingForgeOffline1V', 'Optional'],
        ['landingForgeOffline2L', 'Save', 'landingForgeOffline2V', 'On the device'],
        ['landingForgeOffline3L', 'Account', 'landingForgeOffline3V', 'None'],
        ['landingForgeOffline4L', 'Price', 'landingForgeOffline4V', '$0'],
      ] as const satisfies readonly Spec[],
    },
    {
      id: 'gear' as const,
      k: 'landingAnywhereGear',
      index: '02',
      badgeKey: 'landingForgeBadgeGym',
      badge: 'No gym',
      h: t('landingAnywhereGearH', { defaultValue: 'Your gear, not a gym' }),
      b: t('landingAnywhereGearB', {
        defaultValue:
          'Tell it what you have — a bar, two bands, nothing — and the week is built from that.',
      }),
      shot: 'Home rack, bar loaded',
      photo: '/photo/home-rack',
      specs: [
        ['landingForgeGear1L', 'Input', 'landingForgeGear1V', 'What you have'],
        ['landingForgeGear2L', 'Week', 'landingForgeGear2V', 'Built from that'],
        ['landingForgeGear3L', 'Gear', 'landingForgeGear3V', 'Bar, bands, or nothing'],
        ['landingForgeGear4L', 'Gym', 'landingForgeGear4V', 'Not required'],
      ] as const satisfies readonly Spec[],
    },
    {
      id: 'sensor' as const,
      k: 'landingAnywhereNoSensor',
      index: '03',
      badgeKey: 'landingForgeBadgeLogs',
      badge: 'Logs only',
      h: t('landingAnywhereNoSensorH', { defaultValue: 'No wearable' }),
      b: t('landingAnywhereNoSensorB', {
        defaultValue: 'The plan comes from logged sets, so nothing needs charging for it to work.',
      }),
      shot: 'Bare wrist on a barbell',
      photo: '/photo/bare-wrist',
      specs: [
        ['landingForgeSensor1L', 'Source', 'landingForgeSensor1V', 'Logged sets'],
        ['landingForgeSensor2L', 'Wearable', 'landingForgeSensor2V', 'None'],
        ['landingForgeSensor3L', 'Charge', 'landingForgeSensor3V', 'Nothing'],
        ['landingForgeSensor4L', 'Plan', 'landingForgeSensor4V', 'From the log'],
      ] as const satisfies readonly Spec[],
    },
  ];

  const shown = filter === 'all' ? anywhere : anywhere.filter((col) => col.id === filter);

  const stories: Story[] = [
    {
      image: '/brand/log-a-set.webp',
      alt: t('landingForgeShotAlt', { defaultValue: 'The logger, mid set' }),
      kickerKey: 'landingFreeTermLogger',
      kicker: 'The logger',
      titleKey: 'landingForgeStoryLog',
      title: 'Log a set. The week follows.',
      bodyKey: 'landingHeroSubtitleLoop',
      body: 'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever. Works offline, anywhere you train.',
    },
    {
      image: '/photo/phone-bench',
      alt: 'Phone on a bench, mid-set',
      kickerKey: 'landingForgeEarnKicker',
      kicker: '$99/yr',
      titleKey: 'landingForgeEarn50',
      title: '$50 back',
      bodyKey: 'landingForgeEarn50Body',
      body: '24 counted workouts within 90 days of the first charge. A workout counts when it is logged live with at least 3 completed sets. One per calendar day.',
    },
    {
      image: '/photo/home-rack',
      alt: 'Home rack, bar loaded',
      kickerKey: 'landingForgeEarnKicker2',
      kicker: 'Then',
      titleKey: 'landingForgeEarn40',
      title: '$40 more',
      bodyKey: 'landingForgeEarn40Body',
      body: '96 counted workouts within a year of that charge. The first 24 count toward the 96. Maximum back is $90.',
    },
    {
      image: '/photo/bare-wrist',
      alt: 'Bare wrist on a barbell',
      kickerKey: 'landingForgeRefundKicker',
      kicker: '14 days',
      titleKey: 'landingForgeRefundTitle',
      title: 'A 14-day refund',
      bodyKey: 'landingForgeRefundBody',
      body: 'A full refund within 14 days of the first charge ends the plan and any earn-back. Claims for a milestone go by email within 30 days.',
      href: '/refunds',
    },
  ];

  const ticker = [
    t('landingHeroLine1', { defaultValue: 'Log a set.' }),
    t('landingTrustOffline', { defaultValue: 'Trains offline' }),
    t('landingFreeTermAccount', { defaultValue: 'No account' }),
    t('landingAnywhereNoSensorH', { defaultValue: 'No wearable' }),
    t('landingFreeTermLogger', { defaultValue: 'The logger' }),
    t('landingFreeTermCoach', { defaultValue: 'Mission Coach' }),
    t('landingForgeEarnWord', { defaultValue: 'Earn It Back' }),
  ];

  return (
    <>
    <LandingDoor />
    <div ref={rootRef} className={`${s.root} ${forgeFontClass}`}>
      <div ref={grainRef} className={s.grain} aria-hidden />
      <MarketingNav variant="full" className={s.nav} />

      <header ref={heroRef} className={s.hero}>
        <div ref={reelRef} className={s.reel}>
          {REEL.map((shot, i) => (
            <div key={shot.base} className={i === frame ? `${s.frame} ${s.frameActive}` : s.frame}>
              <Still base={shot.base} alt={i === frame ? shot.alt : ''} />
            </div>
          ))}
        </div>
        <div className={s.heroShade} />
        <div className={s.scan} aria-hidden />
        <div className={s.heroInner}>
          <div className={s.reelHud}>
            <span className={s.rec}>
              <span className={s.recDot} aria-hidden />
              {t('landingForgeReel', { defaultValue: 'Stills' })}
            </span>
            <button
              type="button"
              className={s.hudBtn}
              aria-pressed={paused}
              onClick={() => setPaused((v) => !v)}
            >
              {paused
                ? t('landingForgePlay', { defaultValue: 'Play reel' })
                : t('landingForgePause', { defaultValue: 'Pause reel' })}
            </button>
          </div>
          <div>
            <p className={s.marker}>
              {t('landingHeroEyebrowLoop', { defaultValue: 'Free · offline · no account' })}
            </p>
            <h2 className={s.heroTitle}>
              <span className={s.line}>
                <span className={s.solid}>{line1}</span>
              </span>
              {parts.outline ? (
                <span className={s.line}>
                  <span className={s.outline}>{parts.outline}</span>
                </span>
              ) : null}
              <span className={s.line}>
                <span className={s.solid}>
                  {parts.solid ? `${parts.solid} ` : null}
                  <span className={s.hot}>{parts.hot}</span>
                </span>
              </span>
            </h2>
            <p className={s.lead}>
              {t('landingHeroSubtitleLoop', {
                defaultValue:
                  'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever. Works offline, anywhere you train.',
              })}
            </p>
          </div>
          <div className={s.heroStrip}>
            <div className={s.ctaRow}>
              <Link className={`${s.btn} ${s.btnPrimary} ${s.pulse}`} href="/log">
                {startLabel}
              </Link>
              <a className={`${s.btn} ${s.btnGhost}`} href={YEARLY_CHECKOUT_URL}>
                {joinLabel}
              </a>
            </div>
            <div className={s.reelMeta}>
              <span className={s.chapter}>{String(frame + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')}</span>
              <span className={s.progress}>
                <span ref={fillRef} />
              </span>
              <span className={s.reelName}>
                {t('landingForgeReelName', { defaultValue: 'Training stills' })}
              </span>
            </div>
          </div>
        </div>
        <div className={s.ticker} aria-hidden>
          <div className={s.tickerTrack}>
            {[...ticker, ...ticker].map((item, i) => (
              <span key={`${item}-${i}`}>
                {item}
                <i>/</i>
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className={s.statsWrap} aria-label="At a glance">
        <div className={`${s.stats} ${s.stagger}`}>
          {[
            {
              k: 'landingStatExercisesV',
              v: String(CONTENT_FLOORS.exercisePages),
              lk: 'landingStatExercisesL',
              l: 'Exercises, bodyweight and minimal gear first',
              hot: false,
            },
            {
              k: 'landingStatMinutesV',
              v: '3min',
              lk: 'landingStatMinutesL',
              l: 'From landing to your first logged set',
              hot: true,
            },
            {
              k: 'landingStatZeroV',
              v: '0',
              lk: 'landingStatZeroL',
              l: 'Wearables, accounts, or app stores required',
              hot: false,
            },
            {
              k: 'landingStatFreeV',
              v: '$0',
              lk: 'landingStatFreeL',
              l: 'The logger, forever — not a trial',
              hot: false,
            },
          ].map((stat) => (
            <div key={stat.k} className={stat.hot ? `${s.stat} ${s.statHot}` : s.stat}>
              <b>{t(stat.k, { defaultValue: stat.v })}</b>
              <span>{t(stat.lk, { defaultValue: stat.l })}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section} id="where">
        <div className={s.wrap}>
          <Reveal>
            <div className={s.intro}>
              <div className={s.introMain}>
                <p className={s.marker}>{t('landingAnywhereEyebrow', { defaultValue: 'Where you train' })}</p>
                <h2 className={s.h2}>
                  {t('landingAnywhereTitle', { defaultValue: 'Built for one bar of signal and no rack' })}
                </h2>
              </div>
              <div className={s.introSide}>
                <p className={s.body}>
                  {t('landingAnywhereOfflineB', {
                    defaultValue:
                      'Sets save on the device the moment you log them. Signal is optional; the log is not.',
                  })}
                </p>
                <div className={s.pills} role="group" aria-label={t('landingAnywhereEyebrow', { defaultValue: 'Where you train' })}>
                  {(
                    [
                      ['all', 'landingForgeFilterAll', 'All'],
                      ['offline', 'landingAnywhereOfflineH', 'Offline first'],
                      ['gear', 'landingAnywhereGearH', 'Your gear, not a gym'],
                      ['sensor', 'landingAnywhereNoSensorH', 'No wearable'],
                    ] as const
                  ).map(([id, key, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={filter === id ? `${s.pill} ${s.pillOn}` : s.pill}
                      aria-pressed={filter === id}
                      onClick={() => setFilter(id)}
                    >
                      {t(key, { defaultValue: label })}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <div className={`${s.cards3} ${s.stagger}`}>
            {shown.map((col) => (
              <article key={col.k} className={`${s.program} ${s.notch}`}>
                <div className={s.shotBox}>
                  <GrayscalePhoto
                    base={col.photo}
                    alt={col.shot}
                    caption={col.shot}
                    ratio="3:2"
                    className={s.shot}
                  />
                  <span className={s.shotShade} aria-hidden />
                  <span className={s.shotIndex}>{col.index}</span>
                  <span className={s.shotBadge}>{t(col.badgeKey, { defaultValue: col.badge })}</span>
                </div>
                <div className={s.cardBody}>
                  <h3>{col.h}</h3>
                  <p>{col.b}</p>
                  <dl className={s.spec}>
                    {col.specs.map(([labelKey, label, valueKey, value]) => (
                      <div key={labelKey}>
                        <dt>{t(labelKey, { defaultValue: label })}</dt>
                        <dd>{t(valueKey, { defaultValue: value })}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link className={s.more} href="/log">
                    <span>{startLabel}</span>
                    <i aria-hidden>→</i>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="coach" className={`${s.section} ${s.dark}`}>
        <div className={s.wrap}>
          <Reveal>
            <div className={s.intro}>
              <div className={s.introWide}>
                <p className={s.marker}>{t('landingAdaptEyebrow', { defaultValue: 'When you miss' })}</p>
                <h2 className={s.h2}>
                  {t('landingAdaptTitle', { defaultValue: 'A missed day is not a failed plan' })}
                </h2>
              </div>
              <p className={`${s.bodySm} ${s.introAside}`}>
                {t('landingAdaptBody', {
                  defaultValue:
                    'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.',
                })}
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={100}>
            <div className={s.demoSide}>
              {belowFoldReady ? (
                <CoachAdaptDemo />
              ) : (
                <SkeletonBlock className="min-h-[16rem]" label="Loading coach demo" />
              )}
            </div>
          </Reveal>
          <div className={`${s.coachGrid} ${s.stagger}`}>
            {COACH_CARDS.map((card) => (
              <button
                key={card.index}
                type="button"
                className={flipped === card.index ? `${s.flip} ${s.flipOn}` : s.flip}
                aria-expanded={flipped === card.index}
                onClick={() => setFlipped((cur) => (cur === card.index ? null : card.index))}
              >
                <span className={s.flipInner}>
                  <span className={s.face}>
                    <span className={s.facePhoto}>
                      <Still base={card.photo} alt={card.alt} />
                      <span className={s.faceIndex}>/ {card.index}</span>
                      <span className={s.faceTag}>{t(card.tagKey, { defaultValue: card.tag })}</span>
                    </span>
                    <span className={s.faceFoot}>
                      <span>
                        <h3>{t(card.titleKey, { defaultValue: card.title })}</h3>
                        <p className={s.faceRole}>{t(card.tagKey, { defaultValue: card.tag })}</p>
                      </span>
                      <span className={s.faceRow}>
                        <span>{t('landingFreeTermCoach', { defaultValue: 'Mission Coach' })}</span>
                        <b>{t('landingForgeRead', { defaultValue: 'Read' })}</b>
                      </span>
                    </span>
                  </span>
                  <span className={`${s.face} ${s.back}`}>
                    <p className={s.backKicker}>{t(card.tagKey, { defaultValue: card.tag })}</p>
                    <h3>{t(card.titleKey, { defaultValue: card.title })}</h3>
                    <p>{t(card.bodyKey, { defaultValue: card.body })}</p>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section} aria-labelledby="earn-heading">
        <div className={`${s.wrap} ${s.storiesHead}`}>
          <Reveal>
            <div className={s.intro}>
              <div className={s.introWide}>
                <p className={s.marker}>{t('landingForgeEarnWord', { defaultValue: 'Earn It Back' })}</p>
                <h2 id="earn-heading" className={s.h2}>
                  {t('landingForgeEarnTitle', { defaultValue: '$99 a year. Train it back.' })}
                </h2>
              </div>
              <div className={s.introAside}>
                <p className={s.bodySm}>
                  {t('landingForgeEarnIntro', {
                    defaultValue:
                      'Mission Winning Yearly is $99. Train and earn back up to $90: $50 after 24 workouts in 90 days, and $40 more after 96 in the paid year. A 14-day refund is separate.',
                  })}
                </p>
                <p className={s.dragHint}>
                  <i aria-hidden>↔</i>
                  {t('landingForgeDrag', { defaultValue: 'Drag, swipe, or wait' })}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
        <StoryCarousel stories={stories} t={t} />
      </section>

      <section className={s.section}>
        <div className={s.wrap}>
          <Reveal>
            <p className={s.marker}>{t('landingFreeEyebrow', { defaultValue: 'The free core' })}</p>
            <h2 className={s.h2}>
              {t('landingFreeTitleLoop', { defaultValue: 'Free is the mission, not the trial' })}
            </h2>
            <p className={s.body}>
              {t('landingFreeBody', {
                defaultValue:
                  'The fundamentals that make people healthier should have no price of admission — anywhere in the world. That is the founding promise, written into our vision, and it does not expire.',
              })}
            </p>
            <dl className={s.dl}>
              {FREE_CORE.map((row) => (
                <div key={row.key}>
                  <dt>{t(row.termKey, { defaultValue: row.term })}</dt>
                  <dd>{t(row.key, { defaultValue: row.defaultValue })}</dd>
                </div>
              ))}
            </dl>
            <p className={s.quiet}>
              {t('landingPillarsQuiet', {
                defaultValue:
                  'Fuel, Move, Mind, Track, and Learn deepen the path after Train + Coach — never the pitch.',
              })}{' '}
              <Link href="/about">{t('landingAboutLink', { defaultValue: 'About Mission Winning' })}</Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section className={`${s.section} ${s.faq}`} aria-labelledby={faqListId}>
        <div className={s.wrap}>
          <p id={faqListId} className={s.marker}>
            {t('landingFaqEyebrow', { defaultValue: 'Straight answers' })}
          </p>
          {FAQ.map((f, index) => (
            <details key={f.qKey} open={openFaq === f.qKey}>
              <summary
                ref={(el) => {
                  faqSummaryRefs.current[index] = el;
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenFaq((prev) => (prev === f.qKey ? null : f.qKey));
                }}
                onKeyDown={(e) => onFaqSummaryKeyDown(e, index)}
              >
                <span>{t(f.qKey, { defaultValue: f.qDefault })}</span>
                <span aria-hidden>+</span>
              </summary>
              <p>{t(f.aKey, { defaultValue: f.aDefault })}</p>
            </details>
          ))}
        </div>
      </section>

      <section ref={endRef} className={`${s.section} ${s.dark}`} id="start">
        <div className={s.wrap}>
          <Reveal>
            <div className={s.intro}>
              <div>
                <p className={s.marker}>
                  {t('landingFinalCtaFoot', {
                    defaultValue: 'Under three minutes to your first session. Nothing to install, nothing to pay.',
                  })}
                </p>
                <h2 className={`${s.h2} ${s.h2Close}`}>
                  {t('landingFinalCtaTitleLoop', { defaultValue: 'One set is the whole beginning' })}
                </h2>
              </div>
            </div>
          </Reveal>
          <div className={s.bookGrid}>
            <div className={s.bookMain}>
              <div className={s.booking}>
                <p className={s.bookKicker}>{t('landingFreeTermLogger', { defaultValue: 'The logger' })}</p>
                <h3 className={s.bookTitle}>{startLabel}</h3>
                <p className={s.bodySm}>
                  {t('landingHeroProofLoop', {
                    defaultValue: 'Under three minutes to your first logged set.',
                  })}
                </p>
                <div className={s.demoSide}>
                  <LogToPlanHero staticFallback={<LogToPlanHeroFallback />} />
                </div>
                <div className={s.ctaRow}>
                  <Link className={`${s.btn} ${s.btnPrimary} ${s.pulse}`} href="/log">
                    {startLabel}
                  </Link>
                  <a className={`${s.btn} ${s.btnGhost}`} href={YEARLY_CHECKOUT_URL}>
                    {joinLabel}
                  </a>
                </div>
                <p className={s.proof}>
                  {t('landingFinalCtaFoot', {
                    defaultValue: 'Under three minutes to your first session. Nothing to install, nothing to pay.',
                  })}
                </p>
              </div>
            </div>
            <div className={s.bookSide}>
              <div className={s.side}>
                <article className={s.info}>
                  <p className={s.bookKicker}>{t('landingForgeEarnKicker', { defaultValue: '$99/yr' })}</p>
                  <h3>{t('landingForgeEarn50', { defaultValue: '$50 back' })}</h3>
                  <p>{t('landingForgeEarn50Body', { defaultValue: '24 counted workouts within 90 days of the first charge. A workout counts when it is logged live with at least 3 completed sets. One per calendar day.' })}</p>
                </article>
                <article className={s.info}>
                  <p className={s.bookKicker}>{t('landingForgeEarnKicker2', { defaultValue: 'Then' })}</p>
                  <h3>{t('landingForgeEarn40', { defaultValue: '$40 more' })}</h3>
                  <p>{t('landingForgeEarn40Body', { defaultValue: '96 counted workouts within a year of that charge. The first 24 count toward the 96. Maximum back is $90.' })}</p>
                </article>
                <article className={s.info}>
                  <p className={s.bookKicker}>{t('landingForgeRefundKicker', { defaultValue: '14 days' })}</p>
                  <h3>{t('landingForgeRefundTitle', { defaultValue: 'A 14-day refund' })}</h3>
                  <p>{t('landingForgeRefundBody', { defaultValue: 'A full refund within 14 days of the first charge ends the plan and any earn-back. Claims for a milestone go by email within 30 days.' })}</p>
                  <p className={s.quiet}>
                    <Link href={isFreeBeta() ? '/notify' : '/bundle'}>
                      {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
                    </Link>
                    {' · '}
                    <Link href="/refunds">{t('landingForgeRefundsLink', { defaultValue: 'Refunds' })}</Link>
                    {' · '}
                    <Link href="/vision">{t('landingMissionLink', { defaultValue: 'Read the full vision' })}</Link>
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={s.footerShell}>
        <p className={s.wordmark} aria-hidden>
          Winning
        </p>
        <div className={s.footer}>
          <MarketingFooter />
        </div>
      </div>

      <div className={sticky ? `${s.sticky} ${s.stickyOn}` : s.sticky}>
        <div className={s.stickyBar}>
          <div className={s.stickyInner}>
            <div className={s.stickyCopy}>
              <span className={s.stickyLabel}>
                <span className={s.recDot} aria-hidden />
                {t('landingFreeTermLogger', { defaultValue: 'The logger' })}
              </span>
              <div>
                <p className={s.stickyTitle}>{t('landingForgeSticky', { defaultValue: 'Log a set. Or go Yearly.' })}</p>
                <p>
                  {t('landingHeroProofLoop', {
                    defaultValue: 'Under three minutes to your first logged set.',
                  })}
                </p>
              </div>
            </div>
            <div className={s.stickyActions}>
              <Link className={`${s.btn} ${s.btnPrimary} ${s.pulse}`} href="/log">
                {startLabel}
              </Link>
              <a className={`${s.btn} ${s.btnGhost}`} href={YEARLY_CHECKOUT_URL}>
                {joinLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function StoryCarousel({
  stories,
  t,
}: {
  stories: Story[];
  t: (key: string, opts: { defaultValue: string }) => string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const hover = useRef(false);
  const drag = useRef({
    on: false,
    startX: 0,
    startOffset: 0,
    x: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
    max: 0,
    card: 1,
  });

  const metrics = useCallback(() => {
    const track = trackRef.current;
    const card = track?.firstElementChild as HTMLElement | null;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 24;
    const cardW = card.offsetWidth + gap;
    const max = Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0));
    drag.current.card = cardW;
    drag.current.max = max;
  }, []);

  const apply = useCallback((ms: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = ms > 0 ? `transform ${ms}ms cubic-bezier(0.16, 1, 0.3, 1)` : 'none';
    track.style.transform = `translate3d(${drag.current.x}px, 0, 0)`;
  }, []);

  const go = useCallback(
    (next: number, ms = 700) => {
      metrics();
      const last = stories.length - 1;
      const i = Math.max(0, Math.min(last, next));
      let x = -i * drag.current.card;
      if (x > 0) x = 0;
      if (x < -drag.current.max) x = -drag.current.max;
      drag.current.x = x;
      setIndex(i);
      apply(ms);
    },
    [apply, metrics, stories.length]
  );

  useEffect(() => {
    metrics();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (hover.current) return;
      go(index + 1 >= stories.length ? 0 : index + 1);
    }, 4500);
    return () => window.clearInterval(id);
  }, [go, index, metrics, stories.length]);

  useEffect(() => {
    const onResize = () => {
      metrics();
      apply(0);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [apply, metrics]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    metrics();
    const d = drag.current;
    d.on = true;
    d.startX = e.clientX;
    d.startOffset = d.x;
    d.lastX = e.clientX;
    d.lastT = performance.now();
    d.v = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add(s.dragging);
    apply(0);
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    const delta = e.clientX - d.startX;
    let next = d.startOffset + delta;
    if (next > 0) next *= 0.35;
    else if (next < -d.max) next = -d.max + (next + d.max) * 0.35;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = (e.clientX - d.lastX) / dt;
    d.lastX = e.clientX;
    d.lastT = now;
    d.x = next;
    apply(0);
  };

  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    e.currentTarget.classList.remove(s.dragging);
    const projected = d.x + d.v * 300;
    const i = Math.round(Math.abs(Math.min(0, projected)) / d.card);
    go(Math.max(0, Math.min(stories.length - 1, i)));
  };

  return (
    <div
      onMouseEnter={() => {
        hover.current = true;
      }}
      onMouseLeave={() => {
        hover.current = false;
      }}
    >
      <div className={s.viewport}>
        <div
          ref={trackRef}
          className={s.track}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          {stories.map((story) => (
            <article key={story.titleKey} className={s.story}>
              <div className={s.storyImg}>
                {story.image ? <Still base={story.image} alt={story.alt} /> : null}
                <span className={s.storyKicker}>{t(story.kickerKey, { defaultValue: story.kicker })}</span>
              </div>
              <div className={s.storyBody}>
                <div className={s.storyTop}>
                  <h3>{t(story.titleKey, { defaultValue: story.title })}</h3>
                  <small>{t(story.kickerKey, { defaultValue: story.kicker })}</small>
                </div>
                <p>{t(story.bodyKey, { defaultValue: story.body })}</p>
                {story.href ? (
                  <Link href={story.href}>
                    {t('landingForgeRefundsLink', { defaultValue: 'Refunds' })}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className={s.controls}>
        <div className={s.dots}>
          {stories.map((story, i) => (
            <button
              key={story.titleKey}
              type="button"
              className={i === index ? `${s.dotBtn} ${s.dotOn}` : s.dotBtn}
              aria-label={t(story.titleKey, { defaultValue: story.title })}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div>
          <button type="button" className={s.iconBtn} aria-label={t('landingForgePrev', { defaultValue: 'Previous' })} onClick={() => go(index - 1)}>
            ←
          </button>
          <button type="button" className={s.iconBtn} aria-label={t('landingForgeNext', { defaultValue: 'Next' })} onClick={() => go(index + 1 >= stories.length ? 0 : index + 1)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
