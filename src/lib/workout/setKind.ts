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

/*
 * Set classification is carried by a tag, not by tinting the row.
 *
 * These three functions were the last pre-rebrand colour in the logger — amber,
 * rose, violet and emerald, all on `*-950` grounds picked for a dark theme.
 * They survived the `.131` token swap because they live in `lib/`, not
 * `components/`, so a grep for class names in the component tree never saw
 * them; on paper the completed-set row was rendering a murky green wash.
 *
 * Four hues to say "warm-up / failure / drop / done" is also more colour than
 * the distinction earns. The label already says it, and this system has one
 * colour to spend.
 */

export function setKindBadgeClass(kind: SetKind): string {
  // Failure is the one worth catching in a scan, so it gets the outline; the
  // rest are quiet neutral tags.
  if (kind === 'failure') return 'border-primary text-primary';
  if (kind === 'normal') return '';
  return 'border-transparent bg-neutral-200 text-neutral-800';
}

export function setKindRowClass(kind: SetKind, isNext: boolean): string {
  // The live row is the only marked one: accent-100 fill + a 3px red inset edge.
  if (isNext) return 'is-active-row';
  return 'bg-transparent';
}

export function setKindCompletedRowClass(_kind: SetKind): string {
  // Done reads as the surface fill — quieter than the pending rows above it,
  // which is the right way round while a session is running.
  return 'bg-card';
}
