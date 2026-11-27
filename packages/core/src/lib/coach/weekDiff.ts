/**
 * The Coach week as a visible proposal — session-count change + the stored log fact.
 *
 * H-02: the adapt banner asserted that the week changed. That assertion is the
 * thing that goes away. The replacement is the numbers the engine already made
 * (`adaptPlan` marks a miss; remaining working sessions drop) plus a quotation
 * from `logCitation.ts`. Nothing here invents a count or a set.
 *
 * Reconstruction is honest because adapt keeps missed sessions on the week
 * (see `adapt.ts`). `before = working + missed`, `after = working`.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import {
  COACH_CITATION_COPY,
  coachCitationFact,
  coachLogCitation,
  type CoachLogCitation,
} from '@/lib/coach/logCitation';

export type SessionCountChange = {
  beforeCount: number;
  afterCount: number;
};

export type CoachWeekDiff = {
  beforeCount: number;
  afterCount: number;
  line: string;
  citation: CoachLogCitation;
  fact: string | null;
};

/** Sessions the athlete still has — missed is the record, not the remaining week. */
export function workingSessionCount(sessions: readonly Pick<PlanSession, 'status'>[]): number {
  return sessions.filter((s) => s.status !== 'missed').length;
}

/**
 * Session-count change encoded on the current plan. Does not invent a previous
 * week; it reads the statuses `adaptPlan` already wrote.
 */
export function sessionCountChangeFromPlan(plan: CoachPlan): SessionCountChange {
  const afterCount = workingSessionCount(plan.sessions);
  const missed = plan.sessions.filter((s) => s.status === 'missed').length;
  return { beforeCount: afterCount + missed, afterCount };
}

/**
 * The same pair, taken from the engine's before/after plans. The banner
 * reconstruction must match this — otherwise we are narrating a different week.
 */
export function sessionCountChangeFromEngine(
  before: CoachPlan,
  after: CoachPlan
): SessionCountChange {
  return {
    beforeCount: workingSessionCount(before.sessions),
    afterCount: workingSessionCount(after.sessions),
  };
}

export function formatCoachWeekDiffLine(
  beforeCount: number,
  afterCount: number,
  fact: string | null
): string {
  const left = beforeCount === 1 ? '1 session' : `${beforeCount} sessions`;
  const counts = `${left} → ${afterCount}`;
  if (!fact) return counts;
  return `${counts}. ${COACH_CITATION_COPY.fromLog.replace('{{fact}}', fact)}`;
}

/**
 * Null when the plan does not encode a session-count change — H-08 already
 * refuses an order-only banner; this refuses a count-only story that did not
 * happen. The citing fact is optional (`no-logs` is a first-class answer).
 */
export function buildCoachWeekDiff(
  plan: CoachPlan,
  history: CompletedWorkoutLog[],
  opts: { lang?: string; unitLabel?: string; now?: Date } = {}
): CoachWeekDiff | null {
  const change = sessionCountChangeFromPlan(plan);
  if (change.beforeCount === change.afterCount) return null;
  const citation = coachLogCitation(history, opts.now);
  const fact = coachCitationFact(citation, opts.lang ?? 'en', opts.unitLabel ?? 'kg');
  return {
    ...change,
    citation,
    fact,
    line: formatCoachWeekDiffLine(change.beforeCount, change.afterCount, fact),
  };
}
