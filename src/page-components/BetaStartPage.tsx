'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight, Globe, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    n: 1,
    title: 'Unlock access',
    body: 'Use the private access code from your invite. Enter it on the gate page or append ?access=YOUR_CODE to any URL once.',
    href: '/private',
    cta: 'Enter access code',
  },
  {
    n: 2,
    title: 'Complete I-Day (≈2 min)',
    body: 'Welcome flow sets your goal and equipment. This syncs to your profile when you sign in.',
    href: '/welcome',
    cta: 'Start I-Day',
  },
  {
    n: 3,
    title: 'Log your first workout',
    body: 'Today → your next step → Train. One completed session unlocks streak tracking and leaderboard sync.',
    href: '/log',
    cta: 'Go to Today',
  },
  {
    n: 4,
    title: 'Sign in (optional but recommended)',
    body: 'Magic link on Profile keeps journey, workouts, and rankings in the cloud across devices.',
    href: '/profile',
    cta: 'Profile & sign in',
  },
  {
    n: 5,
    title: 'Explore rankings',
    body: 'Six boards including Under the Stars (night) and By Dawn\'s Early Light (early morning). Set a squad code to compare with friends.',
    href: '/leaderboard',
    cta: 'Open leaderboard',
  },
];

export function BetaStartPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-medium">Private beta</p>
          <h1 className="text-3xl font-bold tracking-tight">Start here</h1>
          <p className="text-white/70 leading-relaxed">
            Mission Winning is in private development. You are among the first Mission Operators helping us
            validate the journey, Today hub, and rankings before public launch.
          </p>
        </header>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <CheckCircle2 className="h-5 w-5" />
            What we need from you
          </div>
          <ul className="text-sm text-white/75 space-y-1.5 list-disc list-inside">
            <li>Finish I-Day and at least one workout this week</li>
            <li>Try Simple mode first — switch to Pro on Profile if you want the full Today view</li>
            <li>Report anything confusing via Profile → feedback or reply to your invite email</li>
          </ul>
        </div>

        <ol className="space-y-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm">
                {step.n}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h2 className="font-semibold">{step.title}</h2>
                <p className="text-sm text-white/65 leading-relaxed">{step.body}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0 border-white/20 hover:bg-white/10">
                <Link href={step.href}>
                  {step.cta}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </li>
          ))}
        </ol>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/10 p-4 flex gap-3">
            <Globe className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Languages</div>
              <p className="text-white/60 mt-1">
                Nav and welcome work in 12+ languages. Change language on Profile → Language.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 p-4 flex gap-3">
            <Trophy className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Leaderboard sync</div>
              <p className="text-white/60 mt-1">
                Sign in and tap Sync on Rankings after workouts. Night and dawn sessions count on themed boards.
              </p>
            </div>
          </div>
        </div>

        <footer className="pt-6 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/50">
          <Link href="/about" className="hover:text-emerald-400 inline-flex items-center gap-1">
            <User className="h-4 w-4" /> About
          </Link>
          <Link href="/privacy" className="hover:text-emerald-400">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-emerald-400">
            Terms
          </Link>
          <Link href="/log" className="text-emerald-400 hover:underline ml-auto">
            Skip to Today →
          </Link>
        </footer>
      </div>
    </div>
  );
}
