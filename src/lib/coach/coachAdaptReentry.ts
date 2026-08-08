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

/**
 * The live session this re-entry is advertising, or null for freestyle Just Go.
 *
 * Split out of the boolean below because the banner needed to *start* the very
 * session it was naming, and had no way to name it: it rendered "Start this
 * session" as a bare `<Link href="/active">`, which starts nothing and lands on
 * `ActiveEmptyState` — "No session running". The predicate decided which of two
 * labels to show and neither label was true.
 *
 * One finder, so the label and the thing it starts cannot drift apart.
 */
export function coachAdaptReentrySession<S extends AdaptReentrySession>(
  plan: { sessions: readonly S[] },
  todayOffset: number | undefined
): S | null {
  if (typeof todayOffset !== 'number') return null;
  return (
    plan.sessions.find(
      (s) =>
        s.dayOffset === todayOffset &&
        s.status !== 'done' &&
        (s.exercises?.length ?? 0) > 0
    ) ?? null
  );
}

export function coachAdaptReentryIsPrescribed(
  plan: AdaptReentryPlan,
  todayOffset: number | undefined
): boolean {
  return coachAdaptReentrySession(plan, todayOffset) !== null;
}
