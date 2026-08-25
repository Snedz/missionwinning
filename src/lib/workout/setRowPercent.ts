/**
 * 1RM percent grammar on the live set row (`.981`).
 *
 * Known max is a logged **1-rep** working set — the same rule as
 * benchmarks `bestActual1RM`. Empty invents nothing. One 5-rep set
 * is not a max. Session Epley and `workingMaxFromHistory` stay out.
 * Grammar only — the app does not pick the percent.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { countsTowardStrengthEstimate } from '@/lib/workout/setKind';
import { loadPctFromWeight, weightFromLoadPct } from '@/lib/workout/percentLoad';

export const LOAD_PCT_MIN = 1;
export const LOAD_PCT_MAX = 100;

function isLoadPctNumber(n: number): boolean {
  if (!Number.isFinite(n) || n < LOAD_PCT_MIN || n > LOAD_PCT_MAX) return false;
  return Math.round(n * 10) / 10 === n;
}

/**
 * Boundary parse. Empty / omitted → `undefined`. Out of range and
 * extra decimals are dropped — never clamped. Notebook waves keep
 * one decimal (`76.5`). A trailing `%` is allowed (`80%`).
 */
export function parseOptionalLoadPct(value: unknown): number | undefined {
  if (value == null || typeof value === 'boolean') return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/%\s*$/, '').trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    if (!isLoadPctNumber(n)) return undefined;
    return n;
  }
  if (typeof value !== 'number') return undefined;
  if (!isLoadPctNumber(value)) return undefined;
  return value;
}

/**
 * Best actual 1-rep working set for this lift. Tombstones, warmup,
 * failure, and 0-load do not count. One multi-rep set invents nothing.
 */
export function knownMaxFromHistory(
  exerciseId: string,
  history: readonly CompletedWorkoutLog[] | null | undefined
): number | null {
  if (!exerciseId || !history?.length) return null;
  let best = 0;
  for (const log of history) {
    if (log.deletedAt) continue;
    const hit = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (!hit) continue;
    for (const set of hit.sets) {
      if (!countsTowardStrengthEstimate(set.kind)) continue;
      if (set.reps !== 1 || set.weight <= 0) continue;
      if (set.weight > best) best = set.weight;
    }
  }
  return best > 0 ? best : null;
}

/** Absolute load from a known max × percent. No max ⇒ nothing. */
export function weightFromKnownMaxPct(
  knownMax: number | null | undefined,
  pct: number | undefined,
  units: UnitsPref
): number | undefined {
  if (knownMax == null || knownMax <= 0) return undefined;
  const parsed = parseOptionalLoadPct(pct);
  if (parsed === undefined) return undefined;
  const weight = weightFromLoadPct(knownMax, parsed, units);
  return weight > 0 ? weight : undefined;
}

/** Inverse display — null when either side is missing. */
export function loadPctOfKnownMax(
  knownMax: number | null | undefined,
  weight: number | null | undefined
): number | null {
  if (knownMax == null || knownMax <= 0) return null;
  if (weight == null || weight <= 0) return null;
  return loadPctFromWeight(knownMax, weight);
}

export function formatKnownMaxPct(pct: number | null | undefined): string | null {
  const parsed = parseOptionalLoadPct(pct);
  if (parsed === undefined) return null;
  return `${parsed}%`;
}

/** Append ` · 80%` when present. Empty line stays the line they have. */
export function appendKnownMaxPctCite(
  line: string | null | undefined,
  pct: number | null | undefined
): string | null {
  const base = line?.trim() || null;
  const bit = formatKnownMaxPct(pct);
  if (!bit) return base;
  if (!base) return bit;
  if (base.includes(bit)) return base;
  return `${base} · ${bit}`;
}
