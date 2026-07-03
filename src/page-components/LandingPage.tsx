'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MetricsRow } from '@/components/metrics/MetricsRow';
import { ScoreRing } from '@/components/metrics/ScoreRing';
import { BUNDLE_PILLARS } from '@/lib/payments';
import type { BodyScores } from '@/lib/score';
import { ArrowRight, Check, Download, Globe2, WifiOff } from 'lucide-react';

const DEMO_SCORES: BodyScores = {
  readiness: 82,
  strain: 45,
  recovery: 78,
  readinessLabelKey: 'todayBodyPrimePush',
  strainLabelKey: 'todayBodyModerateLoad',
  recoveryLabelKey: 'todayBodyRebuilding',
};

/** The member path — a real sequence, so the numbering carries meaning. */
const JOURNEY_PHASES = [
  {
    phase: 'Phase 0',
    name: 'I-Day',
    desc: 'Three questions — experience, equipment, goal. No account needed. Under three minutes.',
  },
  {
    phase: 'Phase 1',
    name: 'Basic Training',
    desc: 'One small win in each pillar: first workout, first meal logged, first flow, first breath, first lesson.',
  },
  {
    phase: 'Phase 2',
    name: 'Readiness',
    desc: 'A health screen, your baseline Win Score, and a seven-day streak. Standards before speed.',
  },
  {
    phase: 'Phase 3',
    name: 'Commissioned',
    desc: 'Today becomes your command center. One clear action every day, scored across all six pillars.',
  },
];

const FREE_MANIFEST = [
  'Full workout logger — sets, reps, RPE, rest timers, supersets',
  '217-exercise library with form cues, bodyweight and minimal-equipment first',
  '152 program templates — 5×5, Texas Method, splits, conditioning',
  'Nutrition log with food search, barcode scan, and water tracking',
  'Win Score, readiness, strain, and recovery — computed from your logs',
  'Streaks, weekly challenges, and world leaderboards',
  'Mobility flows, breathing sessions, and eight learning paths',
  'Installable app that works offline — no store, no fees, no account',
];

const FAQ = [
  {
    q: 'Is the free version actually complete?',
    a: 'Yes. The workout tracker, exercise library, program templates, nutrition log, scores, streaks, and leaderboards are free forever, with no account required. Premium adds depth — coaching plans, specialist programs, advanced tools — and is never required to train.',
  },
  {
    q: 'Does it work offline, in my country, in my language?',
    a: 'Mission Winning is an installable web app: it runs in any modern browser, installs to your home screen without an app store, and the core keeps working with no connection. Navigation is available in 14 languages, with more copy translated every release.',
  },
  {
    q: 'What is the Super Bundle?',
    a: 'One subscription that unlocks premium depth across all six pillars — training plans, deep nutrition, full mobility and mind libraries, advanced tracking, and complete specialist programs. Founding members get permanent discounted pricing when checkout opens.',
  },
  {
    q: 'Who is this for?',
    a: 'Anyone who wants a disciplined, evidence-based path: a barbell in a garage, dumbbells in a flat, or nothing but floor space in a park. If you can train, Mission Winning can track it and guide it.',
  },
];

export function LandingPage() {
  const router = useRouter();

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
              The path
            </a>
            <a href="#pillars" className="text-muted-foreground transition-colors hover:text-foreground">
              Pillars
            </a>
            <Link href="/bundle" className="text-muted-foreground transition-colors hover:text-foreground">
              Super Bundle
            </Link>
          </div>
          <Button onClick={() => router.push('/welcome')} className="tap-target font-semibold">
            Start free
          </Button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <header className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-20">
          <div className="page-enter">
            <p className="eyebrow-live mb-5">Free for everyone · Works offline · No account needed</p>
            <h1 className="display-hero mb-6">
              Train anywhere.
              <br />
              Win daily.
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              One app for training, nutrition, mobility, mind, activity, and learning — scored
              together, so consistency finally has a number. The core is free.{' '}
              <span className="text-foreground">Forever. For everyone.</span>
            </p>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold"
                onClick={() => router.push('/welcome')}
              >
                Start free — no account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base"
                onClick={() => document.getElementById('path')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Installs like an app
              </span>
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5" /> Trains offline
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5" /> 14 languages
              </span>
            </div>
          </div>

          {/* Signature: live briefing card with real score components */}
          <div className="journey-enter">
            <div className="content-card p-6 sm:p-8">
              <div className="briefing-rule mb-6">
                <span className="eyebrow">Today</span>
              </div>
              <div className="mb-6 flex items-center justify-center">
                <ScoreRing label="Win Score" value={74} subtitle="All six pillars" color="emerald" size="lg" />
              </div>
              <MetricsRow scores={DEMO_SCORES} demo embedded />
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="eyebrow mb-1.5">Next action</p>
                <p className="text-sm text-foreground">
                  Lower body strength · 32 min · barbell or bodyweight
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── The path (journey) ──────────────────────────────────────── */}
      <section id="path" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="briefing-rule mb-4">
            <span className="eyebrow">The member path</span>
          </div>
          <h2 className="display-section mb-4">
            A clear beginning.
            <br className="sm:hidden" /> One step at a time.
          </h2>
          <p className="mb-10 max-w-xl text-muted-foreground">
            Borrowed from academy onboarding: you always know exactly where you are and what comes
            next. No wall of features on day one.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_PHASES.map((p) => (
              <div key={p.phase} className="content-card p-5">
                <p className="eyebrow-live mb-3">{p.phase}</p>
                <h3 className="font-display mb-2 text-2xl font-semibold uppercase leading-none">
                  {p.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free manifest ───────────────────────────────────────────── */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div>
            <div className="briefing-rule mb-4">
              <span className="eyebrow">The free core</span>
            </div>
            <h2 className="display-section mb-4">
              Free is the mission,
              <br /> not the trial.
            </h2>
            <p className="max-w-md leading-relaxed text-muted-foreground">
              The fundamentals that make people healthier should have no price of admission —
              anywhere in the world. That is the founding promise, written into{' '}
              <Link href="/vision" className="underline underline-offset-4 hover:text-foreground">
                our vision
              </Link>
              , and it does not expire.
            </p>
          </div>
          <ul className="grid content-center gap-3 sm:grid-cols-2">
            {FREE_MANIFEST.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-foreground/90">{item}</span>
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
              <details key={f.q} className="content-card group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
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
            <Link href="/about" className="hover:text-foreground">
              About
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
