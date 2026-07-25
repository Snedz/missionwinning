'use client';
/**
 * Page: /compare — competitor comparison
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { EXERCISES } from '@/data/exercises';
import { isFreeBeta } from '@/lib/freeBeta';

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
    feature: 'Weekly coach from logs',
    mw: 'Mission Coach — free every week',
    hevy: '—',
    strong: '—',
  },
  {
    feature: 'Fuel / move / mind tools',
    mw: 'Available after Train + Coach',
    hevy: '—',
    strong: '—',
  },
  {
    feature: 'API key required',
    mw: 'No — Just Go is free and local',
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
    <PublicPageShell
      eyebrow={t('compareEyebrow', { defaultValue: 'Honest comparison' })}
      title={t('compareTitle', { defaultValue: 'How we compare' })}
      subtitle={t('compareSubtitle', {
        defaultValue:
          'Free tiers side by side. We lead with the offline logger and Coach from your logs — not a paywall.',
      })}
      ctaLabel={t('landingNavStart', { defaultValue: 'Start free' })}
      maxWidth="4xl"
    >
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm">
          <div className="border-b border-border/40 px-5 py-4">
            <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
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
              body: 'Free core, no AI key. Just Go + PRs free.',
            },
            {
              href: '/compare/freeletics',
              title: 'vs Freeletics',
              body: 'Logger + Coach first — tools deepen later.',
            },
            {
              href: '/compare/spreadsheet',
              title: 'vs spreadsheets',
              body: 'Rest timer, targets, readiness from logs.',
            },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm transition-colors hover:border-border"
            >
              <p className="font-semibold text-sm">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.body}</p>
            </Link>
          ))}
        </div>

        <div className="space-y-2 rounded-2xl border border-border/40 bg-muted/15 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="eyebrow">What stays free</p>
          <p>
            Free library:{' '}
            <Link href="/exercises" className="text-primary hover:underline">
              {EXERCISES.length} exercise pages
            </Link>
            {' · '}
            <Link href="/guide" className="text-primary hover:underline">
              foundations guide
            </Link>
            {' · '}
            <Link href="/paths" className="text-primary hover:underline">
              learning paths
            </Link>
            . Rest timers, PRs, and Just Go are free forever.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/* Was `t('welcomeBegin', …)`, whose shipped en value is 'Begin' — so the primary
              CTA on the highest-intent comparison page read "Begin", matching neither its
              own defaultValue nor any other Start-free button on the site. `welcomeBegin`
              belongs to the Welcome flow, where it means "continue". */}
          <Link href="/welcome" className="primary-action sm:w-auto sm:px-10">
            {t('landingNavStart', { defaultValue: 'Start free' })}
          </Link>
          {!isFreeBeta() && (
            <Button asChild variant="outline" size="lg" className="min-h-[52px] px-8">
              <Link href="/bundle">{t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
            </Button>
          )}
        </div>
    </PublicPageShell>
  );
}
