/**
 * The session journal — what the coach said, kept.
 *
 * `buildDebrief` composes tone-tested prose at the moment a session finishes, the
 * victory sheet shows it once, and then it was gone: nothing persisted it, so
 * re-opening a session from History could not show the debrief it was given. For a
 * journal that is fatal — the machine half of every entry (the "transcript" in the
 * Granola analogy) evaporated at the close of the sheet.
 *
 * **Device-only, deliberately.** Workout *data* already syncs through sync v2; this
 * store holds derived prose and, from `.185`, the athlete's own written fragments —
 * journal content in the Day One sense, the data class users have historically
 * 1-starred apps over. It stays on this device, and it rides device backup for free
 * via the `mw_` prefix sweep in `lib/backup.ts`. If journal sync ever ships it will
 * be its own decision with its own encryption, not a side effect of a storage key.
 *
 * Capped at 200 entries, oldest dropped — the same bounded-growth posture as every
 * other `mw_` store. Keyed by the log's id so History can join back to it.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import type { DebriefLineKind } from '@/lib/coach/debrief';
import type { LoadZone } from '@/lib/coach/load';

export const JOURNAL_MAX_ENTRIES = 200;

export interface SessionJournalEntry {
  /** `CompletedWorkoutLog.id` — the join key back to history. */
  workoutId: string;
  date: string;
  workoutName: string;
  zone: LoadZone;
  lines: { kind: DebriefLineKind; text: string }[];
  /**
   * `.185` — the athlete's own words, verbatim, shown before the machine's lines.
   * Exercise-note fragments arrive prefixed "exercise name: " (see composeEntry).
   */
  fragments?: string[];
  /**
   * Check-in strip captured at finish — only fields the athlete rated, plus
   * (`.190`) pre-formatted behavior strings, which are counts and times rather
   * than 1–5 ratings and so are kept apart from them.
   */
  checkIn?: {
    sleep?: number;
    mood?: number;
    stress?: number;
    energy?: number;
    soreness?: number;
    behaviors?: string[];
  };
  /** 1–5 from the victory sheet's feel buttons, when the athlete tapped one. */
  feel?: number;
  savedAt: string;
}

function load(): SessionJournalEntry[] {
  const entries = readJson<SessionJournalEntry[]>(STORAGE_KEYS.sessionJournal, []);
  if (!Array.isArray(entries)) return [];
  return entries.filter(
    (e): e is SessionJournalEntry =>
      !!e && typeof e.workoutId === 'string' && Array.isArray(e.lines)
  );
}

/** Upsert by workoutId: finishing twice (edit-and-recomplete) replaces, never duplicates. */
export function saveJournalEntry(entry: SessionJournalEntry): void {
  const rest = load().filter((e) => e.workoutId !== entry.workoutId);
  writeJson(STORAGE_KEYS.sessionJournal, [entry, ...rest].slice(0, JOURNAL_MAX_ENTRIES));
}

export function getJournalEntry(workoutId: string): SessionJournalEntry | null {
  return load().find((e) => e.workoutId === workoutId) ?? null;
}

/** Newest first. */
export function listJournalEntries(limit = JOURNAL_MAX_ENTRIES): SessionJournalEntry[] {
  return load().slice(0, limit);
}

/**
 * Post-hoc edit (Granola's second half): replace an entry's fragments with what
 * the athlete typed in the journal editor. Their words only — the machine's lines
 * are not editable, because an edited debrief would claim the rules said something
 * they did not. No entry → no-op; editing must never mint one.
 */
export function updateJournalFragments(workoutId: string, fragments: string[]): void {
  const entries = load();
  if (!entries.some((e) => e.workoutId === workoutId)) return;
  const cleaned = fragments.map((f) => f.trim()).filter((f) => f.length > 0);
  writeJson(
    STORAGE_KEYS.sessionJournal,
    entries.map((e) =>
      e.workoutId === workoutId
        ? { ...e, fragments: cleaned.length > 0 ? cleaned : undefined }
        : e
    )
  );
}

/** Record the athlete's feel tap onto an already-saved entry. */
export function setJournalFeel(workoutId: string, feel: number): void {
  const entries = load();
  const target = entries.find((e) => e.workoutId === workoutId);
  if (!target) return;
  writeJson(
    STORAGE_KEYS.sessionJournal,
    entries.map((e) => (e.workoutId === workoutId ? { ...e, feel } : e))
  );
}
