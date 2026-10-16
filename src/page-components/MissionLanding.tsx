'use client';
/**
 * Page: / — marketing landing. Faithful port of the Z.ai chat design (chat.z.ai share 85ba5110),
 * rebranded to Mission Winning. Tailwind for layout; MissionLanding.module.css for the
 * design's custom effects (grain, Ken Burns reel, reveals, flip cards, carousel, sticky CTA).
 *
 * Honesty rules: no testimonials, no member counts, no invented stats or coaches. Every number
 * is a product fact: $0 logger, $99/yr Yearly, Earn It Back ($50 @ 24 workouts in 90 days,
 * $40 @ 96 in a year, max $90), 14-day full refund, 14 languages.
 * i18n: strings go through t() with English defaultValue — all 14 locales render, falling
 * back to English until translated. Reuses the old LandingPage's live demos, FAQ and copy keys.
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Bebas_Neue, Oswald, JetBrains_Mono } from 'next/font/google';
import { useTranslation } from 'react-i18next';
import { LogToPlanHeroFallback } from '@/components/landing/LogToPlanHero';
import { SkeletonBlock } from '@/components/ui/Skeleton';
import { CONTENT_FLOORS } from '@/lib/contentFloors';
import { landingFaqKeysForSurface } from '@/i18n/landingLocales';
import s from './MissionLanding.module.css';

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' });
const oswald = Oswald({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-oswald', display: 'swap' });
const jbmono = JetBrains_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

const LogToPlanHero = dynamic(
  () => import('@/components/landing/LogToPlanHero').then((m) => m.LogToPlanHero),
  { ssr: false, loading: () => <LogToPlanHeroFallback /> }
);
const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <SkeletonBlock className="min-h-[8rem]" label="Loading coach demo" /> }
);

export const YEARLY_CHECKOUT_URL = 'https://buy.stripe.com/aFabJ00AC0Rj6fh2eW9k400';
/** Same free-beta filter as FAQ JSON-LD (shared with the old LandingPage). */
const FAQ = landingFaqKeysForSurface();
const REEL = ['/photo/home-rack.webp', '/photo/phone-bench.webp', '/photo/bare-wrist.webp'];
const FRAME_MS = 5000;

const c = (...names: string[]) => names.map((n) => s[n] ?? n).join(' ');

