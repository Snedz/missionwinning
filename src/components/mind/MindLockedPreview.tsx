'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeterBar } from '@/components/ui/MeterBar';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';
import { getContentInventory } from '@/lib/contentInventory';

const DEMO_STEPS = [
  'What is the smallest session you will actually finish today?',
  'What got in the way — sleep, schedule, or a plan that was too big?',
  'What is the next physical action that still counts?',
];

/** Premium mind upsell — blurred player teaser (TrackGpsLockedPreview pattern). */
export function MindLockedPreview() {
  const { t } = useTranslation();
  const inv = getContentInventory();

  // Free-first beta: hide paid upsells.
  if (isFreeBeta()) return null;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          {t('mindPremiumTitle', { defaultValue: 'Premium — training questions, not a spa library' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('mindPremiumDesc', {
            defaultValue:
              'Short journal-style sessions for before a lift, after a miss, sleep, and travel. Pause or skip any step. No streak. Not therapy.',
          })}
        </p>
        <div className="relative border-2 border-border bg-card p-4">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] flex flex-col sm:flex-row items-center gap-4">
            <MeterBar label="Progress" value={42} readout="42% · 2:30" className="w-full sm:w-48" />
            <ul className="text-sm space-y-2 flex-1">
              {DEMO_STEPS.map((s) => (
                <li key={s} className="text-muted-foreground">
                  · {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('mindPreviewPlayer', { defaultValue: 'Press play — timed cues walk you through each step' })}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('mindLockedHint', {
            free: inv.mind.free,
            premium: inv.mind.premium,
            defaultValue:
              'Free: {{free}} guided sessions. Super Bundle adds {{premium}} timed sessions you can skip — training questions, not a meditation library.',
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <UnlockButton productId="super-bundle" planId="12mo" price="59" title="Super Bundle" isSubscription />

          <Button variant="outline" size="sm" className="min-h-[44px] tap-target" asChild>
            <Link href="/bundle">{t('trackExploreBundle', { defaultValue: 'See Super Bundle' })}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
