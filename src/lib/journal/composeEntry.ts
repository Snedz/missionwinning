/**
 * The session entry — the athlete's fragments fused with the machine's debrief.
 *
 * The Granola shape, transplanted: during a meeting Granola's user types scrappy
 * half-sentences while the machine holds the transcript, and one explicit step
 * fuses them into notes that still read as the user's own. Here the workout log is
 * the transcript, `buildDebrief` is the enhance step, and the fragments are the
 * five words an athlete can thumb into a phone between sets — "knee twinge set 3",
 * "paused-rep cue clicked".
 *
 * Two rules carry the whole feature, both enforced by tests:
 *
 * 1. **Fragments first, verbatim, attributed.** The athlete's words open the entry
 *    exactly as written; a note typed on an exercise carries that exercise's name.
 *    The machine never rewords, reorders or summarises them — an entry that reads
 *    as the machine's is an entry nobody re-reads.
 * 2. **Empty input yields exactly the debrief.** No fragments → the entry is the
 *    debrief's lines, nothing more. Strava's Athlete Intelligence became a meme by
 *    generating reflection where the athlete had offered none; the mutant that
 *    invents a line here fails `composeEntry.test.ts`.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { Debrief, DebriefLine } from '@/lib/coach/debrief';
import type { MindCheckIn } from '@/lib/mindCheckIns';

export interface EntryFragment {
  /** 'session' = the whole-session jot field; 'exercise' = a per-exercise note. */
  source: 'session' | 'exercise';
  /** Exercise name for exercise fragments — the attribution shown before the text. */
  label?: string;
  text: string;
}

/** The check-in strip on an entry — only fields the athlete actually rated. */
export interface SessionEntryCheckIn {
  sleep?: number;
  mood?: number;
  stress?: number;
  energy?: number;
  soreness?: number;
}

export interface ComposedSessionEntry {
  /**
   * The athlete's words, one string per fragment, exercise fragments prefixed
   * "name: ". Plain strings so the post-hoc editor is a textarea, not a form.
   */
  fragments: string[];
  /** The machine's lines — exactly the debrief's, never augmented. */
  lines: DebriefLine[];
  checkIn?: SessionEntryCheckIn;
}

function splitLines(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Everything the athlete wrote during this session, in the order they lived it:
 * the session-level jot first (it is about the whole session), then each
 * exercise's note in log order. `.184` folds Android's per-set notes into the
 * exercise note newline-joined, so a note may be several lines — each becomes its
 * own fragment under the same exercise name.
 *
 * `resolveName` keeps this module pure — the caller owns the exercise catalog.
 */
export function collectFragments(
  log: Pick<CompletedWorkoutLog, 'exercises'>,
  sessionNote: string | null | undefined,
  resolveName: (exerciseId: string) => string = (id) => id.replace(/-/g, ' ')
): EntryFragment[] {
  const fragments: EntryFragment[] = splitLines(sessionNote).map((text) => ({
    source: 'session' as const,
    text,
  }));
  for (const ex of log.exercises) {
    for (const text of splitLines(ex.note)) {
      fragments.push({ source: 'exercise', label: resolveName(ex.exerciseId), text });
    }
  }
  return fragments;
}

function checkInStrip(
  checkIn: Pick<MindCheckIn, 'sleep' | 'mood' | 'stress' | 'energy' | 'soreness'> | null | undefined
): SessionEntryCheckIn | undefined {
  if (!checkIn) return undefined;
  const rated = (n: number | undefined): n is number => typeof n === 'number' && n >= 1 && n <= 5;
  const strip: SessionEntryCheckIn = {};
  if (rated(checkIn.sleep)) strip.sleep = checkIn.sleep;
  if (rated(checkIn.mood)) strip.mood = checkIn.mood;
  if (rated(checkIn.stress)) strip.stress = checkIn.stress;
  if (rated(checkIn.energy)) strip.energy = checkIn.energy;
  if (rated(checkIn.soreness)) strip.soreness = checkIn.soreness;
  return Object.keys(strip).length > 0 ? strip : undefined;
}

export function composeSessionEntry(
  debrief: Pick<Debrief, 'lines'>,
  fragments: EntryFragment[],
  checkIn?: Pick<MindCheckIn, 'sleep' | 'mood' | 'stress' | 'energy' | 'soreness'> | null
): ComposedSessionEntry {
  return {
    fragments: fragments
      .filter((f) => f.text.trim().length > 0)
      .map((f) => (f.label ? `${f.label}: ${f.text.trim()}` : f.text.trim())),
    lines: debrief.lines.map((l) => ({ kind: l.kind, text: l.text })),
    checkIn: checkInStrip(checkIn),
  };
}
