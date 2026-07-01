/** Superset grouping — exercises with the same group id alternate sets with minimal rest. */

import type { ActiveExerciseLog } from '@/types';

export function getSupersetPeers(exercises: ActiveExerciseLog[], exIdx: number): number[] {
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return [exIdx];
  return exercises.map((_, i) => i).filter((i) => exercises[i].supersetGroup === group);
}

export function supersetLabel(exercises: ActiveExerciseLog[], exIdx: number): string | null {
  const group = exercises[exIdx]?.supersetGroup;
  if (!group) return null;
  const peers = getSupersetPeers(exercises, exIdx);
  const letter = String.fromCharCode(65 + peers.indexOf(exIdx));
  return `SS ${letter}`;
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
