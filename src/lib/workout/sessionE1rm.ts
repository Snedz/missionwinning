/**
 * Educational e1RM from this session's logged working sets (`.761`).
 *
 * Named formula: **Epley** — `weight × (1 + reps / 30)`, via `epley1rm`.
 * Not the hybrid in `coach/progress.estimate1rm` (Brzycki ≤10 / Epley >10).
 * That number stays coach / benchmarks / percent-load. This line is a
 * guest-visible readout from sets already on the card.
 *
 * Frozen plan: [docs/E1RM_PLAN.md](../../../docs/E1RM_PLAN.md).
 */

import { epley1rm } from '@/lib/calcHelpers';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { countsTowardStrengthEstimate } from '@/lib/workout/setKind';
import type { LoggedSet } from '@/types';

export const SESSION_E1RM_FORMULA = 'epley' as const;

/** Same cap as `MAX_REPS_FOR_E1RM` — above this is work capacity, not a 1RM estimate. */
export const SESSION_E1RM_MAX_REPS = 12;

/**
 * Single EN source for the live line + hide chrome.
 * `t(key, { defaultValue })` and `activeWorkoutLocales` `en` must match these.
 */
export const SESSION_E1RM_COPY = {
  line: 'est. 1RM ~{{e1rm}} {{unit}} (Epley) — formula estimate, not a tested max',
  hide: 'Hide estimate',
  show: 'Show e1RM estimate',
  aria: 'Estimated one-rep max from the Epley formula, not a tested max',
} as const;

export type SessionE1rm = {
  e1rm: number;
  weight: number;
  reps: number;
  formula: typeof SESSION_E1RM_FORMULA;
};

/**
 * Epley for one set, or null when the set cannot support the estimate.
 *
 * A single is the logged weight (Epley would invent ~3%). Load 0 / skip and
 * high-rep sets return null.
 */
export function epleySessionEstimate(weight: number, reps: number): number | null {
  if (!Number.isFinite(weight) || !Number.isFinite(reps)) return null;
  if (weight <= 0 || reps <= 0 || reps > SESSION_E1RM_MAX_REPS) return null;
  if (reps === 1) return Math.round(weight * 10) / 10;
  const raw = epley1rm(weight, reps);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

/** Best Epley among completed working sets on this exercise this session. */
export function sessionE1rmFromSets(sets: readonly LoggedSet[]): SessionE1rm | null {
  let best: SessionE1rm | null = null;
  for (const set of sets) {
    if (!set.completed) continue;
    if (!countsTowardStrengthEstimate(set.kind)) continue;
    const e1rm = epleySessionEstimate(set.weight, set.reps);
    if (e1rm === null) continue;
    if (!best || e1rm > best.e1rm) {
      best = {
        e1rm,
        weight: set.weight,
        reps: set.reps,
        formula: SESSION_E1RM_FORMULA,
      };
    }
  }
  return best;
}

/** Default on. `'0'` hides. Guests — device only. */
export function loadSessionE1rmVisible(): boolean {
  return readRaw(STORAGE_KEYS.showSessionE1rm) !== '0';
}

export function saveSessionE1rmVisible(visible: boolean): void {
  writeRaw(STORAGE_KEYS.showSessionE1rm, visible ? '1' : '0');
}
