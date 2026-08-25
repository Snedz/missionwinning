'use client';

/**
 * Quiet Mon–Sun glance on Today. Done days marked. Empty days stay empty.
 * Not a Start. Not the Coach plan row. See: src/components/today/INDEX.md
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatLocalDateKey } from '@/lib/time/localDate';
import type { QuietWeekGlance } from '@/lib/today/quietWeekGlance';

type Props = {
  glance: QuietWeekGlance;
};

export function TodayQuietWeekStrip({ glance }: Props) {
  const { t, i18n } = useTranslation();

  return (
    <section
      data-testid="today-quiet-week"
      aria-label={t('todayQuietWeekLabel', { defaultValue: 'This week' })}
    >
      <div className="grid grid-cols-7 gap-1">
        {glance.days.map((day) => {
          const label = formatLocalDateKey(day.dateKey, i18n.language, {
            weekday: 'short',
          });
          return (
            <div
              key={day.dateKey}
              className={cn(
                'flex flex-col items-center border-2 p-2 text-center text-[10px]',
                'border-transparent bg-transparent',
                day.done && 'bg-neutral-900 text-neutral-100',
                day.isToday && 'border-[hsl(var(--accent-poster))]'
              )}
            >
              <span
                className={cn(
                  'font-medium',
                  day.done ? 'text-neutral-300' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
              {day.done ? (
                <span className="text-[9px] font-semibold text-neutral-100">
                  {t('todayQuietWeekDone', { defaultValue: 'Done' })}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
