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
  missed,
}: {
  done: boolean;
  kind: PlanSession['kind'] | undefined;
  /** A missed day is behind you — it must not compete with live days for the eye. */
  missed?: boolean;
}) {
  // A done cell is an ink fill, so its check has to be light or it disappears.
  if (done) {
    return <Check className="mt-1 h-3.5 w-3.5 text-neutral-100" aria-hidden strokeWidth={2.5} />;
  }
  /*
   * `.601` — a missed day drew its glyph in `text-primary`, the same accent a
   * live day uses, directly beside the struck-through label that exists to say
   * the opposite. The strikethrough is the intended calm treatment (`.127`
   * de-emphasises missed days "by border not opacity", because dimming the
   * container also dims the label past 4.5:1); an accent glyph fought it, so
   * the loudest thing in the row was the day the athlete did not train.
   * Muted keeps it readable — "behind you, not hidden from you".
   */
  const tone = missed ? 'text-muted-foreground' : 'text-primary';
  if (kind === 'conditioning') {
    return <Zap className={cn('mt-1 h-3.5 w-3.5', tone)} aria-hidden />;
  }
  if (kind === 'recovery') {
    return <Wind className="mt-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
  }
  return <Dumbbell className={cn('mt-1 h-3.5 w-3.5', tone)} aria-hidden />;
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
              // Seven equal cells. Three states carry everything: ink fill =
              // done, 2px accent outline = today, surface = rest.
              'flex flex-col items-center border-2 p-2 text-center text-[10px] transition-colors',
              'border-transparent bg-card',
              done && 'bg-neutral-900 text-neutral-100',
              // Today's outline is drawn last so it still reads on a done cell.
              isToday && 'border-[hsl(var(--accent-poster))]',
              pulseOffsets.has(i) && 'week-strip-pulse',
              missed && 'border-border bg-transparent',
              // Quieter via border + no glyph, not opacity — dimming the
              // container also dims the day label past 4.5:1 at 10px.
              !session && 'bg-transparent border-border'
            )}
          >
            <span className={cn('font-medium', done ? 'text-neutral-300' : 'text-muted-foreground')}>
              {label}
            </span>
            {session ? (
              <>
                <SessionGlyph done={done} kind={session.kind} missed={missed} />
                {done && (
                  <span className="text-[9px] font-semibold text-neutral-100">
                    {t('coachSessionDone', { defaultValue: 'Done' })}
                  </span>
                )}
                {/* Struck through, per the handoff: a missed day is visibly
                    behind you, not a red alarm. The mockup also annotates where
                    the volume moved ("→ Thu"); the plan engine does not record a
                    reshape target, so that stays out rather than being invented. */}
                {missed && (
                  <span className="text-[9px] text-muted-foreground line-through">
                    {t('coachSessionMissed', { defaultValue: 'Missed' })}
                  </span>
                )}
                {recovery && session.kind === 'recovery' && !done && (
                  <span className="text-[9px] text-muted-foreground">
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
