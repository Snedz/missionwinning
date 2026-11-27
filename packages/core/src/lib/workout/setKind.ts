/** Set classification — set-table-style warmup, failure, and drop markers. */

export type SetKind = 'normal' | 'warmup' | 'failure' | 'drop';

export const SET_KINDS: SetKind[] = ['normal', 'warmup', 'failure', 'drop'];

/** Optional row tags — Work is the cleared state, never a required pick. */
export const SET_ROW_TAGS: Exclude<SetKind, 'normal'>[] = ['warmup', 'drop', 'failure'];

/** Tap the same tag again to return to work. Never invents a fourth kind. */
export function toggleSetTag(current: SetKind | undefined, tag: SetKind): SetKind {
  if (tag === 'normal') return 'normal';
  return current === tag ? 'normal' : tag;
}

export function countsTowardVolume(kind?: SetKind): boolean {
  return kind !== 'warmup';
}

/**
 * Sets that may support a strength estimate — e1RM, PR, prescribed load.
 *
 * `.208` — one concept that had **four** definitions, and `percentLoad.ts`
 * claimed in prose that they all "quote the same number":
 *
 *   | site                              | warmup | failure  | drop |
 *   |-----------------------------------|--------|----------|------|
 *   | `countsTowardPr` (live PR chip)   | excl   | **incl** | excl |
 *   | `benchmarks.ts` (1RM chart)       | excl   | excl     | incl |
 *   | `coach/progress.ts` `isCountable` | excl   | excl     | incl |
 *   | `setMath.ts` `loadBearingSets`    | excl   | excl     | incl |
 *
 * The PR chip was the outlier, and it is the one that celebrates. Prior best
 * bench 100×6 (e1RM 116.1); log 100×8 marked **failure** → 124.1 → the brass
 * chip fires and `isPr` is written to the log, while the /benchmarks chart, the
 * debrief and the next session's prescribed load all skip that set and still
 * say 116.1. Verbatim the failure `benchmarks.ts:4-9` says was already fixed.
 *
 * The majority is also the defensible answer: a set taken to failure gives the
 * highest and least repeatable e1RM reading, which is exactly why the three
 * estimate consumers refuse it — so the celebration fired on the one kind of set
 * the rest of the app declines to trust. A drop set is lighter by construction
 * and cannot beat the top set, so including it costs nothing.
 *
 * Every consumer now delegates here. `reachability.test.ts` fails a fifth copy.
 *
 * Takes `string`, not `SetKind`: kinds arrive from device storage and from CSV
 * import, where an unrecognised value is possible and must be treated as a
 * normal set rather than rejected by the type system at a boundary it cannot
 * police anyway.
 */
export function countsTowardStrengthEstimate(kind?: string): boolean {
  return kind !== 'warmup' && kind !== 'failure';
}

/**
 * Sets that may fire the live PR chip.
 *
 * The estimate rule **plus** one UX judgement: a drop set is the burnout at the
 * end of the work, and celebrating it reads wrong even on the rare occasion its
 * e1RM leads. That exclusion was already here and is deliberate, so it stays.
 * What changed in `.208` is `failure` — a *numeric* disagreement rather than a
 * taste one, and the only one that made the chip contradict the chart.
 *
 * Kept as a separate name so the two reasons stay separately arguable: change
 * this to change what the app celebrates; change
 * `countsTowardStrengthEstimate` to change what the app believes.
 */
export function countsTowardPr(kind?: string): boolean {
  return countsTowardStrengthEstimate(kind) && kind !== 'drop';
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
