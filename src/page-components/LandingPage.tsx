'use client';
/**
 * Page: / — marketing landing
 * See: app/INDEX.md, src/page-components/INDEX.md
 * D4 beta composure: ~5–6 bands, Train+Coach wedge only.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { LANDING_FAQ_KEYS } from '@/i18n/landingLocales';
import { HeroDemoFallback } from '@/components/landing/HeroDemo';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { ArrowRight, Check } from 'lucide-react';
import { isFreeBeta } from '@/lib/freeBeta';

const HeroDemo = dynamic(
  () => import('@/components/landing/HeroDemo').then((m) => m.HeroDemo),
  { ssr: false, loading: () => <HeroDemoFallback /> }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <div className="min-h-[8rem]" aria-hidden /> }
);

const FAQ = isFreeBeta()
  ? LANDING_FAQ_KEYS.filter((f) => f.qKey !== 'landingFaqBundleQ')
  : LANDING_FAQ_KEYS;

const FREE_MANIFEST_KEYS = [
  {
    key: 'landingFreeLogger',
    defaultValue: 'Full workout logger — sets, reps, RPE, rest timers',
  },
  {
    key: 'landingFreeLibrary',
    defaultValue: '217-exercise library — bodyweight and minimal gear first',
  },
  {
    key: 'landingFreeOffline',
    defaultValue: 'Offline PWA — no store, no fees, no account required',
  },
  {
    key: 'landingFreeWinScore',
    defaultValue: 'A simple weekly picture from what you actually trained',
  },
] as const;

export function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  /** Defer interactive demos until idle so first paint stays lean (Lighthouse). */
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

      {/* 1 · Hero — quieter field, one soft accent (less AI-SaaS theater) */}
      <header className="hero-field hero-field--orient section-seam relative overflow-hidden">
        <div className="hero-orb hero-orb--primary opacity-40" aria-hidden />
        <div className="hero-orient-grid relative z-[1] mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-14 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div className="hero-copy page-enter">
            <p className="mb-4 text-xs font-medium tracking-wide text-primary">
              Mission Winning
            </p>
            <h1 className="mb-6 text-[2.5rem] font-semibold tracking-tight leading-[1.1] sm:text-5xl lg:text-[3.25rem]">
              {t('landingHeroTitle1', { defaultValue: 'Train anywhere.' })}
              <br />
              <span className="text-primary">{t('landingHeroTitle2', { defaultValue: 'Win daily.' })}</span>
            </h1>
            <p className="hero-subtitle mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t('landingHeroSubtitle', {
                defaultValue:
                  'A free offline workout logger and a coach that builds the week from what you actually logged — no wearable required.',
              })}
            </p>
            <button
              type="button"
              className="primary-action max-w-sm sm:max-w-none sm:w-auto sm:px-10"
              onClick={() => router.push('/welcome')}
            >
              {t('landingNavStart', { defaultValue: 'Start free' })}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t('landingHeroProof', {
                defaultValue: 'Log a set. Coach shapes the week. That is the loop.',
              })}
            </p>
          </div>

          <div className="hero-demo-slot journey-enter">
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm">
              <HeroDemo staticFallback={<HeroDemoFallback />} />
            </div>
          </div>
        </div>
      </header>

      {/* 2 · Coach proof */}
      <section id="coach" className="section-seam relative overflow-hidden bg-muted/15">
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <Reveal>
            <p className="section-index mb-3">02 · Coach</p>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight leading-tight sm:text-3xl">
              {t('landingCoachDemoTitle', {
                defaultValue: 'Plans that adapt when life happens',
              })}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {t('landingCoachDemoBody', {
                defaultValue:
                  'Miss a day, sleep poorly, or crush a PR — Mission Coach reshapes the week from your log, not a spreadsheet.',
              })}
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mx-auto w-full max-w-md rounded-2xl border border-border/40 bg-card/60 p-3 sm:p-4">
              {belowFoldReady ? (
                <CoachAdaptDemo />
              ) : (
                <div className="min-h-[8rem]" aria-hidden />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 · Free promise (list only — no card farm) */}
      <section className="section-seam relative overflow-hidden">
        <div className="relative z-[1] mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <Reveal>
            <p className="mb-4 text-xs font-medium tracking-wide text-muted-foreground">
              {t('landingFreeEyebrow', { defaultValue: 'The free core' })}
            </p>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight leading-tight sm:text-3xl">
              {t('landingFreeTitle1', { defaultValue: 'Free is the mission,' })}
              <br />
              {t('landingFreeTitle2', { defaultValue: 'not the trial.' })}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {t('landingFreeBody', {
                defaultValue: isFreeBeta()
                  ? 'Logging and Mission Coach plans from your logs stay free — no account required. Open beta means full tools while we grow with you.'
                  : 'Logging stays free forever. Super Bundle adds Coach depth when you want it — it never gates the logger.',
              })}
            </p>
            <ul className="mt-6 space-y-2.5">
              {FREE_MANIFEST_KEYS.map((item) => (
                <li key={item.key} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t(item.key, { defaultValue: item.defaultValue })}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
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

      {/* 4 · FAQ */}
      <section className="section-seam">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <p className="mb-8 text-xs font-medium tracking-wide text-muted-foreground">
            {t('landingFaqEyebrow', { defaultValue: 'Straight answers' })}
          </p>
          <div className="space-y-0">
            {FAQ.map((f, i) => (
              <details
                key={f.qKey}
                className="group section-seam px-1 py-4 first:pt-0 last:border-0 last:bg-none"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-start gap-3">
                      <span className="section-index mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {t(f.qKey, { defaultValue: f.qDefault })}
                    </span>
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 pl-10 text-sm leading-relaxed text-muted-foreground">
                  {t(f.aKey, { defaultValue: f.aDefault })}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Final CTA (sole conversion block) */}
      <section className="hero-field relative overflow-hidden border-t border-border/30">
        <div className="hero-orb hero-orb--primary opacity-25" aria-hidden />
        <div className="relative z-[1] mx-auto max-w-3xl px-5 py-20 text-center lg:py-28">
          <Reveal>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight leading-tight sm:text-3xl">
              {t('landingFinalCtaTitle', {
                defaultValue: 'The path starts with one workout.',
              })}
            </h2>
            <button
              type="button"
              className="primary-action mx-auto max-w-sm sm:max-w-none sm:w-auto sm:px-12"
              onClick={() => router.push('/welcome')}
            >
              {t('landingFinalCtaButton', {
                defaultValue: 'Start free — no account',
              })}
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
