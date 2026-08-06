'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_PACE_SERIES } from '@/lib/trackGps';
import { UnlockButton } from '@/components/UnlockButton';
import { isFreeBeta } from '@/lib/freeBeta';

const TrackPaceChart = dynamic(
  () => import('@/components/track/TrackPaceChart').then((m) => m.TrackPaceChart),
  { ssr: false }
);

/** Premium GPS upsell — sample pace chart + weekly stats teaser (not a blank unlock). */
export function TrackGpsLockedPreview() {
  const { t } = useTranslation();

  // Free-first beta: hide paid upsells.
  if (isFreeBeta()) return null;

  return (
    <Card className="content-card border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {t('trackGpsTitle', { defaultValue: 'GPS track (Premium)' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('trackGpsPremiumDesc', {
            defaultValue:
              'Outdoor walks and runs with live distance — Super Bundle.',
          })}
        </p>
        <div className="relative  border-2 border-border bg-card p-3">
          <div className="pointer-events-none select-none opacity-70 blur-[1px]">
            <TrackPaceChart data={DEMO_PACE_SERIES} height={100} />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {t('trackGpsPreviewChart', { defaultValue: 'Live pace chart while you move' })}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm border-2 border-border bg-muted p-3">
          <div>
            <div className="font-bold tabular-nums">2</div>
            <div className="text-xs text-muted-foreground">
              {t('trackGpsSessions', { defaultValue: 'GPS sessions' })}
            </div>
          </div>
          <div>
            <div className="font-bold tabular-nums">8.4</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          <div>
            <div className="font-bold tabular-nums">5:45</div>
            <div className="text-xs text-muted-foreground">
              {t('trackAvgPace', { defaultValue: 'avg pace /km' })}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('trackGpsLockedHint', {
            defaultValue: 'Manual log and import stay free. Super Bundle adds GPS and weekly pace.',
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
