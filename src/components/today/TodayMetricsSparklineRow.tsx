'use client';

import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { formatLocalNumber } from '@/lib/i18n/formatLocale';
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

/**
 * `lang` rather than a hook: this is module scope, so `.242` threaded the
 * language in from the component instead of moving the function inside it.
 *
 * The `k` abbreviation still goes through `formatLocalNumber` — `toFixed(1)`
 * hardcodes a full stop as the decimal separator, so `4.2k` reads as four
 * hundred and twenty in German. Recorded rather than swept: `toFixed` is not an
 * *ambient-locale* call, so the guard cannot see it, and the repo has ~60 more
 * of them, several feeding values back into inputs. Named in the `.242` LOG.
 */
function formatMetricValue(
  id: TrendMetricId,
  latest: number,
  weekTotal: number,
  lang: string
): string {
  if (id === 'volume') {
    if (latest >= 1000)
      return `${formatLocalNumber(latest / 1000, lang, { maximumFractionDigits: 1 })}k`;
    return formatLocalNumber(latest, lang);
  }
  if (id === 'protein') return `${Math.round(latest)}g`;
  if (id === 'active') return `${Math.round(latest)}m`;
  if (id === 'sessions') return String(Math.round(latest));
  return String(weekTotal);
}

export function TodayMetricsSparklineRow({ trends, className }: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();

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
              className="border-2 border-border bg-card px-3 py-2.5 flex flex-col gap-1 min-h-[88px]"
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
                {formatMetricValue(series.id, series.latest, series.weekTotal, fmt.lang)}
              </p>
              <Sparkline values={series.values} className="mt-auto w-full" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
