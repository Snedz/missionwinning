/**
 * Earn-back verified session rules — pure logic for deciding whether a
 * completed session counts toward an earn-back plan and whether a dispute
 * can still be opened.
 *
 * No chance element, no wearable data, no UI. Locked down to the exact
 * spec in the meridian card.
 */

export type VerifiedSet = {
  exerciseId: string;
  isWorking: boolean;
  reps: number;
};

export type SessionVerdict = {
  counts: boolean;
  missing: string[];
};

/**
 * 72-hour dispute window in milliseconds.
 */
export const DISPUTE_WINDOW_MS = 72 * 60 * 60 * 1000;

/**
 * Decides whether a finished session counts toward an earn-back plan.
 *
 * A planned exercise is satisfied when at least one set has:
 * - the same exerciseId
 * - isWorking === true
 * - reps is an integer >= 1
 *
 * @param plannedExerciseIds - The exercises that were planned for this session
 * @param sets - The sets that were logged in the session
 * @returns SessionVerdict with counts=true only when all planned exercises are satisfied
 */
export function sessionCounts(
  plannedExerciseIds: readonly string[],
  sets: readonly VerifiedSet[]
): SessionVerdict {
  if (plannedExerciseIds.length === 0) {
    return { counts: false, missing: [] };
  }

  // Track which planned exercises are satisfied
  const satisfied = new Set<string>();
  const plannedSet = new Set(plannedExerciseIds);

  for (const set of sets) {
    // Ignore sets for exercises that were not planned
    if (!plannedSet.has(set.exerciseId)) {
      continue;
    }

    // Check if this set satisfies the exercise
    if (set.isWorking && Number.isInteger(set.reps) && set.reps >= 1) {
      satisfied.add(set.exerciseId);
    }
  }

  // Build missing list in first-seen order
  const missing: string[] = [];
  for (const id of plannedExerciseIds) {
    if (!satisfied.has(id)) {
      missing.push(id);
    }
  }

  return {
    counts: missing.length === 0,
    missing,
  };
}

/**
 * Calculates the dispute deadline timestamp from a session end time.
 *
 * @param sessionEndIso - ISO 8601 timestamp of when the session ended
 * @returns Millisecond timestamp of the deadline, or null if the date is invalid
 */
export function disputeDeadline(sessionEndIso: string): number | null {
  const endMs = Date.parse(sessionEndIso);
  if (Number.isNaN(endMs)) {
    return null;
  }
  return endMs + DISPUTE_WINDOW_MS;
}

/**
 * Determines whether a dispute can still be opened for a session.
 *
 * @param sessionEndIso - ISO 8601 timestamp of when the session ended
 * @param nowMs - Current time in milliseconds
 * @returns true only when the deadline is valid and nowMs is within the window
 */
export function canDispute(sessionEndIso: string, nowMs: number): boolean {
  const deadline = disputeDeadline(sessionEndIso);
  if (deadline === null) {
    return false;
  }
  const endMs = Date.parse(sessionEndIso);
  return endMs <= nowMs && nowMs <= deadline;
}
