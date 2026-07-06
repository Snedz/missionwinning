'use client';
/**
 * Week navigation strip on Coach page.
 * See: src/components/coach/INDEX.md
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlanSession } from '@/lib/coach/types';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = {
  weekStart: string;
  sessions: PlanSession[];
  todayOffset: number;
};

export function WeekStrip({ sessions, todayOffset }: Props) {
  const { t } = useTranslation();
  const [pulseOffsets, setPulseOffsets] = useState<Set<number>>(() => new Set());
  const prevDoneRef = useRef<Map<number, boolean>>(new Map());

  useEffect(() => {
    const nextPulse = new Set<number>();
    sessions.forEach((s) => {
      const wasDone = prevDoneRef.current.get(s.dayOffset);
      const isDone = s.status === 'done';
      if (isDone && !wasDone) nextPulse.add(s.dayOffset);
      prevDoneRef.current.set(s.dayOffset, isDone);
    });
    if (nextPulse.size === 0) return;
    setPulseOffsets(nextPulse);
    const timer = setTimeout(() => setPulseOffsets(new Set()), 400);
    return () => clearTimeout(timer);
  }, [sessions]);

  const byOffset = new Map(sessions.map((s) => [s.dayOffset, s]));

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAY_LABELS.map((label, i) => {
        const session = byOffset.get(i);
        const isToday = i === todayOffset;
        const status = session?.status ?? 'planned';
        const done = status === 'done';
        const missed = status === 'missed';
        const recovery = session?.kind === 'recovery';

        return (
          <div
            key={label}
            className={cn(
              'flex flex-col items-center rounded-lg border p-2 text-center text-[10px] transition-colors',
              isToday && 'ring-2 ring-emerald-500/80 border-emerald-500/40',
              done && 'border-amber-500/40 bg-amber-500/10',
              pulseOffsets.has(i) && 'week-strip-pulse',
              missed && 'opacity-50 border-border/30',
              session?.kind === 'recovery' && 'border-indigo-500/30 bg-indigo-500/10',
              !session && 'border-border/20 opacity-40'
            )}
          >
            <span className="font-medium text-muted-foreground">{label}</span>
            {session ? (
              <>
                <span className={cn('mt-1 font-semibold', done && 'text-amber-400')}>
                  {done ? '✓' : session.kind === 'strength' ? '💪' : session.kind === 'conditioning' ? '⚡' : '🧘'}
                </span>
                {done && (
                  <span className="text-[9px] text-amber-400/80">
                    {t('coachSessionDone', { defaultValue: 'Done' })}
                  </span>
                )}
                {missed && (
                  <span className="text-[9px] text-muted-foreground">
                    {t('coachSessionMissed', { defaultValue: 'Missed' })}
                  </span>
                )}
                {recovery && session.kind === 'recovery' && !done && (
                  <span className="text-[9px] text-indigo-300">Mobility</span>
                )}
              </>
            ) : (
              <span className="mt-1 text-muted-foreground">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
