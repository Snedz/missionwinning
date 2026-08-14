'use client';

/**
 * Week session grid on `/coach` — sorted cards + one boss Start (.442).
 */

import { PlanSessionCard } from '@/components/coach/PlanSessionCard';
import { resolveCoachBossSessionId } from '@/lib/coach/resolveCoachBossSessionId';
import type { SessionRationaleHints } from '@/lib/coach/sessionRationale';
import type { PlanSession } from '@/lib/coach/types';

type Props = {
  sessions: PlanSession[];
  todayOffset: number;
  onAdjustToday: () => void;
  /**
   * Log-derived hints for boss-session “why this session” (`.699`).
   * Only the primary Start card paints; other days stay quiet.
   */
  rationaleHints?: SessionRationaleHints;
};

export function CoachPlanSessionGrid({
  sessions,
  todayOffset,
  onAdjustToday,
  rationaleHints,
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
              rationaleHints={rationaleHints}
              onAdjust={
                isToday && session.status !== 'done' ? onAdjustToday : undefined
              }
            />
          );
        })}
    </div>
  );
}
