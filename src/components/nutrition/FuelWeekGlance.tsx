'use client';

import { useTranslation } from 'react-i18next';
import type { NutritionDaySummary } from '@/lib/nutritionQuickLog';
import { cn } from '@/lib/utils';

type Props = {
  days: NutritionDaySummary[];
  todayIso: string;
  targetCals: number;
};

/** Compact 7-day calorie bars from local nutrition history. */
export function FuelWeekGlance({ days, todayIso, targetCals }: Props) {
  const { t, i18n } = useTranslation();
  if (!days.some((d) => d.entries > 0)) return null;

  const maxBar = Math.max(targetCals, ...days.map((d) => d.cals), 1);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 px-3 py-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {t('fuelWeekGlance', { defaultValue: 'Last 7 days' })}
      </p>
      <div className="flex items-end justify-between gap-1 min-h-[4.5rem]">
        {days.map((d) => {
          const h = Math.max(4, Math.round((d.cals / maxBar) * 64));
          const isToday = d.date === todayIso;
          const over = d.cals > targetCals && d.entries > 0;
          const label = new Date(`${d.date}T12:00:00`).toLocaleDateString(i18n.language, {
            weekday: 'narrow',
          });
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] tabular-nums text-muted-foreground truncate max-w-full">
                {d.entries > 0 ? d.cals : '—'}
              </span>
              <div
                className={cn(
                  'w-full max-w-[1.75rem] rounded-t-md transition-all',
                  d.entries === 0
                    ? 'bg-muted/40'
                    : over
                      ? 'bg-status-warn/70'
                      : isToday
                        ? 'bg-primary'
                        : 'bg-primary/50'
                )}
                style={{ height: d.entries === 0 ? 4 : h }}
                title={`${d.date}: ${d.cals} kcal · ${d.protein}g P`}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isToday ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
