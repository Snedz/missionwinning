/**
 * After-save vs-last delta for a logged working set (.741).
 *
 * Ghost / Prev / F-013 dial prefill is a different lane (`lastWorkingForDial`,
 * `formatPrevSetLabels`, `resolveSetInput`). This module only answers: after a
 * working set is saved, what tiny token belongs on that row vs the last
 * session's matching working set. Self only. Guests use local history.
 */
import type { CompletedWorkoutLog } from '@/types';
import { getLastSessionSets } from '@/lib/workout/activeWorkoutHelpers';
import { workingSets } from '@/lib/workout/setMath';
import { appendIntensityCite, lastWorkSetIntensity } from '@/lib/workout/workSetIntensity';

/** Load changed if the stored weights differ by at least this (kg or display lbs). */
export const VS_LAST_WEIGHT_EPS = 0.05;

export type VsLastDelta =
  | { kind: 'none' }
  | { kind: 'same' }
  | { kind: 'weight'; signed: number }
  | { kind: 'reps'; signed: number };

export type VsLastWords = { same: string; rep: string; reps: string };

/**
 * Index among working sets (warmup excluded). Null when this slot is a warmup
 * or out of range — those rows never get a delta.
 */
export function workingSetIndex(
  sets: { kind?: string }[],
  setIdx: number
): number | null {
  const set = sets[setIdx];
  if (!set || set.kind === 'warmup') return null;
  let n = 0;
  for (let i = 0; i < setIdx; i++) {
    if (sets[i]?.kind !== 'warmup') n++;
  }
  return n;
}

export function vsLastDeltaForSet(
  current:
    | { completed?: boolean; reps: number; weight: number; kind?: string }
    | undefined,
  last: { reps: number; weight: number } | null
): VsLastDelta {
  if (!current?.completed) return { kind: 'none' };
  if (current.kind === 'warmup') return { kind: 'none' };
  if (!last) return { kind: 'none' };

  const curW = current.weight;
  const lastW = last.weight;
  const bothBodyweight = curW <= 0 && lastW <= 0;
  const dW = curW - lastW;
  if (!bothBodyweight && Math.abs(dW) >= VS_LAST_WEIGHT_EPS) {
    return { kind: 'weight', signed: Math.round(dW * 100) / 100 };
  }
  const dR = current.reps - last.reps;
  if (dR !== 0) return { kind: 'reps', signed: dR };
  return { kind: 'same' };
}

export function formatSignedDelta(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const abs = Math.abs(rounded);
  const body = Number.isInteger(abs) ? String(abs) : String(abs);
  if (rounded < 0) return `-${body}`;
  if (rounded > 0) return `+${body}`;
  return '0';
}

/** Null means do not paint a token (first-ever / warmup / incomplete). */
export function formatVsLastDelta(
  delta: VsLastDelta,
  unitLabel: string,
  words: VsLastWords
): string | null {
  if (delta.kind === 'none') return null;
  if (delta.kind === 'same') return words.same;
  if (delta.kind === 'weight') {
    return `${formatSignedDelta(delta.signed)} ${unitLabel}`;
  }
  const unit = Math.abs(delta.signed) === 1 ? words.rep : words.reps;
  return `${formatSignedDelta(delta.signed)} ${unit}`;
}

/**
 * One label per current-session set index. Reuses last-session lookup; matching
 * is working-set index with no fallback when this session has extra sets.
 */
export function formatVsLastSetDeltas(
  workoutHistory: CompletedWorkoutLog[],
  exerciseId: string,
  currentSets: Array<{
    completed?: boolean;
    reps: number;
    weight: number;
    kind?: string;
  }>,
  unitLabel: string,
  words: VsLastWords
): (string | null)[] {
  const lastSets = getLastSessionSets(workoutHistory, exerciseId);
  const lastWorking = lastSets ? workingSets(lastSets) : [];
  const intensity = lastWorkSetIntensity(lastSets);
  const lastWorkWi = lastWorking.length ? lastWorking.length - 1 : -1;
  return currentSets.map((set, setIdx) => {
    const wi = workingSetIndex(currentSets, setIdx);
    const last = wi === null ? null : (lastWorking[wi] ?? null);
    const token = formatVsLastDelta(vsLastDeltaForSet(set, last), unitLabel, words);
    if (wi === lastWorkWi && token) return appendIntensityCite(token, intensity);
    return token;
  });
}
