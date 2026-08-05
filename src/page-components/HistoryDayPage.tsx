'use client';

/**
 * One day, replayed.
 *
 * `.251` — Tesla's VPP dashboard lets you go back to a specific grid event and
 * see what the fleet actually did. This is that pointed at a day the athlete
 * lived: everything logged on it, across every pillar, with the neighbouring
 * days a tap away.
 *
 * The empty state is the part worth care. A day with nothing logged and a day
 * this page **cannot see** look identical to a reader, and only one of them is
 * the athlete's fault — so they say different things.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { hasLoggedWork, useWorkoutStore } from '@/store/workoutStore';
import { buildDayRecord, isDayKey } from '@/lib/journey/dayRecord';
import { sweepDaysWithData } from '@/lib/journey/daysWithData';
import {
  logFromTrainJournalId,
  templateFromCompletedLog,
} from '@/lib/workout/historyRetrain';
import { track } from '@/lib/analytics';
import { formatLocalDateKey } from '@/lib/time/localDate';

const LONG_LOCAL_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
import type { JournalPillar } from '@/lib/todayTrends';

type Props = { date: string };

const PILLAR_LABEL: Record<JournalPillar, string> = {
  train: 'Train',
  fuel: 'Fuel',
  move: 'Move',
  mind: 'Mind',
  track: 'Track',
  learn: 'Learn',
};

export function HistoryDayPage({ date }: Props) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const workoutHistory = useWorkoutStore((s) => s.workoutHistory);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const [tick, setTick] = useState(0);

  // Sweep first: a session logged this visit should be navigable without a
  // reload, and the sweep is idempotent (`.247`).
  useEffect(() => {
    sweepDaysWithData(workoutHistory.map((w) => w.completedAt));
    setTick((n) => n + 1);
  }, [workoutHistory]);

  const record = useMemo(() => {
    void tick;
    return buildDayRecord(date, workoutHistory);
  }, [date, workoutHistory, tick]);

  const valid = isDayKey(date);
  const heading = valid ? formatLocalDateKey(date, i18n.language, LONG_LOCAL_DATE) : date;

  return (
    <PillarPageShell
      icon={CalendarDays}
      title={heading}
      eyebrow={t('historyDayEyebrow', { defaultValue: 'On this day' })}
      subtitle={
        record.index
          ? t('historyDayPosition', {
              index: record.index,
              total: record.total,
              defaultValue: `Day ${record.index} of ${record.total} logged`,
            })
          : ''
      }
    >
      <div className="space-y-4">
        {!valid ? (
          <p className="border-2 border-border p-3 text-sm text-foreground">
            {t('historyDayBadDate', {
              defaultValue: 'That is not a date. Pick a day from your history.',
            })}
          </p>
        ) : record.entries.length === 0 ? (
          /*
            Two different facts, said differently. A day inside the record with
            no entries cannot happen (the record is built from days that hold
            data), so reaching here means the day was never logged — and saying
            "nothing recorded" is true, where "you did nothing" would not be.
          */
          <p className="border-2 border-border p-3 text-sm text-muted-foreground">
            {t('historyDayEmpty', { defaultValue: 'Nothing was recorded on this day.' })}
          </p>
        ) : (
          <ol className="space-y-2">
            {record.entries.map((e) => {
              const trainLog =
                e.pillar === 'train'
                  ? logFromTrainJournalId(e.id, workoutHistory)
                  : null;
              const canRetrain = trainLog ? !!templateFromCompletedLog(trainLog) : false;
              return (
                <li key={e.id} className="border-2 border-border p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {t(`pillar_${e.pillar}`, { defaultValue: PILLAR_LABEL[e.pillar] })}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {new Date(e.at).toLocaleTimeString(i18n.language, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-foreground">{e.title}</div>
                  {e.detail && <div className="text-xs text-muted-foreground">{e.detail}</div>}
                  {canRetrain && trainLog ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 min-h-[44px]"
                      onClick={() => {
                        const template = templateFromCompletedLog(trainLog);
                        if (!template) return;
                        if (hasLoggedWork(activeWorkout)) {
                          router.push('/active');
                          return;
                        }
                        startWorkout(template.name, template.exercises);
                        track('history_train_again', {
                          exerciseCount: template.exercises.length,
                        });
                        router.push('/active');
                      }}
                    >
                      {t('historyTrainAgain', { defaultValue: 'Train this again' })}
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}

        <nav className="flex items-center justify-between gap-2 border-t-2 border-border pt-3">
          {record.previous ? (
            <Link
              href={`/history/${record.previous}`}
              className="flex min-h-[44px] items-center gap-1 border-2 border-border px-3 text-xs text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              {formatLocalDateKey(record.previous, i18n.language, LONG_LOCAL_DATE)}
            </Link>
          ) : (
            <span />
          )}
          {record.next ? (
            <Link
              href={`/history/${record.next}`}
              className="flex min-h-[44px] items-center gap-1 border-2 border-border px-3 text-xs text-foreground"
            >
              {formatLocalDateKey(record.next, i18n.language, LONG_LOCAL_DATE)}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <Link href="/history" className="inline-block text-xs text-primary underline">
          {t('historyDayBack', { defaultValue: 'Back to history' })}
        </Link>
      </div>
    </PillarPageShell>
  );
}
