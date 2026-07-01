'use client';

import { useTranslation } from 'react-i18next';
import { Sparkline } from '@/components/today/Sparkline';
import type { TodayTrends, TrendMetricId } from '@/lib/todayTrends';
import { cn } from '@/lib/utils';

const METRIC_KEYS: Record<TrendMetricId, { label: string; defaultLabel: string }> = {
  volume: { label: 'todayTrendVolume', defaultLabel: 'Volume' },
  sessions: { label: 'todayTrendSessions', defaultLabel: 'Sessions' },
  protein: { label: 'todayTrendProtein', defaultLabel: 'Protein' },
  active: { label: 'todayTrendActive', defaultLabel: 'Active min' },
};

type Props = {
  trends: TodayTrends;
  className?: string;
};

function formatMetricValue(id: TrendMetricId, latest: number, weekTotal: number): string {
  if (id === 'volume') {
    if (latest >= 1000) return `${(latest / 1000).toFixed(1)}k`;
    return latest.toLocaleString();
  }
  if (id === 'protein') return `${Math.round(latest)}g`;
  if (id === 'active') return `${Math.round(latest)}m`;
  if (id === 'sessions') return String(Math.round(latest));
  return String(weekTotal);
}

export function TodayMetricsSparklineRow({ trends, className }: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {t('todayTrendsTitle', { defaultValue: '7-day trends' })}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {trends.series.map((series) => {
          const meta = METRIC_KEYS[series.id];
          return (
            <div
              key={series.id}
              className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 flex flex-col gap-1 min-h-[88px]"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                  {t(meta.label, { defaultValue: meta.defaultLabel })}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t('todayTrendToday', { defaultValue: 'Today' })}
                </span>
              </div>
              <p className="text-lg font-bold tabular-nums leading-none">
                {formatMetricValue(series.id, series.latest, series.weekTotal)}
              </p>
              <Sparkline values={series.values} className="mt-auto w-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
