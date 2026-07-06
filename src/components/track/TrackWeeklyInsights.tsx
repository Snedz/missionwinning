'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActivitiesForWeek } from '@/lib/activityLog';
import { formatPaceMinPerKm, summarizeGpsWeek } from '@/lib/trackGps';

type Props = {
  /** When true, show demo weekly stats + unlock CTA instead of hiding the card. */
  locked?: boolean;
};

export function TrackWeeklyInsights({ locked = false }: Props) {
  const { t } = useTranslation();
  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const stats = summarizeGpsWeek(weekActivities);

  if (!locked && !stats) return null;

  const display = locked
    ? { sessions: 2, totalKm: 8.4, avgPace: 5.75 }
    : stats!;

  return (
    <Card className={`content-card border-emerald-500/20 ${locked ? 'opacity-95' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('trackWeeklyGpsTitle', { defaultValue: 'GPS week at a glance' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`grid grid-cols-3 gap-3 text-center ${locked ? 'blur-[1px] select-none' : ''}`}>
          <div>
            <div className="text-2xl font-bold tabular-nums">{display.sessions}</div>
            <div className="text-xs text-muted-foreground">
              {t('trackGpsSessions', { defaultValue: 'GPS sessions' })}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{display.totalKm.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {display.avgPace != null ? formatPaceMinPerKm(display.avgPace).replace('/km', '') : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              {t('trackAvgPace', { defaultValue: 'avg pace /km' })}
            </div>
          </div>
        </div>
        {locked && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-sm space-y-2">
            <p className="text-muted-foreground">
              {t('trackWeeklyGpsLocked', {
                defaultValue: 'Weekly GPS distance and average pace — Super Bundle.',
              })}
            </p>
            <Button variant="fitness" size="sm" asChild>
              <Link href="/bundle">{t('trackExploreBundle', { defaultValue: 'See Super Bundle' })}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
