/**
 * Honor the notebook they brought — saved routine over Wednesday / Just Go.
 *
 * `.960`. One named routine they typed, finished, or picked from History.
 * Start uses the notebook. Logs still fill the set-row cite. Empty invents
 * nothing. Does not call generateWeek, Just Go, or a catalog shop.
 */

import type { CompletedWorkoutLog, SavedWorkout, WorkoutExerciseTemplate } from '@/types';
import type { NextDayCite } from '@/lib/coach/nextDayFromLogs';

export type HonoredRoutine = {
  id: string;
  name: string;
  exercises: WorkoutExerciseTemplate[];
};

export type SavedRoutineDraft = {
  name: string;
  exercises: WorkoutExerciseTemplate[];
  note?: string;
};

export type SavedWriteDecision =
  | { kind: 'empty' }
  | { kind: 'add'; draft: SavedRoutineDraft }
  | { kind: 'needs-replace'; existingId: string; draft: SavedRoutineDraft }
  | { kind: 'replace'; existingId: string; draft: SavedRoutineDraft };

export type CiteStart =
  | { source: 'saved'; routine: HonoredRoutine }
  | { source: 'logs'; name: string; exercises: WorkoutExerciseTemplate[] }
  | null;

function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

function isPerformedSet(set: { reps?: number }): boolean {
  return (set.reps ?? 0) > 0;
}

function isLiveLog(log: CompletedWorkoutLog): boolean {
  if (log.deletedAt) return false;
  return (log.exercises ?? []).some((ex) => (ex.sets ?? []).some(isPerformedSet));
}

function sessionName(log: CompletedWorkoutLog): string | null {
  const name = log.workoutName?.trim() || null;
  return name || null;
}

function validExercises(
  exercises: readonly WorkoutExerciseTemplate[] | null | undefined
): WorkoutExerciseTemplate[] {
  const out: WorkoutExerciseTemplate[] = [];
  for (const ex of exercises ?? []) {
    if (!ex?.exerciseId?.trim()) continue;
    const sets = (ex.sets ?? [])
      .map((s) => ({
        reps: typeof s.reps === 'number' && s.reps > 0 ? s.reps : 0,
        weight: typeof s.weight === 'number' && s.weight >= 0 ? s.weight : 0,
        ...(typeof s.loadPct === 'number' && s.loadPct > 0 ? { loadPct: s.loadPct } : {}),
      }))
      .filter((s) => s.reps > 0);
    if (sets.length === 0) continue;
    out.push({
      exerciseId: ex.exerciseId.trim(),
      sets,
      ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
      ...(ex.prescribed ? { prescribed: true } : {}),
    });
  }
  return out;
}

/** Name + lifts they can recognize. Empty name or no lifts ⇒ nothing. */
export function routineFromSession(input: {
  name?: string | null;
  exercises?: readonly WorkoutExerciseTemplate[] | null;
  note?: string | null;
}): SavedRoutineDraft | null {
  const name = input.name?.trim() || '';
  if (!name) return null;
  const exercises = validExercises(input.exercises);
  if (exercises.length === 0) return null;
  const note = input.note?.trim() || undefined;
  return note ? { name, exercises, note } : { name, exercises };
}

export function decideSavedWrite(
  saved: readonly SavedWorkout[],
  input: {
    name?: string | null;
    exercises?: readonly WorkoutExerciseTemplate[] | null;
    note?: string | null;
  },
  opts?: { replace?: boolean }
): SavedWriteDecision {
  const draft = routineFromSession(input);
  if (!draft) return { kind: 'empty' };
  const key = nameKey(draft.name);
  const existing = saved.find((w) => nameKey(w.name) === key);
  if (!existing) return { kind: 'add', draft };
  if (opts?.replace) return { kind: 'replace', existingId: existing.id, draft };
  return { kind: 'needs-replace', existingId: existing.id, draft };
}

function notebookRoutines(saved: readonly SavedWorkout[]): HonoredRoutine[] {
  const seen = new Set<string>();
  const rows = saved
    .map((w) => {
      const draft = routineFromSession(w);
      if (!draft) return null;
      return {
        id: w.id,
        name: draft.name,
        exercises: draft.exercises,
        createdAt: w.createdAt,
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row)
    .sort((a, b) => {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

  const out: HonoredRoutine[] = [];
  for (const row of rows) {
    const key = nameKey(row.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: row.id, name: row.name, exercises: row.exercises });
  }
  return out;
}

function liveNamedLogs(history: readonly CompletedWorkoutLog[]): CompletedWorkoutLog[] {
  return history
    .filter((log) => isLiveLog(log) && sessionName(log))
    .slice()
    .sort((a, b) => (a.completedAt < b.completedAt ? -1 : a.completedAt > b.completedAt ? 1 : 0));
}

function nextUnused(
  rotation: HonoredRoutine[],
  logs: CompletedWorkoutLog[]
): HonoredRoutine {
  if (rotation.length === 1) return rotation[0]!;
  const used = new Set<string>();
  for (const log of logs) {
    const name = sessionName(log);
    if (!name) continue;
    if (used.size === rotation.length) used.clear();
    used.add(nameKey(name));
  }
  return rotation.find((row) => !used.has(nameKey(row.name))) ?? rotation[0]!;
}

/**
 * Next saved routine to Start. Empty notebook ⇒ null (do not invent).
 * One saved ⇒ that one. Several ⇒ unused slot vs live named history.
 */
export function pickHonoredStart(input: {
  saved: readonly SavedWorkout[];
  history: readonly CompletedWorkoutLog[];
}): HonoredRoutine | null {
  const rotation = notebookRoutines(input.saved);
  if (rotation.length === 0) return null;
  return nextUnused(rotation, liveNamedLogs(input.history));
}

/**
 * Wednesday outline Start. Saved notebook wins; log template only when
 * they have no saved routine. Never generateWeek.
 */
export function honorCiteStart(input: {
  cite: NextDayCite | null;
  saved: readonly SavedWorkout[];
  history: readonly CompletedWorkoutLog[];
}): CiteStart {
  const honored = pickHonoredStart({ saved: input.saved, history: input.history });
  if (honored) return { source: 'saved', routine: honored };

  const cite = input.cite;
  if (cite?.template?.exercises?.length) {
    return {
      source: 'logs',
      name: cite.template.name,
      exercises: cite.template.exercises,
    };
  }
  return null;
}
