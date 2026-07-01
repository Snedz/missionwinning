/** Set classification — Hevy/Strong-style warmup and failure markers. */

export type SetKind = 'normal' | 'warmup' | 'failure';

export const SET_KINDS: SetKind[] = ['normal', 'warmup', 'failure'];

export function countsTowardVolume(kind?: SetKind): boolean {
  return kind !== 'warmup';
}

export function countsTowardPr(kind?: SetKind): boolean {
  return kind !== 'warmup';
}

export function setKindLabelKey(kind: SetKind): string {
  if (kind === 'warmup') return 'activeSetWarmup';
  if (kind === 'failure') return 'activeSetFailure';
  return 'activeSetNormal';
}

export function setKindDefaultLabel(kind: SetKind): string {
  if (kind === 'warmup') return 'W';
  if (kind === 'failure') return 'F';
  return '—';
}
