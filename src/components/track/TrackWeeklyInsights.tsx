'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getActivitiesForWeek } from '@/lib/activityLog';
import { paceMinPerKm, formatPaceMinPerKm } from '@/lib/trackGps';

function isGpsActivity(notes?: string): boolean {
  return !!notes?.toLowerCase().includes('gps');
}

export function TrackWeeklyInsights() {
  const { t } = useTranslation();
  const weekActivities = typeof window !== 'undefined' ? getActivitiesForWeek() : [];
  const gpsActivities = weekActivities.filter((a) => isGpsActivity(a.notes));

  const stats = useMemo(() => {
    if (!gpsActivities.length) return null;
    const totalKm = gpsActivities.reduce((s, a) => s + (a.distanceKm ?? 0), 0);
    const totalMin = gpsActivities.reduce((s, a) => s + a.durationMin, 0);
    const avgPace = paceMinPerKm(totalKm, totalMin);
    return {
      sessions: gpsActivities.length,
      totalKm,
      avgPace,
    };
  }, [gpsActivities]);

  if (!stats) return null;

  return (
    <Card className="content-card border-emerald-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('trackWeeklyGpsTitle', { defaultValue: 'GPS week at a glance' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold tabular-nums">{stats.sessions}</div>
          <div className="text-xs text-muted-foreground">
            {t('trackGpsSessions', { defaultValue: 'GPS sessions' })}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{stats.totalKm.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">km</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {stats.avgPace != null ? formatPaceMinPerKm(stats.avgPace).replace('/km', '') : '—'}
          </div>
          <div className="text-xs text-muted-foreground">
            {t('trackAvgPace', { defaultValue: 'avg pace /km' })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
