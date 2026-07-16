/** Set classification — Hevy/Strong-style warmup, failure, and drop markers. */

export type SetKind = 'normal' | 'warmup' | 'failure' | 'drop';

export const SET_KINDS: SetKind[] = ['normal', 'warmup', 'failure', 'drop'];

export function countsTowardVolume(kind?: SetKind): boolean {
  return kind !== 'warmup';
}

export function countsTowardPr(kind?: SetKind): boolean {
  return kind !== 'warmup' && kind !== 'drop';
}

export function setKindLabelKey(kind: SetKind): string {
  if (kind === 'warmup') return 'activeSetWarmup';
  if (kind === 'failure') return 'activeSetFailure';
  if (kind === 'drop') return 'activeSetDrop';
  return 'activeSetNormal';
}

export function setKindDefaultLabel(kind: SetKind): string {
  if (kind === 'warmup') return 'W';
  if (kind === 'failure') return 'F';
  if (kind === 'drop') return 'D';
  return '—';
}

export function setKindBadgeClass(kind: SetKind): string {
  if (kind === 'warmup') return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
  if (kind === 'failure') return 'border-rose-500/40 bg-rose-950/30 text-rose-300';
  if (kind === 'drop') return 'border-violet-500/40 bg-violet-950/30 text-violet-300';
  return '';
}

export function setKindRowClass(kind: SetKind, isNext: boolean): string {
  if (isNext) return 'border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/30';
  if (kind === 'warmup') return 'border-amber-500/25 bg-amber-950/10';
  if (kind === 'failure') return 'border-rose-500/25 bg-rose-950/10';
  if (kind === 'drop') return 'border-violet-500/25 bg-violet-950/10';
  return 'border-border bg-card/40';
}

export function setKindCompletedRowClass(kind: SetKind): string {
  if (kind === 'warmup') return 'border-amber-500/30 bg-amber-950/15';
  if (kind === 'failure') return 'border-rose-500/30 bg-rose-950/15';
  if (kind === 'drop') return 'border-violet-500/30 bg-violet-950/15';
  // Hevy-style emerald wash on completed working sets
  return 'border-emerald-500/35 bg-emerald-950/25';
}
