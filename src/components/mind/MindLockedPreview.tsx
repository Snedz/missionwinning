'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricRing } from '@/components/ui/MetricRing';
import { UnlockButton } from '@/components/UnlockButton';

const DEMO_STEPS = ['Set one intention for this session', 'Box breathing 4-4-4-4', 'Visualize smooth reps'];

/** Premium mind upsell — blurred player teaser (TrackGpsLockedPreview pattern). */
export function MindLockedPreview() {
  const { t } = useTranslation();

  return (
    <Card className="content-card border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-emerald-400" />
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
        <div className="relative rounded-lg border border-border/50 bg-black/20 p-4">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] flex flex-col sm:flex-row items-center gap-4">
            <MetricRing label="Progress" value="42%" sublabel="2:30" progress={42} />
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
            defaultValue: 'Free tier includes 10 guided sessions. Premium adds 12 deeper Calm-style sessions.',
          })}
        </p>
        <div className="flex flex-wrap gap-2">
          <UnlockButton productId="super-bundle" price="59" title="Super Bundle" isSubscription />
          <Button variant="outline" size="sm" asChild>
            <Link href="/bundle">{t('trackExploreBundle', { defaultValue: 'See Super Bundle' })}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
