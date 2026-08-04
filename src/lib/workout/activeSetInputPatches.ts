/**
 * Pure field patches for Active set inputs (Use next, plate calc, Apply targets).
 * Page applies them via updateSetInput — T2.1 · `.407`.
 */

export type SetInputField = 'reps' | 'weight';

export type SetInputFieldPatch = {
  field: SetInputField;
  value: number;
};

/** One-tap progressive-overload / coach next into reps·weight. */
export function patchesForUseNext(target: {
  reps: number;
  weight: number;
}): SetInputFieldPatch[] {
  return [
    { field: 'reps', value: target.reps },
    { field: 'weight', value: target.weight },
  ];
}

/** Plate calculator applies load only. */
export function patchesForPlateWeight(weight: number): SetInputFieldPatch[] {
  return [{ field: 'weight', value: weight }];
}

/**
 * Apply-targets result → per-set patches (reps then weight, same order as
 * the historic dual updateSetInput calls).
 */
export function patchesForApplyTargets(
  targets: { setIdx: number; reps: number; weight: number }[]
): { setIdx: number; patches: SetInputFieldPatch[] }[] {
  return targets.map((t) => ({
    setIdx: t.setIdx,
    patches: patchesForUseNext({ reps: t.reps, weight: t.weight }),
  }));
}

/**
 * Plate sheet initial target = current console dial weight for next open set.
 */
export function plateCalcInitialWeight(params: {
  nextSet: { exIdx: number; setIdx: number } | null;
  exercises:
    | { sets: { reps: number; weight: number }[] }[]
    | null
    | undefined;
  resolveInput: (
    exIdx: number,
    setIdx: number,
    defaultReps: number,
    defaultWeight: number
  ) => { weight: number };
}): number | undefined {
  if (!params.nextSet || !params.exercises) return undefined;
  const set = params.exercises[params.nextSet.exIdx]?.sets[params.nextSet.setIdx];
  if (!set) return undefined;
  return params.resolveInput(
    params.nextSet.exIdx,
    params.nextSet.setIdx,
    set.reps,
    set.weight
  ).weight;
}

/**
 * Desktop/sheet add-exercise confirm: return catalog id to add, or null when empty.
 */
export function resolveAddExerciseId(selectedId: string): string | null {
  const id = selectedId.trim();
  return id.length > 0 ? id : null;
}
