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

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { LANDING_FAQ_KEYS } from '@/i18n/landingLocales';
import { LogToPlanHeroFallback } from '@/components/landing/LogToPlanHero';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { ArtPicture } from '@/components/marketing/ArtPicture';
import { ArrowRight } from 'lucide-react';
import { isFreeBeta } from '@/lib/freeBeta';

const LogToPlanHero = dynamic(
  () => import('@/components/landing/LogToPlanHero').then((m) => m.LogToPlanHero),
  { ssr: false, loading: () => <LogToPlanHeroFallback /> }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <div className="min-h-[8rem]" aria-hidden /> }
);

const FAQ = isFreeBeta()
  ? LANDING_FAQ_KEYS.filter((f) => f.qKey !== 'landingFaqBundleQ')
  : LANDING_FAQ_KEYS;

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
          The thesis, stated then performed. No gradient orbs: the field is
          type and rule, which is what distinguishes this from every other
          dark landing page with one green accent. */}
      <header className="section-seam relative overflow-hidden">
        {/* Existing brand asset, same as /press. Real texture beats a gradient orb,
            and it keeps the type dominant at this opacity. */}
        <ArtPicture
          base="/art/hero-field"
          fill
          priority
          className="object-cover opacity-25"
        />
        <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 sm:gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-20">
          <div className="page-enter">
            <p className="eyebrow mb-5">
              {t('landingHeroEyebrowLoop', { defaultValue: 'Free · offline · no account' })}
            </p>
            <h1 className="display-hero mb-6 max-w-[18ch] text-balance text-foreground">
              {t('landingHeroLine1', { defaultValue: 'Log a set.' })}
              <br />
              <span className="text-primary">
                {t('landingHeroLine2', { defaultValue: 'Your week rewrites itself.' })}
              </span>
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('landingHeroSubtitleLoop', {
                defaultValue:
                  'A workout logger that turns what you actually did into next week’s plan. No wearable, no gym, no subscription to start.',
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

      {/* ── ADAPT ───────────────────────────────────────────────────── */}
      <section id="coach" className="section-seam bg-muted/[0.07]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <Reveal>
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
            <p className="eyebrow mb-4">{t('landingAnywhereEyebrow', { defaultValue: 'Where you train' })}</p>
            <h2 className="display-section mb-6 max-w-[26ch] text-balance text-foreground">
              {t('landingAnywhereTitle', {
                defaultValue: 'Built for one bar of signal and no rack',
              })}
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  k: 'landingAnywhereOffline',
                  h: t('landingAnywhereOfflineH', { defaultValue: 'Offline first' }),
                  b: t('landingAnywhereOfflineB', {
                    defaultValue:
                      'Sets save on the device the moment you log them. Signal is optional; the log is not.',
                  }),
                },
                {
                  k: 'landingAnywhereGear',
                  h: t('landingAnywhereGearH', { defaultValue: 'Your gear, not a gym' }),
                  b: t('landingAnywhereGearB', {
                    defaultValue:
                      'Tell it what you have — a bar, two bands, nothing — and the week is built from that.',
                  }),
                },
                {
                  k: 'landingAnywhereNoSensor',
                  h: t('landingAnywhereNoSensorH', { defaultValue: 'No wearable' }),
                  b: t('landingAnywhereNoSensorB', {
                    defaultValue:
                      'The plan comes from logged sets, so nothing needs charging for it to work.',
                  }),
                },
              ].map((col) => (
                <div key={col.k}>
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
      <section className="section-seam bg-muted/[0.07]">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <Reveal>
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

            <dl className="divide-y divide-border/40">
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
      <section className="section-seam">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <p className="eyebrow mb-8">{t('landingFaqEyebrow', { defaultValue: 'Straight answers' })}</p>
          <div className="divide-y divide-border/40">
            {FAQ.map((f) => (
              <details key={f.qKey} className="group py-4 first:pt-0">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {t(f.qKey, { defaultValue: f.qDefault })}
                    <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
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

      {/* ── START ───────────────────────────────────────────────────── */}
      <section className="border-t border-border/30">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:py-24">
          <Reveal>
            <h2 className="display-section mb-6 max-w-[24ch] text-balance text-foreground">
              {t('landingFinalCtaTitleLoop', { defaultValue: 'One set is the whole beginning' })}
            </h2>
            <button
              type="button"
              className="primary-action mx-auto max-w-sm sm:w-auto sm:max-w-none sm:px-12"
              onClick={() => router.push('/welcome')}
            >
              {t('landingFinalCtaButton', { defaultValue: 'Start free — no account' })}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 text-xs text-muted-foreground">
              {t('landingFinalCtaFoot', {
                defaultValue:
                  'Under three minutes to your first session. Nothing to install, nothing to pay.',
              })}
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              {!isFreeBeta() && (
                <>
                  <Link href="/bundle" className="underline underline-offset-4 hover:text-foreground">
                    {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
                  </Link>
                  {' · '}
                </>
              )}
              <Link href="/vision" className="underline underline-offset-4 hover:text-foreground">
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
