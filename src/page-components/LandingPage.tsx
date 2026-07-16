'use client';
/**
 * Page: / — marketing landing
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { BUNDLE_PILLARS } from '@/lib/payments';
import { LANDING_FAQ_KEYS } from '@/i18n/landingLocales';
import { HeroDemoFallback } from '@/components/landing/HeroDemo';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { StatBand } from '@/components/marketing/StatBand';
import { BundleTeaserCard } from '@/components/marketing/BundleTeaserCard';
import { EmailCaptureBand } from '@/components/marketing/EmailCaptureBand';
import { Reveal } from '@/components/marketing/Reveal';
import { ArrowRight, Check, Download, Globe2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const HeroDemo = dynamic(
  () => import('@/components/landing/HeroDemo').then((m) => m.HeroDemo),
  { ssr: false, loading: () => <HeroDemoFallback /> }
);

const JourneyScroll = dynamic(
  () => import('@/components/landing/JourneyScroll').then((m) => m.JourneyScroll),
  { ssr: false, loading: () => <div id="path" className="min-h-[12rem]" aria-hidden /> }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false, loading: () => <div className="min-h-[8rem]" aria-hidden /> }
);

const GuideTeaser = dynamic(
  () => import('@/components/landing/GuideTeaser').then((m) => m.GuideTeaser),
  { ssr: false, loading: () => <div className="min-h-[8rem]" aria-hidden /> }
);

const FAQ = LANDING_FAQ_KEYS;

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
    defaultValue: 'Win Score from your logs — readiness, strain, recovery',
  },
] as const;

const FREE_MINI_STATS = [
  {
    valueKey: 'landingFreeStatWorkouts',
    valueDefault: 'Unlimited logs',
    hintKey: 'landingFreeStatWorkoutsHint',
    hintDefault: 'Forever free',
  },
  {
    valueKey: 'landingFreeStatLibrary',
    valueDefault: '217 exercises',
    hintKey: 'landingFreeStatLibraryHint',
    hintDefault: 'Form cues included',
  },
  {
    valueKey: 'landingFreeStatOffline',
    valueDefault: 'Works offline',
    hintKey: 'landingFreeStatOfflineHint',
    hintDefault: 'Install as PWA',
  },
  {
    valueKey: 'landingFreeStatScore',
    valueDefault: 'Win Score',
    hintKey: 'landingFreeStatScoreHint',
    hintDefault: 'Six pillars, one number',
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

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <header className="hero-field texture-grid texture-noise section-seam relative overflow-hidden">
        <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div className="page-enter">
            <p className="eyebrow-live mb-5">
              {t('landingHeroEyebrow', { defaultValue: 'Free workout tracker · Offline PWA' })}
            </p>
            <h1 className="display-hero mb-6">
              {t('landingHeroTitle1', { defaultValue: 'Train anywhere.' })}
              <br />
              {t('landingHeroTitle2', { defaultValue: 'Win daily.' })}
            </h1>
            <p className="mb-4 max-w-md text-lg leading-relaxed text-muted-foreground">
              {t('landingHeroSubtitle', {
                defaultValue:
                  'The free workout tracker that works offline — no account, no app store, no paywall on the basics. Nutrition, mobility, mind, and learning deepen the same Win Score when you want them.',
              })}
            </p>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              {t('landingHeroLibrary', {
                defaultValue:
                  'Library of 217 free exercise pages — form cues, hubs, and a full foundations guide.',
              })}{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => router.push('/exercises')}
              >
                {t('landingHeroLibraryCta', { defaultValue: 'Browse exercises' })}
              </button>
            </p>
            <p className="mb-6 text-sm text-brass/90">
              {t('landingHeroProof', {
                defaultValue: 'Log a set in the demo → Win Score ticks. That’s the loop.',
              })}
            </p>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <button
                type="button"
                className="primary-action max-w-sm sm:max-w-none sm:w-auto sm:px-10"
                onClick={() => router.push('/welcome')}
              >
                {t('landingNavStart', { defaultValue: 'Start free' })}
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#path"
                className="px-1 py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t('landingSeeHow', { defaultValue: 'See how it works' })}
              </a>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary tabular-nums">
                {t('landingProofChip', {
                  defaultValue: '217 exercises · offline · no account',
                })}
              </span>
              <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {t('landingProofNoAiKey', {
                  defaultValue: 'No AI API key. Free logger.',
                })}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-primary" />{' '}
                {t('landingTrustInstall', { defaultValue: 'Installs like an app' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5 text-primary" />{' '}
                {t('landingTrustOffline', { defaultValue: 'Trains offline' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary" />{' '}
                {t('landingTrustLang', { defaultValue: '14 languages' })}
              </span>
            </div>
          </div>

          <div className="journey-enter relative">
            <div
              className="pointer-events-none absolute -inset-6 -z-0 opacity-70"
              aria-hidden
            >
              <Image
                src="/art/hero-field.avif"
                alt=""
                width={640}
                height={640}
                priority
                className="h-full w-full object-cover rounded-3xl opacity-80"
              />
            </div>
            <div className="card-elevated card-glow-emerald relative z-[1] p-1 sm:p-1.5 lg:rotate-1 transition-transform duration-500 hover:rotate-0">
              <div className="absolute -right-2 -top-2 z-10 rounded-full border border-brass/40 bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-brass shadow-glow-brass">
                PR
              </div>
              <HeroDemo staticFallback={<HeroDemoFallback />} />
              <p className="mt-4 text-center">
                <Link
                  href="/experience"
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  See the mission experience →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </header>

      <StatBand />

      {belowFoldReady ? <JourneyScroll /> : <div id="path" className="min-h-[12rem]" aria-hidden />}

      {/* ── Coach band ──────────────────────────────────────────────── */}
      <section className="texture-grid section-seam relative overflow-hidden bg-muted/10">
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-20">
          <Reveal>
            <p className="section-index mb-3">04 · Coach</p>
            <h2 className="display-section mb-6">
              {t('landingCoachDemoTitle', {
                defaultValue: 'Plans that adapt when life happens',
              })}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {t('landingCoachDemoBody', {
                defaultValue:
                  'Miss a day, sleep poorly, or crush a PR — Mission Coach reshapes the week without a spreadsheet.',
              })}
            </p>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="card-elevated mx-auto w-full max-w-md border-border/40 p-3 shadow-glow sm:p-4">
              <div className="mb-2 flex items-center justify-center gap-1.5" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-8 rounded-full bg-border/80" />
              </div>
              {belowFoldReady ? (
                <CoachAdaptDemo />
              ) : (
                <div className="min-h-[8rem]" aria-hidden />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {belowFoldReady ? <GuideTeaser /> : <div className="min-h-[8rem]" aria-hidden />}

      {/* ── Free manifesto ───────────────────────────────────────────── */}
      <section className="section-seam relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
        >
          <Image
            src="/art/topo-brass.avif"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            loading="lazy"
          />
        </div>
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <Reveal>
            <div className="briefing-rule mb-4">
              <span className="eyebrow">
                {t('landingFreeEyebrow', { defaultValue: 'The free core' })}
              </span>
            </div>
            <h2 className="display-section mb-4">
              {t('landingFreeTitle1', { defaultValue: 'Free is the mission,' })}
              <br />
              {t('landingFreeTitle2', { defaultValue: 'not the trial.' })}
            </h2>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              {t('landingFreeBody', {
                defaultValue:
                  'The fundamentals that make people healthier should have no price of admission — anywhere in the world. That is the founding promise, written into our vision, and it does not expire.',
              })}{' '}
              <Link href="/vision" className="underline underline-offset-4 hover:text-foreground">
                {t('landingFreeVisionLink', { defaultValue: 'our vision' })}
              </Link>
              .
            </p>
            <ul className="mt-6 space-y-2.5">
              {FREE_MANIFEST_KEYS.map((item) => (
                <li key={item.key} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t(item.key, { defaultValue: item.defaultValue })}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="grid grid-cols-2 gap-3 content-center">
              {FREE_MINI_STATS.map((s) => (
                <div key={s.valueKey} className="card-elevated p-4 sm:p-5">
                  <p className="font-display text-xl font-semibold uppercase leading-tight sm:text-2xl">
                    {t(s.valueKey, { defaultValue: s.valueDefault })}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t(s.hintKey, { defaultValue: s.hintDefault })}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Six pillars bento ────────────────────────────────────────── */}
      <section id="pillars" className="section-seam">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <Reveal>
            <div className="briefing-rule mb-4">
              <span className="eyebrow">
                {t('landingPillarsEyebrow', { defaultValue: 'Six pillars' })}
              </span>
            </div>
            <h2 className="display-section mb-4">
              {t('landingPillarsTitle', {
                defaultValue: 'Everything reinforces everything.',
              })}
            </h2>
            <p className="mb-10 max-w-xl text-muted-foreground">
              {t('landingPillarsBody', {
                defaultValue:
                  'Mobility improves training. Mind improves consistency. Fuel powers results. The Win Score weighs all six — one number for the whole self, not another silo.',
              })}
            </p>
          </Reveal>
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {BUNDLE_PILLARS.map((p, i) => {
              const isTrain = p.id === 'train';
              return (
                <Reveal
                  key={p.id}
                  delayMs={i * 50}
                  className={cn(isTrain && 'sm:col-span-2 sm:row-span-2')}
                >
                  <div
                    className={cn(
                      'card-elevated flex h-full flex-col p-5',
                      isTrain && 'card-glow-emerald sm:p-7'
                    )}
                  >
                    <div className="mb-3 flex items-baseline justify-between gap-2">
                      <h3
                        className={cn(
                          'font-display font-semibold uppercase leading-none',
                          isTrain ? 'text-3xl sm:text-4xl' : 'text-2xl'
                        )}
                      >
                        {p.name}
                      </h3>
                      <span className="section-index">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className={cn('mb-1 text-sm text-foreground/90', isTrain && 'sm:text-base')}>
                      <span className="eyebrow-live mr-2 text-[10px]">
                        {t('landingPillarsFree', { defaultValue: 'Free' })}
                      </span>
                      {p.free}
                    </p>
                    <p className={cn('mb-4 text-sm text-muted-foreground', isTrain && 'sm:text-base')}>
                      <span className="eyebrow-honor mr-2 text-[10px]">
                        {t('landingPillarsBundle', { defaultValue: 'Bundle' })}
                      </span>
                      {p.premium}
                    </p>
                    <Link
                      href={p.route}
                      className="mt-auto inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                    >
                      {t('landingPillarsOpen', {
                        defaultValue: `Open ${p.name}`,
                        name: p.name,
                      })}{' '}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <BundleTeaserCard />

      {/* ── Mission ─────────────────────────────────────────────────── */}
      <section className="section-seam relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
          <Image
            src="/art/topo-brass.avif"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            loading="lazy"
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-3xl px-5 py-16 text-center lg:py-24">
          <Reveal>
            <div className="mb-4 flex justify-center">
              <span className="eyebrow">
                {t('landingMissionEyebrow', { defaultValue: 'Why we build' })}
              </span>
            </div>
            <div className="mb-6 font-display text-6xl leading-none text-brass/40" aria-hidden>
              “
            </div>
            <blockquote className="font-display text-3xl font-medium uppercase leading-tight sm:text-4xl">
              {t('landingMissionQuote', {
                defaultValue:
                  '“The right way to build a body and a life should be obvious, doable, and free — for every human on Earth.”',
              })}
            </blockquote>
            <p className="mt-6 text-sm text-muted-foreground">
              {t('landingMissionBody', {
                defaultValue:
                  'Mission Winning is the entrance to that path: evidence-based, holistic, habit-first.',
              })}{' '}
              <Link href="/vision" className="underline underline-offset-4 hover:text-foreground">
                {t('landingMissionLink', { defaultValue: 'Read the full vision' })}
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="section-seam">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <div className="briefing-rule mb-8">
            <span className="eyebrow">
              {t('landingFaqEyebrow', { defaultValue: 'Straight answers' })}
            </span>
          </div>
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
                      {t(f.qKey)}
                    </span>
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 pl-10 text-sm leading-relaxed text-muted-foreground">
                  {t(f.aKey)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="hero-field texture-noise relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
          aria-hidden
        >
          <Image
            src="/art/arc-momentum.avif"
            alt=""
            width={480}
            height={320}
            className="object-contain"
            loading="lazy"
          />
        </div>
        <div className="relative z-[1] mx-auto max-w-3xl px-5 py-20 text-center lg:py-28">
          <Reveal>
            <h2 className="display-section mb-6">
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
          </Reveal>
        </div>
      </section>

      <EmailCaptureBand />

      <MarketingFooter />
    </div>
  );
}
