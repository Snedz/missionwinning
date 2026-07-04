'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { Button } from '@/components/ui/button';

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
];

export function ComparePage() {
  const { t } = useTranslation();

  return (
    <div className="page-stack max-w-4xl mx-auto pb-24">
      <PillarPageHeader
        icon={Scale}
        title={t('compareTitle', { defaultValue: 'How we compare' })}
        subtitle={t('compareSubtitle', {
          defaultValue: 'Honest comparison of free tiers — sourced where possible.',
        })}
      />

      <Card className="content-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            {t('compareTableTitle', { defaultValue: 'Free tier at a glance' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left">
                <th className="py-2 pr-4 font-medium text-muted-foreground">Feature</th>
                <th className="py-2 pr-4 font-semibold text-emerald-400">Mission Winning</th>
                <th className="py-2 pr-4">Hevy</th>
                <th className="py-2">Strong</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-border/30">
                  <td className="py-3 pr-4 text-muted-foreground">{row.feature}</td>
                  <td className="py-3 pr-4 font-medium">{row.mw}</td>
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Button asChild variant="fitness">
          <Link href="/welcome">{t('welcomeBegin', { defaultValue: 'Begin' })}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/bundle">{t('exploreBundle', { defaultValue: 'Explore Super Bundle' })}</Link>
        </Button>
      </div>
    </div>
  );
}
