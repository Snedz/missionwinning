/**
 * Cue & tweak memory — the note you wrote last time, back when it matters.
 *
 * Paper-logbook lifters flip back pages for exactly this: "machine 3, seat 4",
 * "tuck elbows", "left knee tight last time". The app has stored these notes on
 * the completed log since day one (and syncs them, so a note typed on Android
 * surfaces here) — `.184` made them readable in History, and this makes them
 * *useful*: the logger shows an exercise's last note when the athlete opens it
 * again. Every note written now raises the value of the next session — that is
 * the retention loop.
 *
 * Refusals, each tested: another exercise's note never appears (a bench cue on
 * squat day is worse than silence), no history or no notes is silence (never a
 * placeholder), and the note is returned verbatim — presentation may truncate,
 * this module may not reword.
 */

import type { CompletedWorkoutLog } from '@/types';

export interface PastNote {
  /** `completedAt` of the session the note was written in. */
  date: string;
  /** The note exactly as the athlete wrote it. */
  text: string;
}

/**
 * The last `n` notes written on `exerciseId`, newest first.
 *
 * Sorts defensively by `completedAt` — the store keeps history newest-first, but
 * a cloud merge or import can perturb order, and "last note" showing a stale cue
 * as current would be a silent lie.
 */
export function lastNotesFor(
  exerciseId: string,
  history: CompletedWorkoutLog[],
  n = 1
): PastNote[] {
  if (n <= 0) return [];
  const notes: PastNote[] = [];
  const sorted = [...history]
    .filter((log) => !log.deletedAt)
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
  for (const log of sorted) {
    for (const ex of log.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      const text = ex.note?.trim();
      if (text) notes.push({ date: log.completedAt, text });
    }
    if (notes.length >= n) break;
  }
  return notes.slice(0, n);
}
