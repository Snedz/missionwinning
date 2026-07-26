'use client';
/**
 * Muscle freshness — one ruled row per group, not a horizontal chip scroller.
 *
 * The chips were `rounded-xl` boxes with a 1px border at 50% alpha on a
 * `bg-muted/20` fill, scrolling sideways inside a `<details>` that was itself
 * a 1px hairline at 40%. Three levels of container around eight facts. Rows
 * read down the page at the width the page already has, and the meter says
 * "how recovered" in the same visual language as every other budget in the app.
 *
 * The four-day boundary is `muscleFreshnessRows`' own (`days >= 4`), not a
 * threshold invented here for display.
 */

import { useTranslation } from 'react-i18next';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { cn } from '@/lib/utils';

/** Days at which `muscleFreshnessRows` calls a group recovered. */
const FRESH_AT_DAYS = 4;

export type FreshnessRow = {
  group: MuscleGroup;
  days: number;
  recommended: boolean;
};

type Props = {
  rows: FreshnessRow[];
  className?: string;
};

export function MuscleFreshnessStrip({ rows, className }: Props) {
  const { t } = useTranslation();

  return (
    <ul
      className={cn('border-t-2 border-border', className)}
      aria-label={t('todayMuscleFreshness', { defaultValue: 'Muscle freshness' })}
    >
      {rows.map((row) => {
        const label = muscleGroupLabel(row.group, t);
        const never = row.days === 99;
        const pct = never ? 100 : Math.round((Math.min(row.days, FRESH_AT_DAYS) / FRESH_AT_DAYS) * 100);
        const state = never
          ? t('todayFreshNew', { defaultValue: 'new' })
          : row.recommended
            ? t('todayFreshReady', { defaultValue: 'ready' })
            : t('todayFreshRecovering', { defaultValue: 'recovering' });

        return (
          <li
            key={row.group}
            className="flex items-center gap-3 border-b border-border py-2.5"
          >
            <span className="w-24 shrink-0 truncate text-sm font-semibold">{label}</span>
            <span
              className={cn(
                'w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em]',
                row.recommended ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {state}
            </span>
            <span className="h-2 flex-1 bg-neutral-300" aria-hidden>
              <span
                className="block h-full bg-primary-fill transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
              {never ? '—' : t('todayFreshDays', { days: row.days, defaultValue: `${row.days}d` })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
