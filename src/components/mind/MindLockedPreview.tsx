'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeterBar } from '@/components/ui/MeterBar';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';

const DEMO_STEPS = ['Set one intention for this session', 'Box breathing 4-4-4-4', 'Visualize smooth reps'];

/** Premium mind upsell — blurred player teaser (TrackGpsLockedPreview pattern). */
export function MindLockedPreview() {
  const { t } = useTranslation();

  // Free-first beta: hide paid upsells.
  if (isFreeBeta()) return null;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          {t('mindPremiumTitle', { defaultValue: 'Premium — Calm / Waking Up depth' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('mindPremiumDesc', {
            defaultValue:
              'Guided sessions, sleep stories, expert lessons on building resilience.',
          })}
        </p>
        <div className="relative rounded-lg border border-border/50 bg-card p-4">
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
            defaultValue:
              'Free tier includes 10 guided sessions. Premium adds 17 deeper timed sessions — focus, recovery, race calm, and travel resets.',
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <UnlockButton productId="super-bundle" planId="12mo" price="59" title="Super Bundle" isSubscription />

          <Button variant="outline" size="sm" asChild>
            <Link href="/bundle">{t('trackExploreBundle', { defaultValue: 'See Super Bundle' })}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
