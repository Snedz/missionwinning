'use client';
/**
 * Page: / — marketing landing
 * See: app/INDEX.md, src/page-components/INDEX.md
 *
 * Structure is the product loop, in order: log → adapt → anywhere → free → start.
 * That sequence is real, so the page can be read top to bottom as one argument.
 *
 * Type comes from the briefing system in src/index.css (`.eyebrow` / `.display-hero`
 * / `.briefing-rule`) — the same system /press, /bundle, /about and /vision use.
 * This page was previously the only one in the repo setting ad-hoc type instead, so
 * its hero rendered in Inter rather than the brand's Barlow Condensed.
 *
 * No fabricated proof: brand-guidelines.md § Voice rules out testimonials and
 * "we're live" claims while the beta is private, so belief has to come from the
 * product doing the thing (the hero) and facts that are checkable (the library).
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { LogToPlanHeroFallback } from '@/components/landing/LogToPlanHero';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { GrayscalePhoto } from '@/components/marketing/GrayscalePhoto';
import { ArrowRight } from 'lucide-react';
import { isFreeBeta } from '@/lib/freeBeta';
import { landingFaqKeysForSurface } from '@/i18n/landingLocales';

const LogToPlanHero = dynamic(
  () => import('@/components/landing/LogToPlanHero').then((m) => m.LogToPlanHero),
  { ssr: false, loading: () => <LogToPlanHeroFallback /> }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <div className="min-h-[8rem]" aria-hidden /> }
);

/** Same free-beta filter as FAQ JSON-LD — one list, two surfaces. */
const FAQ = landingFaqKeysForSurface();

/**
 * What the free core actually is. Each line is checkable — no aspirations, no
 * traction claims (hard rule 3). Set as a definition list, not a checkmark farm.
 */
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
    term: '217 exercises',
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

