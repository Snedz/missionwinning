'use client';

/**
 * Week session grid on `/coach` — sorted cards + one boss Start (.442).
 */

import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import { resolveCoachBossSessionId } from '@/lib/coach/resolveCoachBossSessionId';
import type { PlanSession } from '@/lib/coach/types';

type Props = {
  sessions: PlanSession[];
  todayOffset: number;
  onAdjustToday: () => void;
  onSwapExercise?: (sessionId: string, fromExerciseId: string, toExerciseId: string) => void;
};

export function CoachPlanSessionGrid({
  sessions,
  todayOffset,
  onAdjustToday,
  onSwapExercise,
}: Props) {
  const bossId = resolveCoachBossSessionId(sessions, todayOffset);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sessions
        .slice()
        .sort((a, b) => a.dayOffset - b.dayOffset)
        .map((session) => {
          const isToday = session.dayOffset === todayOffset;
          return (
            <PlanSessionCard
              key={session.id}
              session={session}
              isToday={isToday}
              isPrimaryStart={session.id === bossId}
              onAdjust={
                isToday && session.status !== 'done' ? onAdjustToday : undefined
              }
              onSwapExercise={
                session.status !== 'done' && onSwapExercise
                  ? (fromId, toId) => onSwapExercise(session.id, fromId, toId)
                  : undefined
              }
            />
          );
        })}
    </div>
  );
}
