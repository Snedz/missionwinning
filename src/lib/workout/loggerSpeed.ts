/**
 * Gym-speed helpers for the live logger console.
 * Pure — keep mid-set paths under three intentional taps.
 */

import { SET_KINDS, type SetKind } from '@/lib/workout/setKind';

/** True when the console already holds the progressive-overload / plan target. */
export function consoleMatchesTarget(
  reps: number,
  weight: number,
  target: { reps: number; weight: number } | null | undefined
): boolean {
  if (!target) return false;
  return reps === target.reps && weight === target.weight;
}

/**
 * Whether to offer a one-tap "Use next" control.
 * Only when there is a next target the athlete has not already dialed in.
 */
export function shouldOfferUseNext(
  reps: number,
  weight: number,
  target: { reps: number; weight: number } | null | undefined
): boolean {
  if (!target) return false;
  return !consoleMatchesTarget(reps, weight, target);
}

/**
 * Outdoor density: four 44px set-kind chips sat above reps/weight and pushed
 * Log set out of the easy thumb zone for the default path (work set).
 * Collapsed = selected kind only (+ expand control in UI). Expanded = all kinds.
 * Non-normal kinds always expand so the selection stays visible among peers.
 */
export function visibleSetKinds(kind: SetKind, expanded: boolean): readonly SetKind[] {
  if (expanded || kind !== 'normal') return SET_KINDS;
  return ['normal'];
}

/** Show the expand control when collapsed on a work set. */
export function shouldShowSetKindExpand(kind: SetKind, expanded: boolean): boolean {
  return !expanded && kind === 'normal';
}

/**
 * Interpolation keys for `activeSetOf` — must match the locale template
 * (`Set {{current}} of {{total}}`). Passing `n` left the ordinal as the
 * literal `{{current}}` once the pack loaded (defaultValue only applies when
 * the key is missing).
 */
export function activeSetOfParams(
  setNumber: number,
  totalSets: number
): { current: number; total: number } {
  return { current: setNumber, total: totalSets };
}
