/**
 * Unilateral L/R/Alt — optional set annotation on the free logger (.724).
 *
 * Not a SetKind (warmup/drop stay classification). Not a superset pair.
 * Not a feed item. Speech never owns this.
 */

export type SetSide = 'L' | 'R' | 'alt';

export const SET_SIDES: readonly SetSide[] = ['L', 'R', 'alt'];

/** Conservative: id + name haystack. No catalog `unilateral?: boolean` farm. */
const UNILATERAL_RE =
  /lunge|split[\s-]?squat|bulgarian|single[\s-]?(?:leg|arm)|one[\s-]?(?:leg|arm)|pistol|step[\s-]?up|dumbbell[\s-]?row|db[\s-]?row|landmine[\s-]?single|suitcase|cossack|archer|bird[\s-]?dog|clamshell|pallof/i;

export function isUnilateralExercise(exercise: { id: string; name?: string }): boolean {
  const haystack = `${exercise.id} ${exercise.name ?? ''}`;
  return UNILATERAL_RE.test(haystack);
}

export function shouldOfferSetSide(exercise: { id: string; name?: string }): boolean {
  return isUnilateralExercise(exercise);
}

export function parseSetSide(raw: unknown): SetSide | undefined {
  if (raw === 'L' || raw === 'R' || raw === 'alt') return raw;
  return undefined;
}

/** Persist only on unilateral lifts; unknown and bilateral → omit. */
export function persistableSetSide(
  raw: unknown,
  exercise: { id: string; name?: string }
): SetSide | undefined {
  if (!isUnilateralExercise(exercise)) return undefined;
  return parseSetSide(raw);
}

export function suggestNextSide(prev: SetSide | undefined): SetSide | undefined {
  if (prev === 'L') return 'R';
  if (prev === 'R') return 'L';
  if (prev === 'alt') return 'alt';
  return undefined;
}

export function setSideLabelKey(side: SetSide): 'activeSetSideL' | 'activeSetSideR' | 'activeSetSideAlt' {
  if (side === 'L') return 'activeSetSideL';
  if (side === 'R') return 'activeSetSideR';
  return 'activeSetSideAlt';
}

export function setSideDefaultLabel(side: SetSide): string {
  if (side === 'L') return 'L';
  if (side === 'R') return 'R';
  return 'Alt';
}

export type CompletedSetRecord = {
  reps: number;
  weight: number;
  kind: 'normal' | 'warmup' | 'failure' | 'drop';
  rpe?: 'easy' | 'med' | 'hard';
  side?: SetSide;
};

/** History row for one completed set — strips side on bilateral / unknown. */
export function completedLoggedSet(
  s: {
    reps: number;
    weight: number;
    kind?: CompletedSetRecord['kind'];
    rpe?: CompletedSetRecord['rpe'];
    side?: unknown;
  },
  exerciseId: string
): CompletedSetRecord {
  const rec: CompletedSetRecord = {
    reps: s.reps,
    weight: s.weight,
    kind: s.kind ?? 'normal',
    rpe: s.rpe,
  };
  const side = persistableSetSide(s.side, { id: exerciseId, name: exerciseId });
  if (side) rec.side = side;
  return rec;
}