export function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  /** Defer below-fold demos until idle so first paint stays lean (Lighthouse ≥90). */
  const [belowFoldReady, setBelowFoldReady] = useState(false);
  /**
   * D13 — exclusive-open FAQ. Native `<details>` allows every panel open at once;
   * one open at a time matches the reference accordion without redesigning bands.
   * Controlled `open` + prevented summary click keeps keyboard (Enter/Space) and
   * pointer on the same path.
   */
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const faqListId = useId();
  const faqSummaryRefs = useRef<(HTMLElement | null)[]>([]);

  const focusFaq = useCallback((index: number) => {
    const el = faqSummaryRefs.current[index];
    el?.focus();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="full" />

      {/* ── LOG ─────────────────────────────────────────────────────────
          The thesis, stated then performed. Flat paper: type and the 2px rule
          are the field — the poster close at the bottom is the page's one red. */}
      <header className="section-seam">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 sm:gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="page-enter">
            <p className="eyebrow-live mb-5">
              {t('landingHeroEyebrowLoop', { defaultValue: 'Free · offline · no account' })}
            </p>
            <h1 className="display-hero mb-6 max-w-[18ch] text-balance text-foreground">
              {t('landingHeroLine1', { defaultValue: 'Log a set.' })}
              <br />
              {t('landingHeroLine2', { defaultValue: 'Your week rewrites itself.' })}
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('landingHeroSubtitleLoop', {
                defaultValue:
                  'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no account — and the logger is free forever. Works offline, anywhere you train.',
              })}
            </p>
            <button
              type="button"
              className="primary-action max-w-sm sm:w-auto sm:max-w-none sm:px-10"
              onClick={() => router.push('/welcome')}
            >
              {t('landingNavStart', { defaultValue: 'Start free' })}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t('landingHeroProofLoop', {
                defaultValue: 'Under three minutes to your first logged set.',
              })}
            </p>
          </div>

          <div className="journey-enter lg:pt-2">
            <LogToPlanHero staticFallback={<LogToPlanHeroFallback />} />
          </div>
        </div>
      </header>

      {/* ── CHECKABLE FACTS ─────────────────────────────────────────────
          The stat row from the handoff: figures a visitor can verify, set in
          tabular numerals on 2px rules. No traction claims (hard rule 3).

          Flush grid (no vertical padding): do NOT use `section-seam` as the only
          bottom rule — that paints a background image children cover. Use a real
          `border-b-2` so the line stays visible under opaque `bg-background` cells.
          Internal gutters are `gap-0.5` (2px), not `gap-px` (1px). */}
      <section className="border-b-2 border-border" aria-label="At a glance">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-0.5 bg-border sm:grid-cols-4">
          {[
            {
              k: 'landingStatExercisesV',
              v: '217',
              lk: 'landingStatExercisesL',
              l: 'Exercises, bodyweight and minimal gear first',
            },
            {
              k: 'landingStatMinutesV',
              v: '3min',
              lk: 'landingStatMinutesL',
              l: 'From landing to your first logged set',
            },
            {
              k: 'landingStatZeroV',
              v: '0',
              lk: 'landingStatZeroL',
              l: 'Wearables, accounts, or app stores required',
            },
            {
              k: 'landingStatFreeV',
              v: '$0',
              lk: 'landingStatFreeL',
              l: 'The logger, forever — not a trial',
            },
          ].map((s) => (
            <div key={s.k} className="bg-background px-5 py-6">
              <p className="display-mega text-poster">{t(s.k, { defaultValue: s.v })}</p>
              <p className="mt-2 text-sm leading-snug text-muted-foreground">
                {t(s.lk, { defaultValue: s.l })}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADAPT ───────────────────────────────────────────────────── */}
      <section id="coach" className="section-seam">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <Reveal>
            <p className="section-index mb-2">02</p>
            <p className="eyebrow mb-4">{t('landingAdaptEyebrow', { defaultValue: 'When you miss' })}</p>
            <h2 className="display-section mb-6 max-w-[24ch] text-balance text-foreground">
              {t('landingAdaptTitle', { defaultValue: 'A missed day is not a failed plan' })}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {t('landingAdaptBody', {
                defaultValue:
                  'Sleep badly, travel, lose a week — Mission Coach reshapes what is left instead of leaving you behind a schedule you already broke.',
              })}
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mx-auto w-full max-w-md">
              {belowFoldReady ? <CoachAdaptDemo /> : <div className="min-h-[16rem]" aria-hidden />}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ANYWHERE ────────────────────────────────────────────────── */}
      <section className="section-seam">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:py-20">
          <Reveal>
            <p className="section-index mb-2">03</p>
            <p className="eyebrow mb-4">{t('landingAnywhereEyebrow', { defaultValue: 'Where you train' })}</p>
            <h2 className="display-section mb-6 max-w-[26ch] text-balance text-foreground">
              {t('landingAnywhereTitle', {
                defaultValue: 'Built for one bar of signal and no rack',
              })}
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {/* The handoff's three documentary photos live here — the section
                  that is literally about where you train. They ship as empty
                  slots: the rule is real grayscale photography or nothing, so a
                  neutral block that says what belongs in it beats a stand-in
                  image that has to be found and removed later. The `shot`
                  string is the brief; add /public/photo/<name>.{avif,webp} and
                  pass `base` to fill one. */}
              {[
                {
                  k: 'landingAnywhereOffline',
                  h: t('landingAnywhereOfflineH', { defaultValue: 'Offline first' }),
                  b: t('landingAnywhereOfflineB', {
                    defaultValue:
                      'Sets save on the device the moment you log them. Signal is optional; the log is not.',
                  }),
                  shot: 'Phone on a bench, mid-set',
                  photo: '/photo/phone-bench',
                },
                {
                  k: 'landingAnywhereGear',
                  h: t('landingAnywhereGearH', { defaultValue: 'Your gear, not a gym' }),
                  b: t('landingAnywhereGearB', {
                    defaultValue:
                      'Tell it what you have — a bar, two bands, nothing — and the week is built from that.',
                  }),
                  shot: 'Home rack, bar loaded',
                  photo: '/photo/home-rack',
                },
                {
                  k: 'landingAnywhereNoSensor',
                  h: t('landingAnywhereNoSensorH', { defaultValue: 'No wearable' }),
                  b: t('landingAnywhereNoSensorB', {
                    defaultValue:
                      'The plan comes from logged sets, so nothing needs charging for it to work.',
                  }),
                  shot: 'Bare wrist on a barbell',
                  photo: '/photo/bare-wrist',
                },
              ].map((col) => (
                <div key={col.k}>
                  <GrayscalePhoto
                    base={col.photo}
                    alt={col.shot}
                    caption={col.shot}
                    className="mb-4"
                  />
                  <h3 className="mb-2 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
                    {col.h}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{col.b}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FREE ────────────────────────────────────────────────────── */}
      <section className="section-seam">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <Reveal>
            <p className="section-index mb-2">04</p>
            <p className="eyebrow mb-4">{t('landingFreeEyebrow', { defaultValue: 'The free core' })}</p>
            <h2 className="display-section mb-6 max-w-[24ch] text-balance text-foreground">
              {t('landingFreeTitleLoop', { defaultValue: 'Free is the mission, not the trial' })}
            </h2>
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
              {t('landingFreeBody', {
                defaultValue: isFreeBeta()
                  ? 'Logging and Mission Coach plans from your logs stay free — no account required. Open beta means full tools while we grow with you.'
                  : 'Logging stays free forever. Super Bundle adds Coach depth when you want it — it never gates the logger.',
              })}
            </p>

            <dl className="divide-y-2 divide-border border-y-2 border-border">
              {FREE_CORE.map((row) => (
                <div key={row.key} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                    {t(row.termKey, { defaultValue: row.term })}
                  </dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {t(row.key, { defaultValue: row.defaultValue })}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
              {t('landingPillarsQuiet', {
                defaultValue:
                  'Fuel, Move, Mind, Track, and Learn deepen the path after Train + Coach — never the pitch.',
              })}{' '}
              <Link href="/about" className="underline underline-offset-4 hover:text-foreground">
                {t('landingAboutLink', { defaultValue: 'About Mission Winning' })}
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── QUESTIONS ───────────────────────────────────────────────── */}
      <section className="section-seam" aria-labelledby={faqListId}>
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <p id={faqListId} className="eyebrow mb-8">
            {t('landingFaqEyebrow', { defaultValue: 'Straight answers' })}
          </p>
          <div className="divide-y-2 divide-border border-y-2 border-border">
            {FAQ.map((f, index) => (
              <details
                key={f.qKey}
                className="group py-4 first:pt-0"
                open={openFaq === f.qKey}
              >
                <summary
                  ref={(el) => {
                    faqSummaryRefs.current[index] = el;
                  }}
                  className="flex min-h-[44px] cursor-pointer list-none items-center text-sm font-semibold marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenFaq((prev) => (prev === f.qKey ? null : f.qKey));
                  }}
                  onKeyDown={(e) => onFaqSummaryKeyDown(e, index)}
                >
                  <span className="flex items-center justify-between gap-4">
                    {t(f.qKey, { defaultValue: f.qDefault })}
                    <span
                      className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(f.aKey, { defaultValue: f.aDefault })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── START — the poster close, the page's ONE red field ────────── */}
      <section className="poster-close">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:py-24">
          <Reveal>
            <h2 className="display-hero mb-8 max-w-[18ch] text-balance">
              {t('landingFinalCtaTitleLoop', { defaultValue: 'One set is the whole beginning' })}
            </h2>
            <button
              type="button"
              className="primary-action max-w-sm sm:w-auto sm:max-w-none sm:px-12"
              onClick={() => router.push('/welcome')}
            >
              {t('landingFinalCtaButton', { defaultValue: 'Start free — no account' })}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-sm text-background">
              {t('landingFinalCtaFoot', {
                defaultValue:
                  'Under three minutes to your first session. Nothing to install, nothing to pay.',
              })}
            </p>
            <p className="mt-6 text-sm">
              {!isFreeBeta() && (
                <>
                  <Link href="/bundle" className="underline underline-offset-4">
                    {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
                  </Link>
                  {' · '}
                </>
              )}
              <Link href="/vision" className="underline underline-offset-4">
                {t('landingMissionLink', { defaultValue: 'Read the full vision' })}
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
