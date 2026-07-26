'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { MuscleHeatCell } from '@/lib/historyAnalytics';
import { cn } from '@/lib/utils';

type Props = {
  cells: MuscleHeatCell[];
  windowDays: number;
};

function heatColor(intensity: number, daysSince: number): string {
  if (intensity <= 0 && daysSince >= 99) return 'bg-muted/30 border-border/40';
  if (intensity <= 0) return 'bg-primary/10 border-primary/40';
  if (intensity >= 0.75) return 'bg-[hsl(var(--status-warn)/0.35)] border-[hsl(var(--status-warn)/0.5)]';
  if (intensity >= 0.4) return 'bg-primary/25 border-primary/40';
  return 'bg-primary/10 border-primary/40';
}

export function MuscleHeatmap({ cells, windowDays }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {t('historyHeatmapTitle', { defaultValue: 'Muscle heatmap' })}
        </CardTitle>
        <CardDescription>
          {t('historyHeatmapDesc', {
            days: windowDays,
            defaultValue: `Volume by group — last ${windowDays} days. Darker = more work; green idle = ready to train.`,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cells.map((cell) => (
            <div
              key={cell.group}
              className={cn(
                'rounded-xl border p-3 min-h-[88px] flex flex-col justify-between transition-colors',
                heatColor(cell.intensity, cell.daysSince)
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-sm font-semibold">
                  {muscleGroupLabel(cell.group, t)}
                </span>
                {cell.intensity > 0 && (
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {Math.round(cell.intensity * 100)}%
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                <p>
                  {t('historyHeatVolume', {
                    volume: cell.volume.toLocaleString(),
                    defaultValue: `${cell.volume.toLocaleString()} vol`,
                  })}
                </p>
                <p>
                  {cell.daysSince >= 99
                    ? t('historyHeatNoData', { defaultValue: 'No recent data' })
                    : t('historyHeatDaysRest', {
                        days: cell.daysSince,
                        defaultValue: `${cell.daysSince}d since trained`,
                      })}
                </p>
              </div>
              <div
                className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden"
                aria-hidden
              >
                <div
                  className="h-full bg-poster rounded-full transition-all"
                  style={{ width: `${Math.max(cell.intensity * 100, cell.daysSince >= 99 ? 0 : 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
