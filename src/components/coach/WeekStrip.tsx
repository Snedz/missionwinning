'use client';
/**
 * Week navigation strip on Coach page.
 * See: src/components/coach/INDEX.md
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Dumbbell, Wind, Zap } from 'lucide-react';
import type { PlanSession } from '@/lib/coach/types';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Props = {
  weekStart: string;
  sessions: PlanSession[];
  todayOffset: number;
};

function SessionGlyph({
  done,
  kind,
}: {
  done: boolean;
  kind: PlanSession['kind'] | undefined;
}) {
  if (done) {
    return <Check className="mt-1 h-3.5 w-3.5 text-brass" aria-hidden strokeWidth={2.5} />;
  }
  if (kind === 'conditioning') {
    return <Zap className="mt-1 h-3.5 w-3.5 text-primary" aria-hidden />;
  }
  if (kind === 'recovery') {
    return (
      <Wind className="mt-1 h-3.5 w-3.5 text-[hsl(var(--status-info))]" aria-hidden />
    );
  }
  return <Dumbbell className="mt-1 h-3.5 w-3.5 text-primary" aria-hidden />;
}

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
              isToday && 'ring-2 ring-[hsl(var(--accent-poster))] bg-tint border-primary/40',
              done && 'border-brass/40 bg-brass/10',
              pulseOffsets.has(i) && 'week-strip-pulse',
              missed && 'border-border/30 bg-muted/20',
              session?.kind === 'recovery' &&
                !done &&
                'border-[hsl(var(--status-info)/0.35)] bg-[hsl(var(--status-info)/0.1)]',
              // Quieter via border + no glyph, not opacity — dimming the
              // container also dims the day label past 4.5:1 at 10px.
              !session && 'border-border/20'
            )}
          >
            <span className="font-medium text-muted-foreground">{label}</span>
            {session ? (
              <>
                <SessionGlyph done={done} kind={session.kind} />
                {done && (
                  <span className="text-[9px] text-brass/90">
                    {t('coachSessionDone', { defaultValue: 'Done' })}
                  </span>
                )}
                {missed && (
                  <span className="text-[9px] text-muted-foreground">
                    {t('coachSessionMissed', { defaultValue: 'Missed' })}
                  </span>
                )}
                {recovery && session.kind === 'recovery' && !done && (
                  <span className="text-[9px] text-[hsl(var(--status-info))]">
                    {t('coachSessionMobility', { defaultValue: 'Mobility' })}
                  </span>
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
