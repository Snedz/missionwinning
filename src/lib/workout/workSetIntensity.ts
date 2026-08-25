/**
 * Last work-set intensity for cites (`.967`).
 *
 * Grammar only — quote RPE 1–10 and/or RIR when the last working set
 * actually has them. Empty stays empty. Never invent a number from
 * categorical Easy/Med/Hard. Never walk back to an earlier rated set.
 * Warmup and 0-rep rows are not work.
 */

import { parseOptionalRpe10 } from '@/lib/workout/rpe10';
import { parseOptionalRir } from '@/lib/workout/rir';

export type WorkSetIntensity = {
  rpe10?: number;
  rir?: number;
};

type IntensitySet = {
  kind?: string;
  reps?: number;
  rpe10?: unknown;
  rir?: unknown;
  rpe?: unknown;
};

export function isWorkSet(set: IntensitySet | undefined): boolean {
  if (!set) return false;
  if (set.kind === 'warmup') return false;
  return (set.reps ?? 0) > 0;
}

/** Fields that are actually present. Categorical `rpe` is ignored. */
export function readWorkSetIntensity(set: IntensitySet | undefined): WorkSetIntensity {
  const out: WorkSetIntensity = {};
  const rpe10 = parseOptionalRpe10(set?.rpe10);
  const rir = parseOptionalRir(set?.rir);
  if (rpe10 !== undefined) out.rpe10 = rpe10;
  if (rir !== undefined) out.rir = rir;
  return out;
}

export function formatWorkSetIntensity(bit: WorkSetIntensity | null | undefined): string | null {
  if (!bit) return null;
  const parts: string[] = [];
  if (bit.rpe10 !== undefined) parts.push(`RPE ${bit.rpe10}`);
  if (bit.rir !== undefined) parts.push(`RIR ${bit.rir}`);
  return parts.length ? parts.join(' · ') : null;
}

/** Last working set in this list — warmup / 0-rep skipped. */
export function lastWorkSet<T extends IntensitySet>(sets: readonly T[] | undefined): T | null {
  if (!sets?.length) return null;
  for (let i = sets.length - 1; i >= 0; i--) {
    const set = sets[i];
    if (isWorkSet(set)) return set ?? null;
  }
  return null;
}

/**
 * Intensity of the last working set only. If that set has no RPE/RIR,
 * return null — do not walk back.
 */
export function lastWorkSetIntensity(sets: readonly IntensitySet[] | undefined): string | null {
  const last = lastWorkSet(sets);
  if (!last) return null;
  return formatWorkSetIntensity(readWorkSetIntensity(last));
}

/**
 * Last work-set intensity across a session (exercises in order).
 * The last exercise that has a working set wins. Empty stays empty.
 */
export function sessionLastWorkSetIntensity(
  exercises: readonly { sets?: readonly IntensitySet[] }[] | undefined
): string | null {
  if (!exercises?.length) return null;
  let last: IntensitySet | null = null;
  for (const ex of exercises) {
    const set = lastWorkSet(ex.sets);
    if (set) last = set;
  }
  if (!last) return null;
  return formatWorkSetIntensity(readWorkSetIntensity(last));
}

/** Append ` · RPE 9` when present. Empty line is unchanged. */
export function appendIntensityCite(
  line: string | null | undefined,
  intensity: string | null | undefined
): string | null {
  const base = line?.trim() || null;
  const bit = intensity?.trim() || null;
  if (!bit) return base;
  if (!base) return bit;
  if (base.includes(bit)) return base;
  return `${base} · ${bit}`;
}
