export type ProposedTarget = { exerciseId: string; weight: number | null; reps: number | null };

export type AcceptedTarget = { exerciseId: string; weight: number | null; reps: number | null; acceptedAt: string };

export type AcceptResult =
  | { ok: true; targets: AcceptedTarget[] }
  | { ok: false; reason: string; targets: AcceptedTarget[] };

/**
 * Merges athlete-accepted next-session targets (weight/reps per exercise) into a
 * next-session target map. Rejects empty or invalid proposals; never invents exercises.
 *
 * @param current - The existing accepted targets (may be empty)
 * @param proposed - The new proposed targets from the athlete
 * @param acceptedAt - ISO timestamp of when the acceptance occurred
 * @returns AcceptResult with either the merged targets or an error with current targets preserved
 */
export function acceptNextTargets(
  current: readonly AcceptedTarget[],
  proposed: readonly ProposedTarget[],
  acceptedAt: string
): AcceptResult {
  // 1. Validate acceptedAt
  if (Number.isNaN(Date.parse(acceptedAt))) {
    return { ok: false, reason: 'invalid acceptedAt', targets: [...current] };
  }

  // 2. Empty proposal check
  if (proposed.length === 0) {
    return { ok: false, reason: 'empty proposal', targets: [...current] };
  }

  // 3. Build a Map from current keyed by exerciseId (later duplicates in current win)
  const targetMap = new Map<string, AcceptedTarget>();
  for (const target of current) {
    if (!targetMap.has(target.exerciseId)) {
      targetMap.set(target.exerciseId, { ...target });
    }
  }

  // 4. Process each proposed target
  let appliedCount = 0;
  for (const prop of proposed) {
    // Skip when exerciseId is missing/empty/non-string
    if (!prop.exerciseId || typeof prop.exerciseId !== 'string') {
      continue;
    }

    // Skip when both weight and reps are null
    if (prop.weight === null && prop.reps === null) {
      continue;
    }

    // Skip when weight is not null and (not finite or < 0)
    if (prop.weight !== null && (!Number.isFinite(prop.weight) || prop.weight < 0)) {
      continue;
    }

    // Skip when reps is not null and (not an integer or < 1)
    if (prop.reps !== null && (!Number.isInteger(prop.reps) || prop.reps < 1)) {
      continue;
    }

    // Upsert into the map
    targetMap.set(prop.exerciseId, {
      exerciseId: prop.exerciseId,
      weight: prop.weight,
      reps: prop.reps,
      acceptedAt,
    });
    appliedCount += 1;
  }

  // 5. If nothing from proposed was applied
  if (appliedCount === 0) {
    return { ok: false, reason: 'no valid targets', targets: [...current] };
  }

  // 6. Return ok with targets in map insertion order
  return { ok: true, targets: [...targetMap.values()] };
}
