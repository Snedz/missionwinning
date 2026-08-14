/**
 * Progressive-overload cue for the live logger (last · next · why).
 * Pure — no i18n; UI maps reason codes to translated chips.
 *
 * Industry table stakes (Hevy / Alpha Progression / Strong): the app should
 * remember the gym better than the athlete. This is the one place mid-set
 * that answers “what did I do / what should I do / why”.
 */

import type { NextSetTarget } from '@/lib/workout/nextSetTargets';
import { formatSetLoadLine } from '@/lib/workout/bodyweightLoad';

export type OverloadReason = NextSetTarget['reason'] | 'prescribed';

export type OverloadCue = {
  last: { reps: number; weight: number } | null;
  next: { reps: number; weight: number } | null;
  reason: OverloadReason | null;
};

export type BuildOverloadCueOpts = {
  last: { reps: number; weight: number } | null;
  /** Suggested freestyle target or coach prescription for this set index. */
  next: { reps: number; weight: number } | null;
  reason?: NextSetTarget['reason'] | null;
  /** When true, next came from Mission Coach (not double-progression). */
  prescribed?: boolean;
};

/**
 * Build the last/next/reason triple for the console.
 * Omits next when it is byte-identical to last and freestyle (no noise).
 */
export function buildOverloadCue(opts: BuildOverloadCueOpts): OverloadCue {
  const last = opts.last
    ? { reps: opts.last.reps, weight: opts.last.weight }
    : null;
  let next = opts.next
    ? { reps: opts.next.reps, weight: opts.next.weight }
    : null;
  let reason: OverloadReason | null = opts.prescribed
    ? 'prescribed'
    : (opts.reason ?? null);

  if (opts.prescribed && next) {
    return { last, next, reason: 'prescribed' };
  }

  if (
    last &&
    next &&
    last.reps === next.reps &&
    last.weight === next.weight &&
    !opts.prescribed
  ) {
    // Identical hold — keep last, drop redundant next line, keep reason if hold/from_last
    next = null;
    if (reason === 'from_last' || reason === 'hold') {
      reason = 'hold';
    }
  }

  if (!last && !next) {
    return { last: null, next: null, reason: null };
  }

  if (next && !reason) {
    reason = 'from_last';
  }

  return { last, next, reason };
}

/** English defaults for reason chips — UI should i18n via key map. */
export function overloadReasonDefault(reason: OverloadReason | null): string | null {
  switch (reason) {
    case 'add_reps':
      return 'Add a rep';
    case 'add_weight':
      return 'Add weight';
    case 'hold':
      return 'Hold';
    case 'from_last':
      return 'From last time';
    case 'prescribed':
      return 'Coach plan';
    default:
      return null;
  }
}

export function overloadReasonKey(reason: OverloadReason | null): string | null {
  switch (reason) {
    case 'add_reps':
      return 'activeOverloadAddReps';
    case 'add_weight':
      return 'activeOverloadAddWeight';
    case 'hold':
      return 'activeOverloadHold';
    case 'from_last':
      return 'activeOverloadFromLast';
    case 'prescribed':
      return 'activeOverloadPrescribed';
    default:
      return null;
  }
}

/**
 * Format a set line for the console strip.
 * weight 0 → BW token (caller supplies translated bwLabel).
 */
export function formatOverloadSetLine(
  reps: number,
  weight: number,
  unitLabel: string,
  bwLabel = 'BW',
  plusLoad = false
): string {
  return formatSetLoadLine({
    reps,
    weight,
    unitLabel,
    bodyweightLabel: bwLabel,
    plusLoad,
  });
}
