'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeterBar } from '@/components/ui/MeterBar';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';
import { CONTENT_FLOORS } from '@/lib/contentFloors';

const DEMO_FLOW = [
  { label: 'Cat-Camel', cue: 'Slow spine waves' },
  { label: '90/90 Hip Switch', cue: 'Rock into hips gently' },
  { label: 'Pigeon Hold', cue: 'Breathe into tension' },
];

/** Premium mobility upsell — blurred flow player teaser. */
export function MoveLockedPreview() {
  const { t } = useTranslation();

  // Free-first beta: hide paid upsells.
  if (isFreeBeta()) return null;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wind className="h-4 w-4 text-primary" />
          {t('movePremiumTitle', { defaultValue: 'Premium — longer timed recovery flows' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('movePremiumDesc', {
            defaultValue: 'Sports-specific mobility and recovery — timers and bodyweight, not a video library.',
          })}
        </p>
        <div className="relative border-2 border-border bg-card p-4">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] space-y-3">
            <div className="flex justify-center">
              <MeterBar label="Athlete recovery" value={18} readout="18% · 0:45" className="w-full sm:w-48" />
            </div>
            {DEMO_FLOW.map((s) => (
              <div key={s.label} className="text-sm border border-border p-2">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.cue}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('movePreviewPlayer', { defaultValue: 'Timed cues — original recovery flows, no video' })}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('moveLockedHint', {
            free: CONTENT_FLOORS.moveFree,
            premium: CONTENT_FLOORS.movePremium,
            defaultValue:
              'Free tier includes {{free}} flows. Super Bundle adds {{premium}} longer timed protocols — post-lift, hotel floor, and athlete recovery. No video library.',
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
