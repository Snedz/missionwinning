/**
 * TodayDesk concept chip — one glance of Coach plan truth before Start (.1071).
 *
 * Reads the same CoachConcept spine as Victory (.1067): `plan.nextConceptId`
 * or derive from the next open PlanSession. Absent when freestyle / no plan /
 * week complete. Not a Feed. Does not invent loads.
 */

import {
  coachConceptLabel,
  deriveCoachConceptFromSession,
  isCoachConceptId,
  nextOpenPlanSession,
  type CoachConceptId,
} from '@/lib/coach/coachConcept';
import type { CoachPlan } from '@/lib/coach/types';

/** Athlete-facing EN floor — Today i18n wraps `{{concept}}`. */
export const TODAY_CONCEPT_CHIP_DEFAULT = 'Today: {{concept}} · from last log';

export type TodayConceptChip = {
  conceptId: CoachConceptId;
  label: string;
  text: string;
};

/**
 * Next concept when a Coach week still has an open planned/swapped session.
 * Prefers the stamped plan id; otherwise session id; otherwise derive.
 */
export function resolveTodayConceptId(
  plan: CoachPlan | null | undefined
): CoachConceptId | null {
  if (!plan) return null;
  const next = nextOpenPlanSession(plan.sessions);
  if (!next) return null;
  if (isCoachConceptId(plan.nextConceptId)) return plan.nextConceptId;
  if (isCoachConceptId(next.conceptId)) return next.conceptId;
  return deriveCoachConceptFromSession(next);
}

export function formatTodayConceptChip(conceptId: CoachConceptId): string {
  return `Today: ${coachConceptLabel(conceptId)} · from last log`;
}

/** Null when there is no plan, no open session, or the week is complete. */
export function todayConceptChip(
  plan: CoachPlan | null | undefined
): TodayConceptChip | null {
  const conceptId = resolveTodayConceptId(plan);
  if (!conceptId) return null;
  const label = coachConceptLabel(conceptId);
  return {
    conceptId,
    label,
    text: formatTodayConceptChip(conceptId),
  };
}
