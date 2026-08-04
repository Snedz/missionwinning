/**
 * Pure projection of desktop ActiveExerciseCard set dial + kind for the open set.
 * Keeps dual nextSet/exIdx matching out of the page map (T2.1 · `.408`).
 */

import type { SetKind } from '@/types';

export type ActiveTableSetControls = {
  setInput: { reps: number; weight: number };
  activeSetKind: SetKind;
  /** True when this card owns the next incomplete set. */
  canEdit: boolean;
};

/**
 * What the desktop table shows for reps/weight/kind on one exercise row.
 * Idle rows get zeros + normal kind (card ignores edits when canEdit is false).
 */
export function resolveActiveTableSetControls(params: {
  nextSet: { exIdx: number; setIdx: number } | null;
  exIdx: number;
  sets: { reps: number; weight: number; kind?: SetKind }[];
  resolveInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { reps: number; weight: number };
}): ActiveTableSetControls {
  const { nextSet, exIdx, sets, resolveInput } = params;
  if (!nextSet || nextSet.exIdx !== exIdx) {
    return {
      setInput: { reps: 0, weight: 0 },
      activeSetKind: 'normal',
      canEdit: false,
    };
  }
  const set = sets[nextSet.setIdx];
  if (!set) {
    return {
      setInput: { reps: 0, weight: 0 },
      activeSetKind: 'normal',
      canEdit: false,
    };
  }
  return {
    setInput: resolveInput(exIdx, nextSet.setIdx, set.reps, set.weight),
    activeSetKind: set.kind ?? 'normal',
    canEdit: true,
  };
}
