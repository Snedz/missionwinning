'use client';
/**
 * Page: / — marketing landing
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { BUNDLE_PILLARS } from '@/lib/payments';
import { LANDING_FAQ_KEYS } from '@/i18n/landingLocales';
import { HeroDemoFallback } from '@/components/landing/HeroDemo';
import { ArrowRight, Check, Download, Globe2, WifiOff } from 'lucide-react';

const HeroDemo = dynamic(
  () => import('@/components/landing/HeroDemo').then((m) => m.HeroDemo),
  { ssr: false, loading: () => <HeroDemoFallback /> }
);

const JourneyScroll = dynamic(
  () => import('@/components/landing/JourneyScroll').then((m) => m.JourneyScroll),
  { ssr: false }
);

const CoachAdaptDemo = dynamic(
  () => import('@/components/landing/CoachAdaptDemo').then((m) => m.CoachAdaptDemo),
  { ssr: false }
);

const GuideTeaser = dynamic(
  () => import('@/components/landing/GuideTeaser').then((m) => m.GuideTeaser),
  { ssr: false }
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

export function LandingPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              MW
            </span>
            <span className="font-display text-xl font-semibold uppercase tracking-wide">
              Mission Winning
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <a href="#path" className="text-muted-foreground transition-colors hover:text-foreground">
              {t('landingNavPath', { defaultValue: 'The path' })}
            </a>
            <a href="#pillars" className="text-muted-foreground transition-colors hover:text-foreground">
              {t('landingNavPillars', { defaultValue: 'Pillars' })}
            </a>
            <Link href="/bundle" className="text-muted-foreground transition-colors hover:text-foreground">
              {t('landingNavBundle', { defaultValue: 'Super Bundle' })}
            </Link>
          </div>
          <Button onClick={() => router.push('/welcome')} className="tap-target font-semibold">
            {t('landingNavStart', { defaultValue: 'Start free' })}
          </Button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <header className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
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
                defaultValue: 'Library of 217 free exercise pages — form cues, hubs, and a full foundations guide.',
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
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline px-1 py-2"
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

          <div className="journey-enter">
            <HeroDemo staticFallback={<HeroDemoFallback />} />
          </div>
        </div>
      </header>

      <JourneyScroll />

      <section className="border-b border-border/60 bg-muted/10">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h2 className="display-section mb-6">
            {t('landingCoachDemoTitle', { defaultValue: 'Plans that adapt when life happens' })}
          </h2>
          <CoachAdaptDemo />
        </div>
      </section>

      <GuideTeaser />

      {/* ── Free manifest ───────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div>
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
          </div>
          <ul className="grid content-center gap-3 sm:grid-cols-2">
            {FREE_MANIFEST_KEYS.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-foreground/90">
                  {t(item.key, { defaultValue: item.defaultValue })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Six pillars ─────────────────────────────────────────────── */}
      <section id="pillars" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">Six pillars · One score</span>
          </div>
          <h2 className="display-section mb-4">Everything reinforces everything.</h2>
          <p className="mb-10 max-w-xl text-muted-foreground">
            Mobility improves training. Mind improves consistency. Fuel powers results. The Win
            Score weighs all six — one number for the whole self, not another silo.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLE_PILLARS.map((p, i) => (
              <div key={p.id} className="content-card flex flex-col p-5">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-display text-2xl font-semibold uppercase leading-none">
                    {p.name}
                  </h3>
                  <span className="font-mono text-xs text-muted-foreground/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mb-1 text-sm text-foreground/90">
                  <span className="eyebrow-live mr-2 text-[10px]">Free</span>
                  {p.free}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  <span className="eyebrow-honor mr-2 text-[10px]">Bundle</span>
                  {p.premium}
                </p>
                <Link
                  href={p.route}
                  className="mt-auto inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                >
                  Open {p.name} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Super Bundle teaser ─────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="content-card grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow-honor mb-4">The Super Bundle</p>
              <h2 className="display-section mb-4">
                Six premium tools.
                <br /> One subscription.
              </h2>
              <p className="mb-6 max-w-lg leading-relaxed text-muted-foreground">
                Coaching-grade training plans, deep nutrition, complete mobility and mind
                libraries, advanced tracking, and full specialist programs — the depth of six apps,
                priced like one. Founding members lock in discounted pricing for good.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-brass/40 px-6 text-brass hover:bg-brass/10 hover:text-brass"
                onClick={() => router.push('/bundle')}
              >
                See the bundle <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2.5 text-sm">
              {BUNDLE_PILLARS.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5 text-foreground/90">
                  <Check className="h-4 w-4 shrink-0 text-brass" />
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground"> — {p.premium}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            The free core never moves behind the bundle. Premium funds the mission — it doesn’t
            gate it.
          </p>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-20">
          <div className="mb-4 flex justify-center">
            <span className="eyebrow">Why we build</span>
          </div>
          <blockquote className="font-display text-3xl font-medium uppercase leading-tight sm:text-4xl">
            “The right way to build a body and a life should be obvious, doable, and free — for
            every human on Earth.”
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            Mission Winning is the entrance to that path: evidence-based, holistic, habit-first.{' '}
            <Link href="/vision" className="underline underline-offset-4 hover:text-foreground">
              Read the full vision
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
          <div className="briefing-rule mb-8">
            <span className="eyebrow">Straight answers</span>
          </div>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.qKey} className="content-card group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {t(f.qKey)}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(f.aKey)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="display-section mb-6">The path starts with one workout.</h2>
          <Button
            size="lg"
            className="h-14 px-10 text-base font-semibold"
            onClick={() => router.push('/welcome')}
          >
            Start free — no account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Under three minutes to your first session. Nothing to install, nothing to pay.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Mission Winning · Train anywhere. Win daily.</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="/guide" className="hover:text-foreground">
              Guide
            </Link>
            <Link href="/exercises" className="hover:text-foreground">
              Exercises
            </Link>
            <Link href="/paths" className="hover:text-foreground">
              Paths
            </Link>
            <Link href="/compare" className="hover:text-foreground">
              Compare
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/beta" className="hover:text-foreground">
              Beta guide
            </Link>
            <Link href="/feedback" className="hover:text-foreground">
              Feedback
            </Link>
            <Link href="/vision" className="hover:text-foreground">
              Vision
            </Link>
            <Link href="/bundle" className="hover:text-foreground">
              Super Bundle
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
        <div className="border-t border-border/40 px-5 py-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          Educational fitness tools — not medical advice. Consult a physician before starting any
          training program.
        </div>
      </footer>
    </div>
  );
}
