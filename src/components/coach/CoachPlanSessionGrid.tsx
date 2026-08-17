'use client';

/**
 * Week session grid on `/coach`. Sheet mode is the one Start. Week mode is Show all.
 */

import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import {
  coachSheetSessions,
  resolveCoachBossSessionId,
} from '@/lib/coach/resolveCoachBossSessionId';
import type { SessionRationaleHints } from '@/lib/coach/sessionRationale';
import type { PlanSession } from '@/lib/coach/types';

type Props = {
  sessions: PlanSession[];
  todayOffset: number;
  onAdjustToday: () => void;
  onSwapExercise?: (sessionId: string, fromExerciseId: string, toExerciseId: string) => void;
  /**
   * Log-derived hints for boss-session “why this session” (`.699`).
   * Only the primary Start card paints; other days stay quiet.
   */
  rationaleHints?: SessionRationaleHints;
  /** sheet — first paint, the one session. week — Show all. */
  mode?: 'week' | 'sheet';
};

export function CoachPlanSessionGrid({
  sessions,
  todayOffset,
  onAdjustToday,
  onSwapExercise,
  rationaleHints,
  mode = 'week',
}: Props) {
  const bossId = resolveCoachBossSessionId(sessions, todayOffset);
  const rows =
    mode === 'sheet'
      ? coachSheetSessions(sessions, todayOffset)
      : sessions.slice().sort((a, b) => a.dayOffset - b.dayOffset);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((session) => {
        const isToday = session.dayOffset === todayOffset;
        return (
          <PlanSessionCard
            key={session.id}
            session={session}
            isToday={isToday}
            isPrimaryStart={session.id === bossId}
            rationaleHints={rationaleHints}
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
