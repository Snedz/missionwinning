'use client';

/**
 * Year of logged days on History. Counts come from `buildYearHeatmap`
 * (live `workoutHistory`, tombs out). Blank paper is not a missed day.
 * Fill height carries the count; the red outline is today.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { formatLocalDateKey, formatLocalMonthKey } from '@/lib/time/localDate';
import { buildYearHeatmap, type HeatLevel, type YearHeatCell } from '@/lib/history/yearHeatmap';
import { cn } from '@/lib/utils';

type Log = { completedAt: string; deletedAt?: string | null };

const FILL: Record<HeatLevel, string> = {
  0: 'h-0',
  1: 'h-1/4',
  2: 'h-1/2',
  3: 'h-3/4',
  4: 'h-full',
};

function Cell({ cell }: { cell: YearHeatCell }) {
  return (
    <span
      data-testid="history-year-heat-cell"
      data-date={cell.key}
      data-sessions={cell.sessions}
      data-level={cell.level}
      className={cn(
        'relative block h-3 w-3 border border-border bg-background',
        cell.isToday && 'border-2 border-[hsl(var(--accent-poster))]'
      )}
    >
      {cell.level > 0 ? (
        <span aria-hidden className={cn('absolute inset-x-0 bottom-0 bg-foreground', FILL[cell.level])} />
      ) : null}
    </span>
  );
}

export function HistoryYearHeatmap({ history }: { history: readonly Log[] }) {
  const { t, i18n } = useTranslation();
  const grid = useMemo(() => buildYearHeatmap({ history }), [history]);
  const locale = i18n.language;

  const weekdayInitials = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2026, 5, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' })
      ),
    [locale]
  );

  const summary =
    grid.sessions === 0
      ? t('historyYearHeatEmpty', { defaultValue: 'No sessions in this year.' })
      : t('historyYearHeatSummary', {
          days: grid.trainedDays,
          sessions: grid.sessions,
          defaultValue: '{{days}} days · {{sessions}} sessions',
        });

  const trained = grid.weeks.flatMap((week) => week.cells.filter((cell) => cell.sessions > 0));
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, [grid.endKey]);

  return (
    <figure
      data-testid="history-year-heatmap"
      data-empty={grid.sessions === 0 ? 'true' : 'false'}
      data-sessions={grid.sessions}
      data-days={grid.trainedDays}
      className="space-y-2"
      aria-labelledby="history-year-heat-title"
    >
      <figcaption className="space-y-1">
        <p id="history-year-heat-title" className="text-sm font-semibold text-foreground">
          {t('historyYearHeatLabel', { defaultValue: 'Days you logged' })}
        </p>
        <p className="text-sm tabular-nums text-muted-foreground" data-testid="history-year-heat-summary">
          {summary}
        </p>
      </figcaption>

      <div ref={scroller} className="overflow-x-auto" data-testid="history-year-heat-grid">
        <div className="flex w-max gap-0.5" role="img" aria-label={summary}>
          <div className="flex flex-col gap-0.5 pe-1 pt-4" aria-hidden>
            {weekdayInitials.map((label, i) => (
              <span
                key={i}
                className="flex h-3 items-center text-[10px] font-semibold uppercase text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
          {grid.weeks.map((week) => (
            <div key={week.weekKey} className="flex flex-col gap-0.5">
              <span className="h-4 text-[10px] font-semibold uppercase text-muted-foreground" aria-hidden>
                {week.monthStartKey
                  ? formatLocalMonthKey(week.monthStartKey.slice(0, 7), locale, { month: 'short' })
                  : ''}
              </span>
              {week.cells.map((cell) => (
                <Cell key={cell.key} cell={cell} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-hidden>
        <li>{t('historyYearHeatLegend', { defaultValue: 'More sessions' })}</li>
        {(
          [
            [0, t('historyYearHeatLevel0', { defaultValue: 'None' })],
            [1, t('historyYearHeatLevel1', { defaultValue: '1' })],
            [2, t('historyYearHeatLevel2', { defaultValue: '2' })],
            [3, t('historyYearHeatLevel3', { defaultValue: '3' })],
            [4, t('historyYearHeatLevel4', { defaultValue: '4+' })],
          ] as const
        ).map(([level, label]) => (
          <li key={level} className="flex items-center gap-1">
            <span className="relative block h-3 w-3 border border-border bg-background">
              {level > 0 ? (
                <span className={cn('absolute inset-x-0 bottom-0 bg-foreground', FILL[level])} />
              ) : null}
            </span>
            {label}
          </li>
        ))}
      </ul>

      {trained.length > 0 ? (
        <ul className="sr-only">
          {trained.map((cell) => (
            <li key={cell.key}>
              <Link href={`/history/${cell.key}`}>
                {cell.sessions === 1
                  ? t('historyYearHeatDayOne', {
                      date: formatLocalDateKey(cell.key, locale),
                      defaultValue: '{{date}}, 1 session',
                    })
                  : t('historyYearHeatDay', {
                      date: formatLocalDateKey(cell.key, locale),
                      count: cell.sessions,
                      defaultValue: '{{date}}, {{count}} sessions',
                    })}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
