'use client';
/**
 * Page: /compare — competitor comparison
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PublicSeoHeader } from '@/components/public/PublicSeoHeader';
import { PublicSeoFooter } from '@/components/public/PublicSeoFooter';

type Row = {
  feature: string;
  mw: string;
  hevy: string;
  strong: string;
  source?: string;
};

const COMPARE_ROWS: Row[] = [
  {
    feature: 'Price (free tier)',
    mw: 'Free core forever',
    hevy: 'Free with limits',
    strong: 'Free with limits',
  },
  {
    feature: 'Account required',
    mw: 'No — works offline',
    hevy: 'Yes',
    strong: 'Yes',
  },
  {
    feature: 'Saved routines (free)',
    mw: 'Unlimited',
    hevy: '4 routines',
    strong: '3 routines',
    source: 'Hevy/Strong free tier docs (2025)',
  },
  {
    feature: 'Workout history (free)',
    mw: 'Unlimited local',
    hevy: '3 months',
    strong: 'Limited export',
    source: 'Hevy free tier (2025)',
  },
  {
    feature: 'Custom exercises (free)',
    mw: 'Full library + builder',
    hevy: '7 custom',
    strong: 'Limited',
    source: 'Hevy free tier (2025)',
  },
  {
    feature: 'Offline logging',
    mw: 'Full PWA offline',
    hevy: 'Partial',
    strong: 'Partial',
  },
  {
    feature: 'AI weekly coach',
    mw: 'Mission Coach (1 free week)',
    hevy: '—',
    strong: '—',
  },
  {
    feature: 'Nutrition / mobility / mind',
    mw: 'Six pillars in one app',
    hevy: '—',
    strong: '—',
  },
  {
    feature: 'AI API key required',
    mw: 'No — Just Go is rule-based & free',
    hevy: '—',
    strong: '—',
    source: 'vs Forge Fitness BYOK Pro (2026)',
  },
  {
    feature: 'Rest timer / PRs / progression (free)',
    mw: 'Included forever',
    hevy: 'Core free; limits elsewhere',
    strong: 'Core free; limits elsewhere',
  },
];

export function ComparePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicSeoHeader
        eyebrow={t('compareEyebrow', { defaultValue: 'Honest comparison' })}
        title={t('compareTitle', { defaultValue: 'How we compare' })}
        subtitle={t('compareSubtitle', {
          defaultValue:
            'Free tiers side by side — Mission Winning leads with the tracker, not the paywall. No AI API key required.',
        })}
      />

      <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
        <div className="card-elevated overflow-hidden">
          <div className="section-seam px-5 py-4">
            <h2 className="text-base font-semibold">
              {t('compareTableTitle', { defaultValue: 'Free tier at a glance' })}
            </h2>
          </div>
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="py-3 pr-4 font-medium text-muted-foreground">Feature</th>
                  <th className="bg-primary/5 py-3 pr-4 font-semibold text-primary">
                    Mission Winning
                  </th>
                  <th className="py-3 pr-4">Hevy</th>
                  <th className="py-3">Strong</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-border/30">
                    <td className="py-3 pr-4 text-muted-foreground">{row.feature}</td>
                    <td className="bg-primary/5 py-3 pr-4 font-medium text-foreground">
                      {row.mw}
                    </td>
                    <td className="py-3 pr-4">{row.hevy}</td>
                    <td className="py-3">{row.strong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
              Hevy free limits: hevyapp.com pricing (4 routines, 3-month history, 7 custom exercises).
              Strong free: 3 routines (strong.app). Mission Winning free core: unlimited local routines and
              history, offline PWA, no account required.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              href: '/compare/forge',
              title: 'vs Forge',
              body: 'No AI API key. Just Go + PRs free.',
            },
            {
              href: '/compare/freeletics',
              title: 'vs Freeletics',
              body: 'Six pillars in one app — not a multi-app stack.',
            },
            {
              href: '/compare/spreadsheet',
              title: 'vs spreadsheets',
              body: 'Auto targets, rest timer, readiness from logs.',
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="card-elevated pressable-card block p-4 transition-shadow hover:shadow-glow"
            >
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.body}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-border/40 bg-muted/15 p-5 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Proof, not vibes</p>
          <p>
            Free library:{' '}
            <Link href="/exercises" className="text-primary hover:underline">
              217 exercise pages
            </Link>
            {' · '}
            <Link href="/guide" className="text-primary hover:underline">
              full foundations guide
            </Link>
            {' · '}
            <Link href="/paths" className="text-primary hover:underline">
              10 learning paths
            </Link>
            . Rest timers, PRs, and Just Go are free forever — not Pro bait.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="fitness" size="lg" className="min-h-[52px] px-8">
            <Link href="/welcome">{t('welcomeBegin', { defaultValue: 'Begin' })}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-[52px] px-8">
            <Link href="/bundle">{t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
          </Button>
        </div>
      </main>
      <PublicSeoFooter />
    </div>
  );
}
