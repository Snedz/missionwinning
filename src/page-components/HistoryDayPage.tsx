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
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWorkoutStore } from '@/store/workoutStore';
import { buildDayRecord, isDayKey } from '@/lib/journey/dayRecord';
import { sweepDaysWithData } from '@/lib/journey/daysWithData';
import { logFromTrainJournalId } from '@/lib/workout/historyRetrain';
import { decideRepeatThisSession } from '@/lib/workout/repeatThisSession';
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

  const position = record.index
    ? t('historyDayPosition', {
        index: record.index,
        total: record.total,
        defaultValue: `Day ${record.index} of ${record.total} logged`,
      })
    : '';

  return (
    <PillarPageShell
      className="house-history"
      icon={CalendarDays}
      title={heading}
      eyebrow={t('historyDayEyebrow', { defaultValue: 'On this day' })}
      subtitle={position}
    >
      <p className="house-kicker">{t('historyDayEyebrow', { defaultValue: 'On this day' })}</p>
      <h1 className="house-title">{heading}</h1>
      {position ? <p className="house-lede">{position}</p> : null}

      {!valid ? (
        <p className="house-lede">
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
        <EmptyState
          className="house-empty"
          icon={CalendarDays}
          title={t('historyDayEmptyTitle', { defaultValue: 'Nothing logged this day' })}
          description={t('historyDayEmpty', {
            defaultValue: 'Nothing was recorded on this day.',
          })}
          actionLabel={t('historyDayEmptyCta', { defaultValue: 'Open Today' })}
          href="/log"
        />
      ) : (
        <div className="house-list" data-testid="history-day-list">
          {record.entries.map((e) => {
            const trainLog =
              e.pillar === 'train'
                ? logFromTrainJournalId(e.id, workoutHistory)
                : null;
            const canRetrain = trainLog
              ? decideRepeatThisSession({ log: trainLog }).kind !== 'empty'
              : false;
            return (
              <div key={e.id} className="house-item">
                <div className="house-item-body">
                  <span>
                    {t(`pillar_${e.pillar}`, { defaultValue: PILLAR_LABEL[e.pillar] })}
                    {' · '}
                    {new Date(e.at).toLocaleTimeString(i18n.language, {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <strong>{e.title}</strong>
                  {e.detail ? <span>{e.detail}</span> : null}
                </div>
                {canRetrain && trainLog ? (
                  <button
                    type="button"
                    className="house-btn house-btn-ghost"
                    onClick={() => {
                      const decision = decideRepeatThisSession({
                        log: trainLog,
                        active: activeWorkout,
                      });
                      if (decision.kind === 'empty') return;
                      if (decision.kind === 'start') {
                        startWorkout(decision.name, decision.exercises);
                        track('history_train_again', {
                          exerciseCount: decision.exercises.length,
                        });
                      }
                      router.push('/active');
                    }}
                  >
                    {t('historyRepeatSession', { defaultValue: 'Repeat this session' })}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="house-row" style={{ marginTop: 18 }}>
        {record.previous ? (
          <Link href={`/history/${record.previous}`} className="house-btn">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {formatLocalDateKey(record.previous, i18n.language, LONG_LOCAL_DATE)}
          </Link>
        ) : (
          <span />
        )}
        {record.next ? (
          <Link href={`/history/${record.next}`} className="house-btn">
            {formatLocalDateKey(record.next, i18n.language, LONG_LOCAL_DATE)}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>

      <Link href="/history" className="house-btn house-btn-ghost" style={{ marginTop: 12 }}>
        {t('historyDayBack', { defaultValue: 'Back to history' })}
      </Link>
    </PillarPageShell>
  );
}
