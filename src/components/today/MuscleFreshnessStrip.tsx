'use client';
/**
 * Forge-style muscle freshness glance — not a second CTA.
 * See: docs/DESIGN_RESEARCH.md § Wave 3
 */

import { useTranslation } from 'react-i18next';
import { muscleGroupLabel } from '@/lib/readinessDisplay';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { cn } from '@/lib/utils';

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
    <div
      className={cn('flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5', className)}
      role="list"
      aria-label={t('todayMuscleFreshness', { defaultValue: 'Muscle freshness' })}
    >
      {rows.map((row) => {
        const label = muscleGroupLabel(row.group, t);
        const daysLabel =
          row.days === 99
            ? t('todayFreshNew', { defaultValue: 'new' })
            : t('todayFreshDays', { days: row.days, defaultValue: `${row.days}d` });
        return (
          <div
            key={row.group}
            role="listitem"
            className={cn(
              'shrink-0 rounded-xl border px-2.5 py-1.5 min-w-[4.5rem] text-center',
              row.recommended
                ? 'border-brass/40 bg-brass/10'
                : 'border-border/50 bg-muted/20'
            )}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/90">
              {label}
            </div>
            <div
              className={cn(
                'text-[11px] tabular-nums mt-0.5',
                row.recommended ? 'text-brass' : 'text-muted-foreground'
              )}
            >
              {daysLabel}
              {row.recommended && row.days !== 99 ? (
                <span className="ms-1 text-[9px] font-medium uppercase tracking-wider opacity-80">
                  {t('todayFreshRec', { defaultValue: 'REC' })}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
