/**
 * CoachConcept — discrete training intent before Coach/Victory words (.1067).
 * NCP apply: concept-first, no foundation-model weights.
 */

import type { PlanSession, SessionKind } from '@/lib/coach/types';

/** Stable concept codes. Extend only with Kaizen LGTM. */
export const COACH_CONCEPT_IDS = [
  'strength',
  'conditioning',
  'recovery',
  'strength-push',
  'strength-pull',
  'strength-legs',
  'strength-upper',
  'strength-lower',
  'strength-full',
] as const;

export type CoachConceptId = (typeof COACH_CONCEPT_IDS)[number];

const PUSH = new Set(['Chest', 'Shoulders', 'Triceps']);
const PULL = new Set(['Back', 'Biceps', 'Rear Delts', 'Traps']);
const LEGS = new Set(['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Hips']);

export function isCoachConceptId(value: unknown): value is CoachConceptId {
  return (
    typeof value === 'string' &&
    (COACH_CONCEPT_IDS as readonly string[]).includes(value)
  );
}

/** Athlete-facing EN label — Victory may i18n later. */
export function coachConceptLabel(id: CoachConceptId): string {
  switch (id) {
    case 'strength':
      return 'Strength';
    case 'conditioning':
      return 'Conditioning';
    case 'recovery':
      return 'Recovery';
    case 'strength-push':
      return 'Push';
    case 'strength-pull':
      return 'Pull';
    case 'strength-legs':
      return 'Legs';
    case 'strength-upper':
      return 'Upper';
    case 'strength-lower':
      return 'Lower';
    case 'strength-full':
      return 'Full body';
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function kindBase(kind: SessionKind): CoachConceptId {
  if (kind === 'conditioning') return 'conditioning';
  if (kind === 'recovery') return 'recovery';
  return 'strength';
}

/**
 * Derive a concept from an existing plan session — never invents loads.
 * Uses kind + focusGroups only.
 */
export function deriveCoachConceptFromSession(
  session: Pick<PlanSession, 'kind' | 'focusGroups' | 'name'>
): CoachConceptId {
  const base = kindBase(session.kind);
  if (base !== 'strength') return base;

  const groups = session.focusGroups ?? [];
  if (groups.length === 0) return 'strength';

  const push = groups.filter((g) => PUSH.has(g)).length;
  const pull = groups.filter((g) => PULL.has(g)).length;
  const legs = groups.filter((g) => LEGS.has(g)).length;

  // Name hints (existing plan names often say Push/Pull/Legs)
  const name = (session.name || '').toLowerCase();
  if (/\bpush\b/.test(name)) return 'strength-push';
  if (/\bpull\b/.test(name)) return 'strength-pull';
  if (/\blegs?\b/.test(name)) return 'strength-legs';
  if (/\bupper\b/.test(name)) return 'strength-upper';
  if (/\blower\b/.test(name)) return 'strength-lower';
  if (/\bfull\b/.test(name)) return 'strength-full';

  if (legs > 0 && push === 0 && pull === 0) return 'strength-legs';
  if (push > 0 && pull === 0 && legs === 0) return 'strength-push';
  if (pull > 0 && push === 0 && legs === 0) return 'strength-pull';
  if (push > 0 && pull > 0 && legs === 0) return 'strength-upper';
  if (legs > 0 && (push > 0 || pull > 0)) return 'strength-full';
  if (legs > 0) return 'strength-lower';
  return 'strength';
}

/** Victory muted cite — concept before the “from this workout” claim. */
export function formatVictoryNextEnvCite(conceptId?: CoachConceptId | null): string {
  if (conceptId && isCoachConceptId(conceptId)) {
    return `Next: ${coachConceptLabel(conceptId)} · updated from this workout`;
  }
  return 'Next session updated from this workout';
}

/** First remaining planned/swapped session after adapt, if any. */
export function nextOpenPlanSession(
  sessions: PlanSession[]
): PlanSession | undefined {
  return sessions.find((s) => s.status === 'planned' || s.status === 'swapped');
}