export function MissionLanding() {
  const { t } = useTranslation();
  const tx = (k: string, d: string) => t(k, { defaultValue: d });
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const joinRef = useRef<HTMLElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [sticky, setSticky] = useState(false);
  const [goal, setGoal] = useState<'all' | 'strength' | 'fat_loss' | 'endurance'>('all');
  const [flipped, setFlipped] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [belowFold, setBelowFold] = useState(false);

  // Staggered reveals
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(s.inView);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Defer demos until idle
  useEffect(() => {
    const id = setTimeout(() => setBelowFold(true), 400);
    return () => clearTimeout(id);
  }, []);

  // Hero reel: frames + progress bar
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = (now - start) / FRAME_MS;
      if (progressRef.current) progressRef.current.style.width = `${Math.min(p, 1) * 100}%`;
      if (p >= 1) {
        start = now;
        setFrame((f) => (f + 1) % REEL.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Grain + hero parallax, sticky CTA
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let cur = 0;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY;
      target = y * 0.15;
      if (!reduce && reelRef.current && y < window.innerHeight) reelRef.current.style.transform = `translateY(${y * 0.3}px)`;
      const hero = heroRef.current?.getBoundingClientRect();
      const join = joinRef.current?.getBoundingClientRect();
      const pastHero = hero ? hero.bottom < 0 : false;
      const atJoin = join ? join.top < window.innerHeight && join.bottom > 0 : false;
      setSticky(pastHero && !atJoin);
    };
    const loop = () => {
      cur += (target - cur) * 0.08;
      if (grainRef.current) grainRef.current.style.transform = `translateY(${cur}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!reduce) raf = requestAnimationFrame(loop);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const paths = [
    {
      id: 'strength' as const,
      n: '01',
      tag: tx('mwlGoalStrength', 'Strength'),
      title: tx('mwlPathStrength', 'Build strength'),
      body: tx('mwlPathStrengthB', 'Log your lifts and watch the numbers climb. Mission Coach builds next week from the sets you actually did, so progressive overload stays honest.'),
      img: '/photo/home-rack.webp',
      facts: [[tx('mwlLogs', 'Logs'), tx('mwlLogsV', 'Sets · reps · RPE')], [tx('mwlTracks', 'Tracks'), tx('mwlTracksV', 'PRs + history')]],
    },
    {
      id: 'fat_loss' as const,
      n: '02',
      tag: tx('mwlGoalFat', 'Fat loss'),
      title: tx('mwlPathFat', 'Lose fat, keep muscle'),
      body: tx('mwlPathFatB', 'Keep lifting while the scale comes down. The plan protects the strength you built and adjusts when a week goes sideways.'),
      img: '/photo/phone-bench.webp',
      facts: [[tx('mwlFocus', 'Focus'), tx('mwlFocusFat', 'Keep the load')], [tx('mwlMiss', 'Missed day'), tx('mwlMissV', 'Plan adapts')]],
    },
    {
      id: 'endurance' as const,
      n: '03',
      tag: tx('mwlGoalEndurance', 'Endurance'),
      title: tx('mwlPathEndurance', 'Build your engine'),
      body: tx('mwlPathEnduranceB', 'Improve endurance and stamina with sessions built around your gear and your schedule. No wearable required.'),
      img: '/photo/bare-wrist.webp',
      facts: [[tx('mwlGear', 'Gear'), tx('mwlGearV', 'Whatever you have')], [tx('mwlSensor', 'Wearable'), tx('mwlSensorV', 'Not needed')]],
    },
  ];

  const coach = [
    { n: '01', role: tx('mwlCapPlanRole', 'Planning'), name: tx('mwlCapPlan', 'Plans from your logs'), front: tx('mwlCapPlanF', 'Your week is built from what you logged.'), back: [tx('mwlCapPlan1', 'Reads every logged set'), tx('mwlCapPlan2', 'Writes next week’s sessions'), tx('mwlCapPlan3', 'Regenerated every week')], sig: tx('mwlCapPlanSig', 'Log → plan') },
    { n: '02', role: tx('mwlCapAdaptRole', 'Adapting'), name: tx('mwlCapAdapt', 'Adapts when you miss'), front: tx('mwlCapAdaptF', 'A missed day is not a failed plan.'), back: [tx('mwlCapAdapt1', 'Reshapes what is left of the week'), tx('mwlCapAdapt2', 'No guilt, no restart'), tx('mwlCapAdapt3', 'Sleep, travel, life — handled')], sig: tx('mwlCapAdaptSig', 'Missed → reshaped') },
    { n: '03', role: tx('mwlCapGearRole', 'Equipment'), name: tx('mwlCapGear', 'Trains with your gear'), front: tx('mwlCapGearF', 'A bar, two bands, or nothing.'), back: [tx('mwlCapGear1', `${CONTENT_FLOORS.exercisePages} exercises with form cues`), tx('mwlCapGear2', 'Bodyweight and minimal gear first'), tx('mwlCapGear3', 'Home, park or full gym')], sig: tx('mwlCapGearSig', 'Your gear, not a gym') },
    { n: '04', role: tx('mwlCapOffRole', 'Anywhere'), name: tx('mwlCapOff', 'Works offline'), front: tx('mwlCapOffF', 'One bar of signal is plenty.'), back: [tx('mwlCapOff1', 'Sets save on the device instantly'), tx('mwlCapOff2', 'No wearable needed'), tx('mwlCapOff3', 'Available in 14 languages')], sig: tx('mwlCapOffSig', 'Signal optional') },
  ];

  const earn = [
    { k: 'STEP / 01', badge: '$0', title: tx('mwlE1', 'Start free'), body: tx('mwlE1b', 'The workout logger and Mission Coach are free. Log as long as you like before paying anything.'), stats: [['$0', tx('mwlE1s1', 'Logger')], ['3min', tx('mwlE1s2', 'To first set')], ['0', tx('mwlE1s3', 'Wearables')]] },
    { k: 'STEP / 02', badge: '$99', title: tx('mwlE2', 'Join Yearly'), body: tx('mwlE2b', 'Mission Winning Yearly is $99 a year. Change your mind within 14 days of the first charge for a full refund.'), stats: [['$99', tx('mwlE2s1', 'Per year')], ['14', tx('mwlE2s2', 'Day refund')], ['1', tx('mwlE2s3', 'Plan')]] },
    { k: 'STEP / 03', badge: '+$50', title: tx('mwlE3', 'First milestone'), body: tx('mwlE3b', 'Log 24 workouts within your first 90 days and claim $50 back.'), stats: [['24', tx('mwlE3s1', 'Workouts')], ['90', tx('mwlE3s2', 'Days')], ['$50', tx('mwlE3s3', 'Back')]] },
    { k: 'STEP / 04', badge: '+$40', title: tx('mwlE4', 'Second milestone'), body: tx('mwlE4b', 'Reach 96 workouts within the year and claim $40 more.'), stats: [['96', tx('mwlE4s1', 'Workouts')], ['1', tx('mwlE4s2', 'Year')], ['$40', tx('mwlE4s3', 'Back')]] },
    { k: 'STEP / 05', badge: '$90', title: tx('mwlE5', 'Up to $90 back'), body: tx('mwlE5b', 'Hit both and Yearly costs you $9. Only workouts logged live with 3+ sets count, one per day.'), stats: [['$90', tx('mwlE5s1', 'Max back')], ['3+', tx('mwlE5s2', 'Sets')], ['1/day', tx('mwlE5s3', 'Counts')]] },
    { k: 'STEP / 06', badge: tx('mwlE6badge', 'CLAIM'), title: tx('mwlE6', 'How to claim'), body: tx('mwlE6b', 'Email support within 30 days of reaching a milestone. Full terms are on the refunds page.'), stats: [['30', tx('mwlE6s1', 'Days to claim')], ['2', tx('mwlE6s2', 'Milestones')], ['1', tx('mwlE6s3', 'Email')]] },
  ];

  const ticker = [
    tx('mwlTk1', 'Log every set'), tx('mwlTk2', 'Show up'), tx('mwlTk3', 'Earn it back'),
    tx('mwlTk4', 'No wearable'), tx('mwlTk5', 'Works offline'), tx('mwlTk6', 'Free core forever'),
  ];

  return (
    <div ref={rootRef} className={`${c('root')} ${bebas.variable} ${oswald.variable} ${jbmono.variable}`}>
      <div ref={grainRef} className={c('grain')} aria-hidden />

      {/* NAV */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[var(--accent)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#000" aria-hidden><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
            </div>
            <div>
              <div className={`${c('display')} text-2xl leading-none tracking-wider`}>MISSION WINNING</div>
              <div className={`${c('mono')} mt-0.5 text-[10px] tracking-[0.3em] text-[var(--muted)]`}>{tx('mwlLogoSub', 'LOG · COACH · EARN')}</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-10 lg:flex" aria-label="Sections">
            <a href="#paths" className={c('navLink')}>{tx('mwlNavPaths', 'Goals')}</a>
            <a href="#coach" className={c('navLink')}>{tx('mwlNavCoach', 'Coach')}</a>
            <a href="#earn" className={c('navLink')}>{tx('mwlNavEarn', 'Earn It Back')}</a>
            <a href="#faq" className={c('navLink')}>{tx('mwlNavFaq', 'FAQ')}</a>
            <Link href="/private" className={c('navLink')}>{tx('mwlNavCode', 'Have a code')}</Link>
          </nav>
          <Link href="/log" className={`${c('heading')} bg-[var(--silver)] px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-white sm:px-5`}>
            {tx('mwlNavStart', 'Start free')}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[720px] w-full overflow-hidden" id="hero">
        <div ref={reelRef} className="absolute inset-0">
          {REEL.map((src, i) => (
            <div key={src} className={c('reelFrame', i === frame ? 'active' : '')}>
              <img src={src} alt="" aria-hidden />
            </div>
          ))}
        </div>
        <div className={c('heroOverlay')} />
        <div className={c('scanLine')} />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-6 pb-24 pt-32 lg:px-10">
          <div className="absolute right-6 top-28 z-20 hidden items-center gap-3 md:flex lg:right-10">
            <span className={`${c('rec')} h-2 w-2 rounded-full bg-[var(--accent)]`} />
            <span className={`${c('mono')} text-[11px] tracking-[0.2em] text-[var(--fg-dim)]`}>{tx('mwlRec', 'TRAINING · LOGGED LIVE')}</span>
          </div>
          <div className={`${c('reveal', 'inView')} max-w-5xl`}>
            <div className={`${c('marker')} mb-6`}><span>{tx('mwlHeroMarker', 'Free workout logger · AI coach')}</span></div>
            <h1 className={`${c('display')} mb-8 text-[17vw] leading-[0.85] md:text-[10vw] lg:text-[8.5vw]`}>
              <span className={c('headlineLine')}><span>{tx('mwlH1a', 'Log every set.')}</span></span>
              <span className={c('headlineLine')}><span className={c('stroke')}>{tx('mwlH1b', 'Show up.')}</span></span>
              <span className={c('headlineLine')}><span>{tx('mwlH1c', 'Earn it')} <span className="text-[var(--accent)]">{tx('mwlH1d', 'back.')}</span></span></span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[var(--fg-dim)] md:text-lg">
              {tx('landingHeroSubtitleLoop', 'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever. Works offline, anywhere you train.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/log" className={`${c('display', 'pulse')} flex items-center gap-3 bg-[var(--accent)] px-7 py-4 text-xl tracking-wider text-black transition-colors hover:bg-[var(--accent-bright)]`}>
                {tx('mwlCtaLog', 'Start logging free')} <span aria-hidden>→</span>
              </Link>
              <a href={YEARLY_CHECKOUT_URL} rel="noopener" className={`${c('display')} border border-white/25 px-7 py-4 text-xl tracking-wider transition-colors hover:border-[var(--accent)]`}>
                {tx('mwlCtaJoin', 'Join for $99/yr')}
              </a>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className={`${c('mono')} text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]`}>
              {tx('mwlHeroFoot', 'Earn back up to $90 · 14-day full refund')}{' '}
              <Link href="/refunds" className={`${c('linkU')} text-[var(--fg-dim)]`}>{tx('mwlTerms', 'Terms')}</Link>
            </div>
            <div className="flex w-full max-w-md items-center gap-6 lg:w-auto">
              <div className={`${c('mono')} text-[10px] tracking-[0.2em] text-[var(--muted)]`}>{String(frame + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')}</div>
              <div className={`${c('progress')} flex-1 lg:w-48`}><div ref={progressRef} className={c('progressFill')} /></div>
              <div className={`${c('mono')} text-[10px] tracking-[0.2em] text-[var(--accent)]`}>{tx('mwlReel', 'TRAINING REEL')}</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-white/5 bg-black/60 py-3 backdrop-blur-sm" aria-hidden>
          <div className={`${c('marquee', 'display')} text-sm tracking-[0.25em] text-[var(--silver-dim)]`}>
            {[...ticker, ...ticker].map((x, i) => (
              <span key={i} className="flex"><span className="px-8">{x.toUpperCase()}</span><span className="text-[var(--accent)]">/</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — real facts only */}
      <section className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-darker)]">
        <div className="mx-auto max-w-[1600px] px-6 py-16 lg:px-10 lg:py-20">
          <div data-reveal className={`${c('stagger')} grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4`}>
            {[
              ['$0', tx('mwlSt1', 'The logger, forever'), false],
              ['$99', tx('mwlSt2', 'Yearly, per year'), true],
              ['$90', tx('mwlSt3', 'Most you can earn back'), false],
              ['14', tx('mwlSt4', 'Languages'), false],
            ].map(([v, l, a]) => (
              <div key={String(l)} className="border-l border-[var(--border-light)] pl-6">
                <div className={`${c('display')} text-6xl tabular-nums md:text-7xl ${a ? 'text-[var(--accent)]' : ''}`}>{v}</div>
                <div className={`${c('mono')} mt-2 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]`}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATHS */}
      <section className="relative py-28 lg:py-36" id="paths">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div data-reveal className={`${c('reveal')} mb-20 grid gap-8 lg:grid-cols-12`}>
            <div className="lg:col-span-5">
              <div className={`${c('marker')} mb-6`}><span>{tx('mwlPathsMarker', '02 — Your goal')}</span></div>
              <h2 className={`${c('display')} text-6xl leading-[0.9] md:text-7xl lg:text-8xl`}>
                {tx('mwlPathsH1', 'Three paths.')}<br />
                <span className={c('stroke')}>{tx('mwlPathsH2', 'One log:')}</span><br />
                <span className="text-[var(--accent)]">{tx('mwlPathsH3', 'yours.')}</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end lg:col-span-6 lg:col-start-7">
              <p className="mb-6 text-lg leading-relaxed text-[var(--fg-dim)]">
                {tx('mwlPathsBody', 'Pick a goal when you start. Mission Coach shapes the week around it and around the gear you actually have. Mobility and general health goals are in the app too.')}
              </p>
              <div className="flex flex-wrap gap-3">
                {(['all', 'strength', 'fat_loss', 'endurance'] as const).map((g) => (
                  <button key={g} type="button" onClick={() => setGoal(g)} className={c('pill', goal === g ? 'on' : '')} aria-pressed={goal === g}>
                    {g === 'all' ? tx('mwlGoalAll', 'All goals') : paths.find((p) => p.id === g)!.tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div data-reveal className={`${c('stagger')} grid gap-6 md:grid-cols-3 lg:gap-8`}>
            {paths.map((p) => (
              <article key={p.id} className={`${c('program', 'card', 'notch')} ${goal !== 'all' && goal !== p.id ? 'opacity-30' : ''}`}>
                <div className="relative h-72 overflow-hidden">
                  <img src={p.img} alt="" className={`${c('programImg', 'noir')} h-full w-full object-cover`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
                  <div className={`${c('mono')} absolute left-4 top-4 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]`}>{p.n} / {p.tag}</div>
                </div>
                <div className="p-7">
                  <h3 className={`${c('display')} mb-3 text-4xl`}>{p.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-[var(--fg-dim)]">{p.body}</p>
                  <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[var(--border-light)] pb-6">
                    {p.facts.map(([k, v]) => (
                      <div key={k}>
                        <div className={`${c('mono')} text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]`}>{k}</div>
                        <div className={`${c('heading')} text-base uppercase`}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/log" className={`${c('heading', 'linkU')} flex items-center justify-between text-sm uppercase tracking-[0.15em]`}>
                    <span>{tx('mwlPathCta', 'Start this goal')}</span><span className="text-[var(--accent)]">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COACH — capabilities as flip cards */}
      <section className="relative border-t border-[var(--border)] bg-[var(--bg-darker)] py-28 lg:py-36" id="coach">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div data-reveal className={`${c('reveal')} mb-20 grid gap-8 lg:grid-cols-12`}>
            <div className="lg:col-span-7">
              <div className={`${c('marker')} mb-6`}><span>{tx('mwlCoachMarker', '03 — Mission Coach')}</span></div>
              <h2 className={`${c('display')} text-6xl leading-[0.9] md:text-7xl lg:text-8xl`}>
                {tx('mwlCoachH1', 'A coach that')} <span className="text-[var(--accent)]">{tx('mwlCoachH2', 'reads')}</span><br />
                {tx('mwlCoachH3', 'every set you')} <span className={c('stroke')}>{tx('mwlCoachH4', 'log.')}</span>
              </h2>
            </div>
            <div className="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
              <p className="text-base leading-relaxed text-[var(--fg-dim)]">
                {tx('mwlCoachBody', 'Mission Coach is an AI coach, not a person. It plans your week from your logs. Hover or tap a card to see what it does.')}
              </p>
            </div>
          </div>
          <div data-reveal className={`${c('stagger')} grid gap-6 sm:grid-cols-2 lg:grid-cols-4`}>
            {coach.map((k, i) => (
              <div key={k.n} className={c('flipCard', flipped === i ? 'flipped' : '')} role="button" tabIndex={0} aria-pressed={flipped === i} onClick={() => setFlipped((f) => (f === i ? null : i))} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => (f === i ? null : i)); } }}>
                <div className={c('flipInner')}>
                  <div className={`${c('flipFace', 'card')} flex flex-col`}>
                    <div className="relative h-[60%] overflow-hidden bg-[radial-gradient(ellipse_at_70%_10%,rgba(255,84,0,.25),transparent_60%),linear-gradient(180deg,#1a1a1a,#0a0a0a)]">
                      <div className={`${c('mono')} absolute left-4 top-4 text-[10px] tracking-[0.2em] text-[var(--accent)]`}>/ {k.n}</div>
                      <div className={`${c('mono')} absolute right-4 top-4 bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.15em]`}>{k.role}</div>
                      <div className={`${c('display', 'stroke')} absolute bottom-2 right-4 text-8xl leading-none`}>{k.n}</div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className={`${c('display')} text-3xl leading-none`}>{k.name}</h3>
                        <p className={`${c('heading')} mt-2 text-xs uppercase tracking-wider text-[var(--muted)]`}>{k.front}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-light)] pt-4">
                        <span className={`${c('mono')} text-[10px] tracking-[0.15em] text-[var(--muted)]`}>MISSION COACH · AI</span>
                        <span className={`${c('mono')} text-[10px] tracking-[0.15em] text-[var(--accent)]`}>{tx('mwlFlip', 'FLIP →')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`${c('flipFace', 'flipBack', 'card')} flex flex-col bg-[var(--bg-card)] p-7`}>
                    <div className={`${c('mono')} mb-4 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]`}>/ {k.name}</div>
                    <h3 className={`${c('display')} mb-5 text-2xl`}>{tx('mwlWhatItDoes', 'What it does')}</h3>
                    <ul className="mb-6 space-y-2.5 text-sm">
                      {k.back.map((b) => (
                        <li key={b} className="flex items-center gap-3"><span className="text-xs text-[var(--accent)]">●</span><span>{b}</span></li>
                      ))}
                    </ul>
                    <div className="mt-auto border-t border-[var(--border-light)] pt-5">
                      <div className={`${c('mono')} mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]`}>{tx('mwlInShort', 'In short')}</div>
                      <div className={`${c('display')} text-2xl text-[var(--accent)]`}>{k.sig}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live demos from the old landing */}
          <div data-reveal className={`${c('reveal')} mt-20 grid gap-8 lg:grid-cols-2`}>
            <div>
              <div className={`${c('mono')} mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]`}>{tx('mwlDemo1', '// Live demo · log to plan')}</div>
              <div className={c('demo')}><LogToPlanHero staticFallback={<LogToPlanHeroFallback />} /></div>
            </div>
            <div>
              <div className={`${c('mono')} mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]`}>{tx('mwlDemo2', '// Live demo · when you miss')}</div>
              <div className={c('demo')}>{belowFold ? <CoachAdaptDemo /> : <SkeletonBlock className="min-h-[16rem]" label="Loading coach demo" />}</div>
            </div>
          </div>
        </div>
      </section>

      {/* EARN IT BACK carousel */}
      <section className="relative overflow-hidden py-28 lg:py-36" id="earn">
        <div className="mx-auto mb-16 max-w-[1600px] px-6 lg:px-10">
          <div data-reveal className={`${c('reveal')} grid gap-8 lg:grid-cols-12`}>
            <div className="lg:col-span-7">
              <div className={`${c('marker')} mb-6`}><span>{tx('mwlEarnMarker', '04 — Earn It Back')}</span></div>
              <h2 className={`${c('display')} text-6xl leading-[0.9] md:text-7xl lg:text-8xl`}>
                {tx('mwlEarnH1', 'Show up.')}<br /><span className="text-[var(--accent)]">{tx('mwlEarnH2', 'Get paid')}</span> {tx('mwlEarnH3', 'back.')}
              </h2>
            </div>
            <div className="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
              <p className="mb-5 text-base leading-relaxed text-[var(--fg-dim)]">
                {tx('mwlEarnBody', 'No testimonials here, on purpose. Just the rules: the more you train, the less Yearly costs.')}{' '}
                <Link href="/refunds" className={`${c('linkU')} text-[var(--fg)]`}>{tx('mwlRefundTerms', 'Refund terms')}</Link>
              </p>
              <div className={`${c('mono')} text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]`}>{tx('mwlDrag', 'Drag · Swipe · Auto-advance')}</div>
            </div>
          </div>
        </div>
        <EarnCarousel items={earn} />
      </section>

      {/* FAQ (old landing) */}
      <section className="relative border-t border-[var(--border)] py-28" id="faq">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-6 lg:grid-cols-12 lg:px-10">
          <div data-reveal className={`${c('reveal')} lg:col-span-5`}>
            <div className={`${c('marker')} mb-6`}><span>{tx('mwlFaqMarker', '05 — Straight answers')}</span></div>
            <h2 className={`${c('display')} text-6xl leading-[0.9] md:text-7xl`}>{tx('landingFreeTitleLoop', 'Free is the mission, not the trial')}</h2>
            <p className="mt-6 max-w-md leading-relaxed text-[var(--fg-dim)]">
              {tx('landingFreeBody', 'The fundamentals that make people healthier should have no price of admission — anywhere in the world. That is the founding promise, written into our vision, and it does not expire.')}
            </p>
          </div>
          <div className={`${c('faq')} border-t border-[var(--border-light)] lg:col-span-6 lg:col-start-7`}>
            {FAQ.map((f) => (
              <details key={f.qKey} open={openFaq === f.qKey}>
                <summary onClick={(e) => { e.preventDefault(); setOpenFaq((p) => (p === f.qKey ? null : f.qKey)); }}>
                  <span className={`${c('heading')} text-base uppercase tracking-wider`}>{t(f.qKey, { defaultValue: f.qDefault })}</span>
                  <span className={`${c('plus')} text-2xl`} aria-hidden>+</span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-[var(--fg-dim)]">{t(f.aKey, { defaultValue: f.aDefault })}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section ref={joinRef} className="relative border-t border-[var(--border)] bg-[var(--bg-darker)] py-28 lg:py-36" id="join">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div data-reveal className={`${c('reveal')} mb-16`}>
            <div className={`${c('marker')} mb-6`}><span>{tx('mwlJoinMarker', '06 — Begin')}</span></div>
            <h2 className={`${c('display')} text-6xl leading-[0.9] md:text-7xl lg:text-[7rem]`}>
              {tx('mwlJoinH1', 'Stop waiting.')}<br /><span className={c('stroke')}>{tx('mwlJoinH2', 'Log')}</span> <span className="text-[var(--accent)]">{tx('mwlJoinH3', 'one set.')}</span>
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div data-reveal className={`${c('reveal')} lg:col-span-7`}>
              <div className={`${c('frame')} p-8 lg:p-12`}>
                <div className={`${c('mono')} mb-3 text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]`}>// Mission Winning Yearly</div>
                <h3 className={`${c('display')} mb-2 text-5xl`}>$99 <span className="text-2xl text-[var(--muted)]">/ {tx('mwlYear', 'year')}</span></h3>
                <p className="mb-8 text-sm text-[var(--fg-dim)]">{tx('mwlJoinBody', 'Earn back $50 after 24 workouts in 90 days and $40 more after 96 in a year. Full refund within 14 days.')}</p>
                <dl className="mb-8 space-y-2 text-sm">
                  {[
                    [tx('mwlJ1', 'Workout logger + Mission Coach'), tx('mwlJ1v', 'Free')],
                    [tx('mwlJ2', '24 workouts in 90 days'), '$50 ' + tx('mwlBack', 'back')],
                    [tx('mwlJ3', '96 workouts in a year'), '$40 ' + tx('mwlBack', 'back')],
                    [tx('mwlJ4', 'Change your mind'), tx('mwlJ4v', '14-day full refund')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-[var(--border-light)] pb-2">
                      <dt className="text-[var(--fg-dim)]">{k}</dt><dd className={`${c('mono')} text-right text-[var(--silver)]`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <a href={YEARLY_CHECKOUT_URL} rel="noopener" className={`${c('display', 'pulse')} flex w-full items-center justify-center gap-4 bg-[var(--accent)] py-5 text-2xl tracking-wider text-black transition-colors hover:bg-[var(--accent-bright)]`}>
                  {tx('mwlCtaJoin', 'Join for $99/yr')} <span aria-hidden>→</span>
                </a>
                <p className={`${c('mono')} mt-4 text-center text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]`}>
                  {tx('mwlStripe', 'Secure checkout by Stripe')} · <Link href="/refunds" className={c('linkU')}>{tx('mwlRefundTerms', 'Refund terms')}</Link>
                </p>
              </div>
            </div>
            <div data-reveal className={`${c('reveal')} space-y-6 lg:col-span-5`} style={{ ['--delay' as string]: '0.2s' }}>
              <div className={`${c('card')} p-7`}>
                <div className={`${c('mono')} mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]`}>/ {tx('mwlFreeTag', 'Free')}</div>
                <h4 className={`${c('display')} mb-3 text-2xl`}>{tx('mwlFreeH', 'Start logging free')}</h4>
                <p className="mb-4 text-sm leading-relaxed text-[var(--fg-dim)]">{tx('landingFinalCtaFoot', 'Under three minutes to your first session. Nothing to install, nothing to pay.')}</p>
                <Link href="/log" className={`${c('heading', 'linkU')} text-sm uppercase tracking-[0.15em]`}>{tx('mwlOpenLogger', 'Open the logger')} <span className="text-[var(--accent)]">→</span></Link>
              </div>
              <div className={`${c('card')} p-7`}>
                <div className={`${c('mono')} mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]`}>/ {tx('mwlCodeTag', 'Access code')}</div>
                <h4 className={`${c('display')} mb-3 text-2xl`}>{tx('mwlCodeH', 'Have an invite?')}</h4>
                <Link href="/private" className={`${c('heading', 'linkU')} text-sm uppercase tracking-[0.15em]`}>{tx('mwlCodeLink', 'Enter your code')} <span className="text-[var(--accent)]">→</span></Link>
              </div>
              <div className={`${c('card')} p-7`}>
                <div className={`${c('mono')} mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]`}>/ {tx('mwlWhereTag', 'Where')}</div>
                <h4 className={`${c('display')} mb-3 text-2xl`}>{tx('mwlWhereH', 'Anywhere you train')}</h4>
                <p className="text-sm leading-relaxed text-[var(--fg-dim)]">{tx('mwlWhereB', 'Runs in the browser on desktop and phone. Works offline. 14 languages.')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden border-t border-[var(--border)] bg-black py-16 pb-28">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-10">
          <div className={`${c('display', 'stroke')} pointer-events-none absolute bottom-0 left-0 right-0 select-none text-center text-[14vw] leading-none opacity-30`} aria-hidden>MISSION WINNING</div>
          <div className="relative mb-12 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className={`${c('display')} mb-4 text-2xl tracking-wider`}>MISSION WINNING</div>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-[var(--fg-dim)]">{tx('mwlFootAbout', 'A free workout logger with an AI coach, and a Yearly plan that pays you back for training.')}</p>
            </div>
            {[
              [tx('mwlF1', 'Train'), [['/log', tx('mwlF1a', 'Log a workout')], ['/history', tx('mwlF1b', 'History')], ['/exercises', tx('mwlF1c', 'Exercises')], ['/guide', tx('mwlF1d', 'Guide')]]],
              [tx('mwlF2', 'Yearly'), [[YEARLY_CHECKOUT_URL, tx('mwlF2a', 'Join for $99/yr')], ['#earn', tx('mwlF2b', 'Earn It Back')], ['/refunds', tx('mwlF2c', 'Refunds')], ['/private', tx('mwlF2d', 'Access code')]]],
              [tx('mwlF3', 'Company'), [['/about', tx('mwlF3a', 'About')], ['/vision', tx('mwlF3b', 'Vision')], ['/help', tx('mwlF3c', 'Help')], ['/privacy', tx('mwlF3d', 'Privacy')], ['/terms', tx('mwlF3e', 'Terms')]]],
            ].map(([h, links]) => (
              <div key={h as string} className="md:col-span-2">
                <h5 className={`${c('mono')} mb-4 text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]`}>{h as string}</h5>
                <ul className="space-y-2 text-sm">
                  {(links as string[][]).map(([href, label]) => (
                    <li key={href}>
                      {href.startsWith('/') ? (
                        <Link href={href} className={`${c('linkU')} text-[var(--fg-dim)] hover:text-[var(--fg)]`}>{label}</Link>
                      ) : (
                        <a href={href} className={`${c('linkU')} text-[var(--fg-dim)] hover:text-[var(--fg)]`}>{label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`${c('mono')} relative flex flex-col justify-between gap-4 border-t border-[var(--border)] pt-6 text-[11px] uppercase tracking-[0.15em] text-[var(--muted)] md:flex-row`}>
            <div>© 2026 Mission Winning</div>
            <div className="flex gap-6"><Link href="/privacy">{tx('mwlF3d', 'Privacy')}</Link><Link href="/terms">{tx('mwlF3e', 'Terms')}</Link><Link href="/refunds">{tx('mwlF2c', 'Refunds')}</Link></div>
          </div>
        </div>
      </footer>

      {/* STICKY CTA */}
      <div className={c('sticky', sticky ? 'visible' : '')} aria-hidden={!sticky}>
        <div className="border-t border-[var(--accent)]/30 bg-black/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex items-center gap-5">
              <div className={`${c('mono')} hidden items-center gap-2 text-[11px] tracking-[0.2em] text-[var(--accent)] sm:flex`}>
                <span className={`${c('rec')} h-2 w-2 rounded-full bg-[var(--accent)]`} /><span>{tx('mwlStickyTag', 'FREE TO START')}</span>
              </div>
              <div>
                <div className={`${c('display')} text-lg leading-none md:text-2xl`}>{tx('mwlStickyH', 'Log your first set')}</div>
                <div className={`${c('mono')} mt-1 hidden text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] sm:block`}>{tx('mwlStickySub', 'Free logger · Yearly $99 · earn back up to $90')}</div>
              </div>
            </div>
            <Link href="/log" tabIndex={sticky ? 0 : -1} className={`${c('heading', 'pulse')} flex items-center gap-3 whitespace-nowrap bg-[var(--accent)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-black transition-colors hover:bg-[var(--accent-bright)] md:px-8 md:text-sm`}>
              {tx('mwlCtaLog', 'Start logging free')} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type EarnItem = { k: string; badge: string; title: string; body: string; stats: string[][] };

/** Drag carousel with rubber-band edges, momentum snap and auto-advance (port of StoriesCarousel). */
function EarnCarousel({ items }: { items: EarnItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const st = useRef({ down: false, startX: 0, startOff: 0, x: 0, v: 0, lastX: 0, lastT: 0, cardW: 0, max: 0, pause: false });
  const [idx, setIdx] = useState(0);

  const measure = useCallback(() => {
    const tr = trackRef.current;
    if (!tr || !tr.children.length) return;
    const cs = getComputedStyle(tr);
    const gap = parseFloat(cs.columnGap || cs.gap) || 24;
    const pad = parseFloat(cs.paddingLeft) || 32;
    const first = tr.children[0] as HTMLElement;
    st.current.cardW = first.offsetWidth + gap;
    st.current.max = Math.max(0, items.length * st.current.cardW - gap + pad * 2 - (tr.parentElement?.offsetWidth ?? 0));
  }, [items.length]);

  const apply = (ms: number) => {
    const tr = trackRef.current;
    if (!tr) return;
    tr.style.transition = ms ? `transform ${ms}ms cubic-bezier(0.16,1,0.3,1)` : 'none';
    tr.style.transform = `translateX(${st.current.x}px)`;
  };

  const goTo = useCallback((i: number) => {
    const n = Math.max(0, Math.min(items.length - 1, i));
    st.current.x = Math.max(-st.current.max, Math.min(0, -n * st.current.cardW));
    setIdx(n);
    apply(700);
  }, [items.length]);

  useEffect(() => {
    measure();
    const onR = () => { measure(); goTo(idx); };
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, [measure, goTo, idx]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (st.current.pause || st.current.down) return;
      setIdx((i) => {
        const n = i + 1 >= items.length ? 0 : i + 1;
        st.current.x = Math.max(-st.current.max, Math.min(0, -n * st.current.cardW));
        apply(700);
        return n;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [items.length]);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const r = st.current;
    r.down = true; r.startX = e.clientX; r.startOff = r.x; r.lastX = e.clientX; r.lastT = Date.now(); r.v = 0;
    trackRef.current?.classList.add(s.dragging);
    trackRef.current?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = st.current;
    if (!r.down) return;
    let nx = r.startOff + (e.clientX - r.startX);
    if (nx > 0) nx *= 0.35;
    else if (nx < -r.max) nx = -r.max + (nx + r.max) * 0.35;
    const now = Date.now();
    if (now - r.lastT > 0) r.v = (e.clientX - r.lastX) / (now - r.lastT);
    r.lastX = e.clientX; r.lastT = now; r.x = nx;
    apply(0);
  };
  const onUp = () => {
    const r = st.current;
    if (!r.down) return;
    r.down = false;
    trackRef.current?.classList.remove(s.dragging);
    const target = r.x + r.v * 300;
    goTo(Math.round(Math.abs(Math.min(0, target)) / (r.cardW || 1)));
  };

  return (
    <div className="relative overflow-hidden">
      <div
        ref={trackRef}
        className={s.track}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onMouseEnter={() => (st.current.pause = true)}
        onMouseLeave={() => (st.current.pause = false)}
      >
        {items.map((it) => (
          <article key={it.k} className={s.story}>
            <div className="relative h-40 overflow-hidden bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,84,0,.22),transparent_60%),linear-gradient(180deg,#171717,#0d0d0d)]">
              <div className={`${s.mono} absolute left-4 top-4 text-[10px] tracking-[0.2em] text-[var(--accent)]`}>{it.k}</div>
              <div className={`${s.display} ${s.stroke} absolute bottom-1 left-4 text-7xl leading-none`}>{it.badge}</div>
              <div className={`${s.mono} absolute bottom-4 right-4 bg-[var(--accent)] px-2 py-1 text-[10px] tracking-[0.15em] text-black`}>{it.badge}</div>
            </div>
            <div className="p-6">
              <h3 className={`${s.display} mb-4 text-2xl`}>{it.title}</h3>
              <p className="mb-5 min-h-[4.5rem] text-sm leading-relaxed text-[var(--fg-dim)]">{it.body}</p>
              <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-light)] pt-4">
                {it.stats.map(([v, l], j) => (
                  <div key={l}>
                    <div className={`${s.display} text-xl ${j === 0 ? 'text-[var(--accent)]' : ''}`}>{v}</div>
                    <div className={`${s.mono} text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]`}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1600px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2">
          {items.map((it, i) => (
            <button key={it.k} type="button" aria-label={`Go to ${it.title}`} onClick={() => goTo(i)} className="h-[2px] transition-all duration-300" style={{ width: i === idx ? 32 : 8, background: i === idx ? 'var(--accent)' : 'var(--border-light)' }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Previous" onClick={() => goTo(idx - 1)} className="flex h-11 w-11 items-center justify-center border border-[var(--border-light)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black">←</button>
          <button type="button" aria-label="Next" onClick={() => goTo(idx + 1)} className="flex h-11 w-11 items-center justify-center border border-[var(--border-light)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black">→</button>
        </div>
      </div>
    </div>
  );
}
