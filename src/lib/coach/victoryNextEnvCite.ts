/**
 * Victory next-env cite — honest when Coach adapt refreshed a next session
 * from the workout just finished.
 *
 * Adapt already owns the write (`adaptPlan` + `markSessionsFromExternalWorkouts`).
 * Finish runs that path synchronously so Victory can cite it; no invented loads,
 * no Feed. `.1067` adds concept-first cite via CoachConcept / nextConceptId.
 */

import type { CompletedWorkoutLog } from '@/types';
import { adaptPlan, sessionsMateriallyEqual } from '@/lib/coach/adapt';
import {
  deriveCoachConceptFromSession,
  formatVictoryNextEnvCite,
  nextOpenPlanSession,
  type CoachConceptId,
} from '@/lib/coach/coachConcept';
import { readLocalCoachContext } from '@/lib/coach/contextBuilder';
import {
  getOrCreateDeviceId,
  loadPlan,
  savePlan,
} from '@/lib/coach/storage';
import type { CoachPlan } from '@/lib/coach/types';
import { historyForWeek } from '@/lib/workout/startHistoryFrom';
import { localDateKey } from '@/lib/time/localDate';

/** Athlete-facing EN floor — keep plain; Victory i18n may wrap later. */
export const VICTORY_NEXT_ENV_CITE_DEFAULT =
  'Next session updated from this workout';

export { formatVictoryNextEnvCite };

/**
 * True only when adapt materially changed the week **because this log marked a
 * session done**, and a next planned/swapped session remains.
 *
 * Miss/readiness-only adaptations do not earn the cite — that would invent a
 * "from this workout" claim.
 */
export function didAdaptWriteNextEnvFromLog(input: {
  before: CoachPlan | null;
  after: CoachPlan;
}): boolean {
  const { before, after } = input;
  if (!before) return false;
  if (sessionsMateriallyEqual(before.sessions, after.sessions)) return false;

  const beforeDone = new Set(
    before.sessions.filter((s) => s.status === 'done').map((s) => s.id)
  );
  const newlyDone = after.sessions.some(
    (s) => s.status === 'done' && !beforeDone.has(s.id)
  );
  if (!newlyDone) return false;

  return after.sessions.some(
    (s) => s.status === 'planned' || s.status === 'swapped'
  );
}

function stampNextConcept(plan: CoachPlan): {
  plan: CoachPlan;
  nextConceptId?: CoachConceptId;
} {
  const nextSession = nextOpenPlanSession(plan.sessions);
  if (!nextSession) return { plan };
  const nextConceptId =
    nextSession.conceptId ?? deriveCoachConceptFromSession(nextSession);
  const sessions = plan.sessions.map((s) =>
    s.id === nextSession.id ? { ...s, conceptId: nextConceptId } : s
  );
  return {
    plan: { ...plan, sessions, nextConceptId },
    nextConceptId,
  };
}

/**
 * Run the same adapt path `useCoachPlan.refresh` would after history gains this
 * log. Persist only when revision moves. Returns whether Victory may show the cite
 * and the concept id for a concept-first muted line (.1067).
 */
export function adaptPlanAfterFinishedLog(input: {
  historyAfter: CompletedWorkoutLog[];
  today?: string;
}): {
  wroteNextEnv: boolean;
  plan: CoachPlan | null;
  nextConceptId?: CoachConceptId;
  citeText?: string;
} {
  const existing = loadPlan();
  if (!existing) return { wroteNextEnv: false, plan: null };

  const base = readLocalCoachContext(historyForWeek(input.historyAfter));
  const ctx = { ...base, seedId: base.seedId ?? getOrCreateDeviceId() };
  let next = adaptPlan(existing, ctx, input.today ?? localDateKey());
  const wroteNextEnv = didAdaptWriteNextEnvFromLog({
    before: existing,
    after: next,
  });

  let nextConceptId: CoachConceptId | undefined;
  if (wroteNextEnv) {
    const stamped = stampNextConcept(next);
    next = stamped.plan;
    nextConceptId = stamped.nextConceptId;
  }

  if (next.revision !== existing.revision || wroteNextEnv) {
    // Persist concept stamp even when revision already moved in adaptPlan.
    if (wroteNextEnv && next.revision === existing.revision) {
      next = { ...next, revision: existing.revision + 1 };
    }
    savePlan(next);
  }

  return {
    wroteNextEnv,
    plan: next,
    nextConceptId,
    citeText: wroteNextEnv
      ? formatVictoryNextEnvCite(nextConceptId)
      : undefined,
  };
}
