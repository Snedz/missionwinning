'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeterBar } from '@/components/ui/MeterBar';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';

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
          {t('movePremiumTitle', { defaultValue: 'Premium — Pliability / Skill Yoga depth' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('movePremiumDesc', {
            defaultValue: 'Sports-specific mobility, recovery protocols, and advanced flows.',
          })}
        </p>
        <div className="relative rounded-lg border border-border/50 bg-black/20 p-4">
          <div className="pointer-events-none select-none opacity-60 blur-[1px] space-y-3">
            <div className="flex justify-center">
              <MeterBar label="Athlete recovery" value={18} readout="18% · 0:45" className="w-full sm:w-48" />
            </div>
            {DEMO_FLOW.map((s) => (
              <div key={s.label} className="text-sm border border-border/30 rounded-lg p-2">
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.cue}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {t('movePreviewPlayer', { defaultValue: 'Timed cues — Pliability-style recovery flows' })}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('moveLockedHint', {
            defaultValue:
              'Free tier includes 10 flows. Premium adds 11 longer protocols — post-lift, morning open, low-back friendly, and athlete recovery.',
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
