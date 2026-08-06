'use client';

/**
 * This week from logs alone — Today's week visual for athletes without a
 * Mission Coach plan (the coach `WeekStrip` needs one to compare against).
 *
 * Same vocabulary as `HistoryCalendar`, week-sized: ink fill + dumbbell =
 * trained, a small ink rule = logged something else, 2px poster outline =
 * today, blank paper otherwise. **No missed state** — `monthGrid.ts` owns the
 * reasoning. "Logged" days come from the `daysWithData` sweeper so this strip
 * cannot disagree with the app's one definition of "the athlete showed up".
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dumbbell } from 'lucide-react';
import type { CompletedWorkoutLog } from '@/types';
import { buildLogWeek, type LogWeekDay } from '@/lib/today/logWeek';
import { trainedDayKeys } from '@/lib/history/monthGrid';
import { localDateKeyFromIso } from '@/lib/time/localDate';
import { cn } from '@/lib/utils';

type Props = { history: CompletedWorkoutLog[] };

export function TodayLogWeekStrip({ history }: Props) {
  const { t, i18n } = useTranslation();
  const [loggedKeys, setLoggedKeys] = useState<ReadonlySet<string>>(() => new Set());

  // The sweep both refreshes and reads the union (idempotent, dedupe-write) —
  // dynamic so the storage sweep stays off the render path.
  useEffect(() => {
    let cancelled = false;
    void import('@/lib/journey/daysWithData').then(({ sweepDaysWithData }) => {
      if (cancelled) return;
      const workoutDates = history.filter((l) => !l.deletedAt).map((l) => l.completedAt);
      setLoggedKeys(new Set(sweepDaysWithData(workoutDates)));
    });
    return () => {
      cancelled = true;
    };
  }, [history]);

  const week = useMemo(() => {
    const trained = trainedDayKeys(history, localDateKeyFromIso);
    return buildLogWeek({ trainedKeys: new Set(trained.keys()), loggedKeys });
  }, [history, loggedKeys]);

  // Derived, not hardcoded — 2026-06-01 is a Monday (HistoryCalendar's anchor).
  const weekdayInitials = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2026, 5, 1 + i).toLocaleDateString(i18n.language, { weekday: 'narrow' })
      ),
    [i18n.language]
  );

  const dayLabel = (day: LogWeekDay) => {
    // A future day claims nothing — not even "nothing logged".
    if (day.isFuture) return day.dateKey;
    if (day.mark === 'trained')
      return `${day.dateKey} — ${t('historyCalTrained', { defaultValue: 'Trained' })}`;
    if (day.mark === 'logged')
      return `${day.dateKey} — ${t('historyCalLogged', { defaultValue: 'Logged activity' })}`;
    return `${day.dateKey} — ${t('historyCalNothing', { defaultValue: 'Nothing logged' })}`;
  };

  return (
    <section
      aria-label={t('todayLogWeekTitle', { defaultValue: 'This week so far' })}
      className="content-card border-border p-4 space-y-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {t('todayLogWeekTitle', { defaultValue: 'This week so far' })}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {week.map((day, i) => {
          const trained = day.mark === 'trained';
          return (
            <div
              key={day.dateKey}
              aria-current={day.isToday ? 'date' : undefined}
              className={cn(
                'flex min-h-[3.25rem] flex-col items-center justify-center border-2 p-1 text-center',
                'border-transparent bg-card',
                trained && 'bg-foreground text-background',
                // Drawn last so it still reads on a filled cell.
                day.isToday && 'border-[hsl(var(--accent-poster))]'
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  trained ? 'text-background' : 'text-muted-foreground'
                )}
              >
                {weekdayInitials[i]}
              </span>
              {trained && <Dumbbell className="mt-1 h-3.5 w-3.5" aria-hidden />}
              {day.mark === 'logged' && <span className="mt-2 h-0.5 w-3 bg-foreground" aria-hidden />}
              <span className="sr-only">{dayLabel(day)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
