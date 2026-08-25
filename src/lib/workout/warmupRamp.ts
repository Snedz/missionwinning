/**
 * Free warmup batch from the working weight — simple fractions, not a calculator.
 * Insert is a tap, never automatic. Never gates.
 */

import { roundToStep } from '@/lib/workout/setMath';
import { weightStep, type UnitsPref } from '@/lib/units';

export type WarmupStep = { reps: number; weight: number };

/** ½ × 5, ⅔ × 3, ¾ × 1 of the working load. */
const WARMUP_BATCH: readonly { num: number; den: number; reps: number }[] = [
  { num: 1, den: 2, reps: 5 },
  { num: 2, den: 3, reps: 3 },
  { num: 3, den: 4, reps: 1 },
];

function isWorkingKind(kind?: string): boolean {
  return kind !== 'warmup';
}

export function planWarmupBatch(params: {
  workWeight: number;
  units: UnitsPref;
}): WarmupStep[] {
  if (!(params.workWeight > 0)) return [];
  const step = weightStep(params.units);
  const out: WarmupStep[] = [];
  const seen = new Set<number>();
  for (const s of WARMUP_BATCH) {
    const weight = roundToStep((params.workWeight * s.num) / s.den, step);
    if (!(weight > 0) || weight >= params.workWeight) continue;
    if (seen.has(weight)) continue;
    seen.add(weight);
    out.push({ reps: s.reps, weight });
  }
  return out;
}

/** Same helper — one door. Do not keep a second olympic formula. */
export function planWarmupRamp(params: {
  workWeight: number;
  units: UnitsPref;
}): WarmupStep[] {
  return planWarmupBatch(params);
}

export function warmupRampAlreadyPresent(
  sets: { kind?: string; weight: number }[],
  ramp: WarmupStep[]
): boolean {
  if (ramp.length === 0) return true;
  const warmups = sets.filter((s) => s.kind === 'warmup');
  if (warmups.length < ramp.length) return false;
  return ramp.every((r, i) => warmups[i]?.weight === r.weight);
}

export function insertWarmupSets<
  T extends { completed: boolean; kind?: string; weight: number },
>(sets: T[], rampItems: T[]): T[] {
  if (rampItems.length === 0) return sets;
  if (
    warmupRampAlreadyPresent(
      sets,
      rampItems.map((s) => ({ reps: 0, weight: s.weight }))
    )
  ) {
    return sets;
  }
  const insertAt = sets.findIndex((s) => !s.completed);
  const at = insertAt < 0 ? sets.length : insertAt;
  return [...sets.slice(0, at), ...rampItems, ...sets.slice(at)];
}

export function removePlannedSetAt<T extends { completed: boolean }>(
  sets: T[],
  index: number
): T[] {
  const row = sets[index];
  if (!row || row.completed) return sets;
  return sets.filter((_, i) => i !== index);
}

export function resolveWorkingLoad(params: {
  sets: { completed: boolean; kind?: string; reps: number; weight: number }[];
  liveSetIdx: number | null;
  liveDial: { reps: number; weight: number } | null;
}): { reps: number; weight: number } | null {
  const live = params.liveSetIdx != null ? params.sets[params.liveSetIdx] : undefined;
  if (
    live &&
    isWorkingKind(live.kind) &&
    params.liveDial &&
    params.liveDial.weight > 0
  ) {
    return params.liveDial;
  }
  const firstIncompleteWork = params.sets.find(
    (s) => !s.completed && isWorkingKind(s.kind) && s.weight > 0
  );
  if (firstIncompleteWork) {
    return { reps: firstIncompleteWork.reps, weight: firstIncompleteWork.weight };
  }
  const lastWork = [...params.sets]
    .reverse()
    .find((s) => s.completed && isWorkingKind(s.kind) && s.weight > 0);
  if (lastWork) return { reps: lastWork.reps, weight: lastWork.weight };
  return null;
}

export function setRowOrdinal(
  sets: { kind?: string }[],
  idx: number
): { warmup: boolean; label: string } {
  if (sets[idx]?.kind === 'warmup') return { warmup: true, label: 'W' };
  let n = 0;
  for (let i = 0; i <= idx; i++) {
    if (sets[i]?.kind !== 'warmup') n += 1;
  }
  return { warmup: false, label: String(n) };
}

export function shouldShowAddWarmups(params: {
  workingWeight: number | null;
  units: UnitsPref;
  sets: { kind?: string; weight: number }[];
}): boolean {
  if (params.workingWeight == null || !(params.workingWeight > 0)) return false;
  const ramp = planWarmupBatch({ workWeight: params.workingWeight, units: params.units });
  if (ramp.length === 0) return false;
  return !warmupRampAlreadyPresent(params.sets, ramp);
}

export function nextWarmupKind(kind?: string): 'normal' | 'warmup' {
  return kind === 'warmup' ? 'normal' : 'warmup';
}
