/**
 * One shape for logged sets, whichever platform wrote them.
 *
 * Web stores a session as **nested** exercises — `[{exerciseId, sets: [...]}]`. The
 * Android sync route stores the **flat** array Android sends —
 * `[{exerciseId, setIndex, reps, weight, ...}]` — into the same
 * `workout_logs.exercises` jsonb column. Nothing reconciled them, so:
 *
 * - `sessionLoad` reads `ex.sets ?? []` on a flat row, finds nothing, and the session
 *   silently counts as **zero working sets** — invisible in load, debrief and PRs.
 * - `toSyncPayload` reads `ex.sets.length` and **throws** when a pulled flat row is
 *   re-enqueued, taking the sync loop with it.
 * - In the other direction Android's GET hands web-nested rows to an app that expects
 *   flat, so a cross-device athlete breaks both ways.
 *
 * The canonical stored shape is web-nested. This module converts at both boundaries:
 * grouping on write (no new bad rows) and again on read (**heals every row already in
 * the table**, so no backfill migration is needed). The engines stay strict — making
 * them tolerate two shapes would hide the defect in six places instead of fixing it
 * in one.
 *
 * Pure, no imports beyond types.
 */

import type { CompletedWorkoutLog, Rpe, SetKind } from '@/types';

type NestedExercises = CompletedWorkoutLog['exercises'];
type NestedSet = NestedExercises[number]['sets'][number];

/** The row shape Android POSTs and expects back (`mobileSyncSetSchema`). */
export interface FlatSetRow {
  id?: string;
  exerciseId: string;
  exerciseName?: string;
  setIndex?: number;
  reps: number;
  weight: number;
  completedAt?: string;
  sessionId?: string | null;
  weightUnit?: string;
  rpe?: number | null;
  setKind?: string;
  /** Android stores a note per set; web stores one per exercise. See the mapping notes
   *  on `groupFlatSets` / `flattenExercises` — before `.184` this field was dropped in
   *  BOTH directions, so every note silently died at this boundary. */
  note?: string;
}

/**
 * Android records RPE as an integer 6–10 (Borg CR10); web records easy/med/hard.
 *
 * The boundaries follow the conventional RPE↔RIR reading — 6 ≈ 4 reps in reserve
 * (comfortable), 7–8 ≈ 2–3 (working), 9–10 ≈ ≤1 (hard) — and bracket web's own
 * anchors in `coach/load.ts` (`{easy: 5, med: 7, hard: 9}`), so a converted session
 * lands on the same session-RPE the athlete would have got by logging on the web.
 */
export function rpeNumberToCategory(rpe: number | null | undefined): Rpe | undefined {
  if (rpe == null || !Number.isFinite(rpe)) return undefined;
  if (rpe < 6.5) return 'easy';
  if (rpe < 8.5) return 'med';
  return 'hard';
}

/** The reverse, for Android's GET. `easy → 6` because 5 is below Android's schema floor. */
export function rpeCategoryToNumber(rpe: Rpe | undefined): number | undefined {
  if (rpe === 'easy') return 6;
  if (rpe === 'med') return 7;
  if (rpe === 'hard') return 9;
  return undefined;
}

/** Android sends `'normal'` explicitly; web omits it. Unknown kinds are dropped, not guessed. */
export function setKindToKind(setKind: string | undefined): SetKind | undefined {
  if (setKind === 'warmup' || setKind === 'failure' || setKind === 'drop') return setKind;
  return undefined;
}

function isFlatRow(value: unknown): value is FlatSetRow {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  // A flat row names its exercise and carries numbers directly; a nested one has `sets`.
  return (
    typeof v.exerciseId === 'string' &&
    !Array.isArray(v.sets) &&
    typeof v.reps === 'number' &&
    typeof v.weight === 'number'
  );
}

/** True when the stored array is Android's flat shape rather than web's nested one. */
export function isFlatSetArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && isFlatRow(value[0]);
}

/**
 * Flat rows → nested exercises.
 *
 * Exercises keep first-seen order so a superset logged A,B,A,B does not reorder into
 * A,A,B,B; sets within an exercise sort by `setIndex` when present, otherwise by the
 * order they arrived.
 */
