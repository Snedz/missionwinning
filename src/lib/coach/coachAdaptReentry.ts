/**
 * Pure: should adapt-banner re-entry advertise the coach session vs freestyle Just Go?
 * Kept separate so UI cannot re-lie without a failing test (same contract as justGoHeroMeta).
 */

export type AdaptReentrySession = {
  dayOffset: number;
  status: string;
  exercises: readonly unknown[];
};

export type AdaptReentryPlan = {
  sessions: readonly AdaptReentrySession[];
};

export function coachAdaptReentryIsPrescribed(
  plan: AdaptReentryPlan,
  todayOffset: number | undefined
): boolean {
  if (typeof todayOffset !== 'number') return false;
  const today = plan.sessions.find(
    (s) =>
      s.dayOffset === todayOffset &&
      s.status !== 'done' &&
      (s.exercises?.length ?? 0) > 0
  );
  return !!today;
}
