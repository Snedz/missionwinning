/**
 * Planned-day miss offer — do it now, skip, or slide.
 *
 * Coach week already paints the hole (`adaptPlan` + WeekStrip). This file is
 * the Today/Coach *choice*: a skippable prompt for an overdue session, without
 * inventing a fail identity. Calendar-gap re-entry (`reentry.ts`) is a
 * different trigger and stays there.
 *
 * Pure and dateless by parameter so it is testable.
 */

export type PlannedMissSession = {
  id: string;
  dayOffset: number;
  status: string;
};

export type PlannedMissPlan<S extends PlannedMissSession = PlannedMissSession> = {
  weekStart: string;
  revision: number;
  sessions: readonly S[];
};

export type PlannedMissOffer<S extends PlannedMissSession = PlannedMissSession> =
  | { show: false; session: null; canSlide: false }
  | { show: true; session: S; canSlide: boolean };

const NONE: PlannedMissOffer = { show: false, session: null, canSlide: false };

function emptyDayFrom(
  occupied: ReadonlySet<number>,
  todayOffset: number
): number | null {
  for (let d = todayOffset; d <= 6; d++) {
    if (!occupied.has(d)) return d;
  }
  return null;
}

function occupiedOffsets<S extends PlannedMissSession>(
  sessions: readonly S[],
  exceptId?: string
): Set<number> {
  const occupied = new Set<number>();
  for (const s of sessions) {
    if (exceptId && s.id === exceptId) continue;
    occupied.add(s.dayOffset);
  }
  return occupied;
}

/**
 * Earliest overdue not-done session, or nothing.
 *
 * No plan / no overdue day → no chrome. One missed planned day → skippable
 * offer. Several overdue days still yield one prompt (the earliest).
 */
export function findPlannedMiss<S extends PlannedMissSession>(
  plan: PlannedMissPlan<S> | null | undefined,
  todayOffset: number,
  opts?: { weekStart?: string }
): PlannedMissOffer<S> {
  if (!plan || !Array.isArray(plan.sessions) || plan.sessions.length === 0) {
    return NONE as PlannedMissOffer<S>;
  }
  if (opts?.weekStart && plan.weekStart !== opts.weekStart) {
    return NONE as PlannedMissOffer<S>;
  }
  if (!Number.isFinite(todayOffset) || todayOffset < 0) {
    return NONE as PlannedMissOffer<S>;
  }

  const overdue = plan.sessions
    .filter((s) => s.dayOffset < todayOffset && s.status !== 'done')
    .slice()
    .sort((a, b) => a.dayOffset - b.dayOffset);
  const session = overdue[0];
  if (!session) return NONE as PlannedMissOffer<S>;

  const dest = emptyDayFrom(occupiedOffsets(plan.sessions, session.id), todayOffset);
  return { show: true, session, canSlide: dest !== null };
}

/**
 * Quiet drop. Must not stamp `missed` or any fail identity — skip is not a
 * verdict. The week strip hole becomes the existing empty-day dash.
 */
export function applyPlannedMissSkip<P extends PlannedMissPlan>(
  plan: P,
  sessionId: string
): P {
  if (!plan.sessions.some((s) => s.id === sessionId)) return plan;
  return {
    ...plan,
    revision: plan.revision + 1,
    sessions: plan.sessions.filter((s) => s.id !== sessionId) as P['sessions'],
  };
}

/**
 * Athlete-chosen slide: that session moves to the next empty day as `planned`.
 * No empty slot → unchanged (caller should have hidden Slide).
 */
export function applyPlannedMissSlide<P extends PlannedMissPlan>(
  plan: P,
  sessionId: string,
  todayOffset: number
): P {
  const session = plan.sessions.find((s) => s.id === sessionId);
  if (!session) return plan;
  const dest = emptyDayFrom(occupiedOffsets(plan.sessions, sessionId), todayOffset);
  if (dest === null) return plan;
  return {
    ...plan,
    revision: plan.revision + 1,
    sessions: plan.sessions.map((s) =>
      s.id === sessionId ? { ...s, dayOffset: dest, status: 'planned' } : s
    ) as P['sessions'],
  };
}
