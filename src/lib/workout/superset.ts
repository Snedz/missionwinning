/** Light pairing — two consecutive exercises share a rest; numbered A1/A2. */

import type { ActiveExerciseLog } from '@/types';

function stripGroup(ex: ActiveExerciseLog): ActiveExerciseLog {
  const { supersetGroup: _, ...rest } = ex;
  return rest;
}

/** Indices that share this exercise's group id (self only when unpaired). */
export function getSupersetPeers(exercises: ActiveExerciseLog[], exIdx: number): number[] {
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return [exIdx];
  return exercises.map((_, i) => i).filter((i) => exercises[i].supersetGroup === group);
}

/**
 * Pair groups in first-seen order. Lone leftovers (orphan after a delete) are
 * not a pair — they get no mark.
 */
function pairGroups(exercises: ActiveExerciseLog[]): number[][] {
  const seen = new Set<string>();
  const groups: number[][] = [];
  for (let i = 0; i < exercises.length; i++) {
    const group = exercises[i]?.supersetGroup;
    if (!group || seen.has(group)) continue;
    seen.add(group);
    const indices = exercises
      .map((_, j) => j)
      .filter((j) => exercises[j].supersetGroup === group);
    if (indices.length >= 2) groups.push(indices);
  }
  return groups;
}

/** set-table pair mark: first pair is A1/A2, second is B1/B2. */
export function pairMark(exercises: ActiveExerciseLog[], exIdx: number): string | null {
  const groups = pairGroups(exercises);
  const gi = groups.findIndex((g) => g.includes(exIdx));
  if (gi < 0) return null;
  const slot = groups[gi].indexOf(exIdx);
  return `${String.fromCharCode(65 + gi)}${slot + 1}`;
}

/** Alias — callers that asked for `SS A` now get `A1`. */
export function supersetLabel(exercises: ActiveExerciseLog[], exIdx: number): string | null {
  return pairMark(exercises, exIdx);
}

/**
 * Pair exactly two consecutive exercises. Prior partners of either are cleared
 * so this cannot grow into a giant set.
 */
export function pairWithNext(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  groupId = `ss-${Date.now()}`
): ActiveExerciseLog[] {
  const nextIdx = exIdx + 1;
  if (nextIdx >= exercises.length || exIdx < 0) return exercises;
  const oldA = exercises[exIdx]?.supersetGroup;
  const oldB = exercises[nextIdx]?.supersetGroup;
  return exercises.map((ex, i) => {
    if (i === exIdx || i === nextIdx) {
      return { ...ex, supersetGroup: groupId };
    }
    if (ex.supersetGroup && (ex.supersetGroup === oldA || ex.supersetGroup === oldB)) {
      return stripGroup(ex);
    }
    return ex;
  });
}

/** Clear the group on every peer — unlink must not leave an orphan. */
export function unpair(exercises: ActiveExerciseLog[], exIdx: number): ActiveExerciseLog[] {
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return exercises;
  return exercises.map((ex) => (ex.supersetGroup === group ? stripGroup(ex) : ex));
}

export function advanceAfterLog(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  setIdx: number
): { exerciseIndex: number; setIndex: number } | null {
  const group = exercises[exIdx]?.supersetGroup;
  if (group) {
    const peers = getSupersetPeers(exercises, exIdx);
    for (const pi of peers) {
      if (pi === exIdx) continue;
      const peerSet = exercises[pi]?.sets[setIdx];
      if (peerSet && !peerSet.completed) {
        return { exerciseIndex: pi, setIndex: setIdx };
      }
    }
    // Pair round done — next incomplete set on the first peer (A then B then rest).
    for (const pi of peers) {
      for (let si = setIdx + 1; si < (exercises[pi]?.sets.length ?? 0); si++) {
        if (!exercises[pi].sets[si].completed) {
          return { exerciseIndex: pi, setIndex: si };
        }
      }
    }
  }

  for (let ei = exIdx; ei < exercises.length; ei++) {
    const startSet = ei === exIdx ? setIdx + 1 : 0;
    for (let si = startSet; si < exercises[ei].sets.length; si++) {
      if (!exercises[ei].sets[si].completed) {
        return { exerciseIndex: ei, setIndex: si };
      }
    }
  }
  return null;
}

export function shouldRestAfterLog(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  setIdx: number,
  next: { exerciseIndex: number; setIndex: number } | null
): boolean {
  if (!next) return false;
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return true;
  return !(
    exercises[next.exerciseIndex]?.supersetGroup === group && next.setIndex === setIdx
  );
}
