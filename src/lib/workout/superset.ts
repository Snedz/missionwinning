/** Exercise groups — two or more share a rest; numbered A1/A2/A3. */

import type { ActiveExerciseLog } from '@/types';

function stripGroup<T extends { supersetGroup?: string }>(ex: T): T {
  const { supersetGroup: _, ...rest } = ex;
  return rest as T;
}

/** Drop a group id that no longer has two peers. Orphan is not a group. */
export function stripOrphanGroups<T extends { supersetGroup?: string }>(items: T[]): T[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const group = item.supersetGroup?.trim();
    if (!group) continue;
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return items.map((item) => {
    const group = item.supersetGroup?.trim();
    if (!group || (counts.get(group) ?? 0) < 2) {
      return item.supersetGroup ? stripGroup(item) : item;
    }
    return item;
  });
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

/** set-table pair mark: first group is A1/A2/A3, second is B1/B2. */
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

/** Next exercise already shares this group — do not offer "Superset w/ next". */
export function isNextInThisGroup(exercises: ActiveExerciseLog[], exIdx: number): boolean {
  const current = exercises[exIdx]?.supersetGroup;
  const next = exercises[exIdx + 1]?.supersetGroup;
  return !!current && !!next && current === next;
}

/**
 * A peer still owes this set index — A2 is the same round, not a new exercise.
 */
export function isMidRoundPeerOpen(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  setIdx: number
): boolean {
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return false;
  return getSupersetPeers(exercises, exIdx).some((pi) => {
    if (pi === exIdx) return false;
    const set = exercises[pi]?.sets[setIdx];
    return !!set && !set.completed;
  });
}

/**
 * Append the next exercise to this group, or start a pair.
 * Reuses the existing group id when either side already has one.
 */
export function groupWithNext(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  groupId = `ss-${Date.now()}`
): ActiveExerciseLog[] {
  const nextIdx = exIdx + 1;
  if (nextIdx >= exercises.length || exIdx < 0) return exercises;
  const current = exercises[exIdx];
  const next = exercises[nextIdx];
  if (!current || !next) return exercises;
  if (current.supersetGroup && current.supersetGroup === next.supersetGroup) {
    return exercises;
  }
  const id = current.supersetGroup || next.supersetGroup || groupId;
  const mapped = exercises.map((ex, i) =>
    i === exIdx || i === nextIdx ? { ...ex, supersetGroup: id } : ex
  );
  return stripOrphanGroups(mapped);
}

/**
 * Pair exactly two consecutive exercises when neither is grouped.
 * When a group already exists, grows it (`.979`) — alias of `groupWithNext`.
 */
export function pairWithNext(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  groupId = `ss-${Date.now()}`
): ActiveExerciseLog[] {
  return groupWithNext(exercises, exIdx, groupId);
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
    // Round done — next incomplete set on the first peer (A then B then rest).
    for (const pi of peers) {
      for (let si = setIdx + 1; si < (exercises[pi]?.sets.length ?? 0); si++) {
        if (!exercises[pi].sets[si].completed) {
          return { exerciseIndex: pi, setIndex: si };
        }
      }
    }
  }

  for (let ei = exIdx; ei < exercises.length; ei++) {
    if (exercises[ei].skippedThisSession) continue;
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

/**
 * Rest after a group round keys on the first peer (A), not A2/A3.
 * Mid-round returns the logged exercise (caller should not start rest).
 */
export function restIdentityAfterLog(
  exercises: ActiveExerciseLog[],
  exIdx: number,
  setIdx: number,
  next: { exerciseIndex: number; setIndex: number } | null
): { exerciseId?: string } {
  const logged = exercises[exIdx];
  if (!logged) return {};
  if (!logged.supersetGroup || !shouldRestAfterLog(exercises, exIdx, setIdx, next)) {
    return { exerciseId: logged.exerciseId };
  }
  const peers = getSupersetPeers(exercises, exIdx);
  return { exerciseId: exercises[peers[0]]?.exerciseId ?? logged.exerciseId };
}