export function groupFlatSets(rows: readonly unknown[]): NestedExercises {
  const byExercise = new Map<string, { row: FlatSetRow; order: number }[]>();
  const order: string[] = [];

  rows.forEach((row, i) => {
    // Takes `unknown` deliberately: this is a boundary function fed by a jsonb column
    // and an API body. The guard below is the type check, not the signature.
    if (!isFlatRow(row)) return;
    if (!byExercise.has(row.exerciseId)) {
      byExercise.set(row.exerciseId, []);
      order.push(row.exerciseId);
    }
    byExercise.get(row.exerciseId)!.push({ row, order: i });
  });

  return order.map((exerciseId) => {
    const entries = byExercise.get(exerciseId)!;
    entries.sort((a, b) => {
      const ai = a.row.setIndex ?? a.order;
      const bi = b.row.setIndex ?? b.order;
      return ai === bi ? a.order - b.order : ai - bi;
    });
    const sets: NestedSet[] = entries.map(({ row }) => {
      const set: NestedSet = { reps: row.reps, weight: row.weight };
      const kind = setKindToKind(row.setKind);
      if (kind) set.kind = kind;
      const rpe = rpeNumberToCategory(row.rpe);
      if (rpe) set.rpe = rpe;
      return set;
    });
    // Android's per-set notes fold into web's per-exercise note: distinct non-empty
    // notes, first-seen order, newline-joined. Lossy only when two sets of the same
    // exercise carry different notes — they still both arrive, on separate lines.
    const noteParts: string[] = [];
    for (const { row } of entries) {
      const n = typeof row.note === 'string' ? row.note.trim() : '';
      if (n && !noteParts.includes(n)) noteParts.push(n);
    }
    const ex: NestedExercises[number] = { exerciseId, sets };
    if (noteParts.length > 0) ex.note = noteParts.join('\n');
    return ex;
  });
}

/**
 * Whatever came out of the database → the nested shape the engines require.
 *
 * Identity on already-nested input, so it is safe to call on every read. Anything
 * unrecognisable becomes `[]` — the same invisible-session outcome as today, rather
 * than a throw deep inside a pure engine.
 */
export function normalizeCloudExercises(value: unknown): NestedExercises {
  if (!Array.isArray(value)) return [];
  if (value.length === 0) return [];
  if (isFlatSetArray(value)) return groupFlatSets(value as FlatSetRow[]);

  const out: NestedExercises = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.exerciseId !== 'string' || !Array.isArray(e.sets)) continue;
    const sets: NestedSet[] = [];
    for (const raw of e.sets) {
      if (!raw || typeof raw !== 'object') continue;
      const s = raw as Record<string, unknown>;
      if (typeof s.reps !== 'number' || typeof s.weight !== 'number') continue;
      const set: NestedSet = { reps: s.reps, weight: s.weight };
      const kind = setKindToKind(typeof s.kind === 'string' ? s.kind : undefined);
      if (kind) set.kind = kind;
      // Web writes categorical; tolerate a numeric that slipped through from a mixed row.
      if (s.rpe === 'easy' || s.rpe === 'med' || s.rpe === 'hard') set.rpe = s.rpe;
      else if (typeof s.rpe === 'number') {
        const mapped = rpeNumberToCategory(s.rpe);
        if (mapped) set.rpe = mapped;
      }
      sets.push(set);
    }
    const ex: NestedExercises[number] = { exerciseId: e.exerciseId, sets };
    if (Array.isArray(e.muscleGroups)) ex.muscleGroups = e.muscleGroups as never;
    if (typeof e.note === 'string') ex.note = e.note;
    // Optional coach stamp — Victory honesty after a plan session. Flat Android
    // rows never carry it; nested web rows must not drop it on pull (`.410`).
    if (e.prescribed === true) ex.prescribed = true;
    out.push(ex);
  }
  return out;
}

/** Nested → flat, so Android's GET keeps the contract its installed builds expect. */
export function flattenExercises(
  workoutKey: string,
  completedAt: string,
  exercises: NestedExercises
): FlatSetRow[] {
  const rows: FlatSetRow[] = [];
  let n = 0;
  for (const ex of exercises ?? []) {
    (ex.sets ?? []).forEach((set, setIndex) => {
      const row: FlatSetRow = {
        id: `${workoutKey}-s${n++}`,
        exerciseId: ex.exerciseId,
        exerciseName: '',
        setIndex,
        reps: set.reps,
        weight: set.weight,
        completedAt,
        setKind: set.kind ?? 'normal',
        rpe: rpeCategoryToNumber(set.rpe) ?? null,
      };
      // Web's exercise-level note travels on the first set — the slot Android's
      // per-set schema has for it. Before `.184` it was omitted here entirely.
      if (setIndex === 0 && ex.note?.trim()) row.note = ex.note.trim();
      rows.push(row);
    });
  }
  return rows;
}
