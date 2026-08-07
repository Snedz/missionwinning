'use client';

import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type Props = {
  streak: number;
  variant?: 'inline' | 'stat';
  className?: string;
};

/** Shared training-streak display — streak value is prop-driven (no data fetch). */
export function StreakChip({ streak, variant = 'inline', className }: Props) {
  const { t } = useTranslation();
  if (streak <= 0 && variant === 'inline') return null;

  if (variant === 'stat') {
    return (
      <span className={cn('inline-flex items-baseline gap-1', className)}>
        <span className="text-3xl font-semibold tabular-nums">{streak}</span>
        <span className="text-lg font-normal text-muted-foreground">
          {t('todayStatDays', { defaultValue: 'days' })}
        </span>
      </span>
    );
  }

  // A square accent tag, per the handoff's `tag tag-accent` — a streak is a
  // standing fact about you, and reads better as a label than as a sentence.
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] tabular-nums text-accent-900',
        className
      )}
    >
      <Flame className="h-3 w-3" aria-hidden />
      {t('todayDayStreak', { count: streak, defaultValue: `${streak}-day streak` })}
    </span>
  );
}
