/**
 * Repeat this session (`.1026`).
 *
 * Copy a finished History log into the one live Start — the sets
 * they actually logged, not a rebuilt template. Empty / missing /
 * tomb invents nothing. Live this-device session still wins (`.963`).
 * Does not write the saved notebook (`.960`). Not a shop. Not a Feed.
 * Pure: no store, no fetch.
 */

import type {
  ActiveWorkout,
  CompletedWorkoutLog,
  SetKind,
  SetSide,
  WorkoutExerciseTemplate,
  WorkoutSetTemplate,
} from '@/types';
import { stripOrphanGroups } from '@/lib/workout/superset';
import { protectLiveStart } from '@/lib/workout/sessionResume';

export type RepeatThisSessionDecision =
  | { kind: 'empty' }
  | { kind: 'resume-live' }
  | { kind: 'start'; name: string; exercises: WorkoutExerciseTemplate[] };

const SET_KINDS = new Set<SetKind>(['normal', 'warmup', 'failure', 'drop']);
const SET_SIDES = new Set<SetSide>(['L', 'R', 'alt']);

type FinishedLog = Pick<
  CompletedWorkoutLog,
  'workoutName' | 'exercises' | 'deletedAt'
>;
type LoggedSetRow = FinishedLog['exercises'][number]['sets'][number];

function honestSet(raw: LoggedSetRow): WorkoutSetTemplate | null {
  const reps =
    typeof raw.reps === 'number' && Number.isFinite(raw.reps) ? raw.reps : null;
  const weight =
    typeof raw.weight === 'number' && Number.isFinite(raw.weight) && raw.weight >= 0
      ? raw.weight
      : null;
  const duration =
    typeof raw.durationSeconds === 'number' &&
    Number.isFinite(raw.durationSeconds) &&
    raw.durationSeconds > 0
      ? raw.durationSeconds
      : null;
  const kind = raw.kind && SET_KINDS.has(raw.kind) ? raw.kind : undefined;
  const side = raw.side && SET_SIDES.has(raw.side) ? raw.side : undefined;

  const hasWork =
    (reps != null && reps > 0) || duration != null || (weight != null && weight > 0);
  if (!hasWork) return null;

  const set: WorkoutSetTemplate = {
    reps: reps != null && reps > 0 ? reps : 0,
    weight: weight ?? 0,
  };
  if (kind) set.kind = kind;
  if (duration != null) set.durationSeconds = duration;
  if (side) set.side = side;
  return set;
}

export function copyLoggedExercisesForStart(
  log: FinishedLog
): { name: string; exercises: WorkoutExerciseTemplate[] } | null {
  if (log.deletedAt) return null;
  if (!log.exercises?.length) return null;

  const exercises: WorkoutExerciseTemplate[] = [];
  for (const ex of log.exercises) {
    if (!ex.exerciseId) continue;
    const sets: WorkoutSetTemplate[] = [];
    for (const raw of ex.sets ?? []) {
      const set = honestSet(raw);
      if (set) sets.push(set);
    }
    if (sets.length === 0) continue;
    exercises.push({
      exerciseId: ex.exerciseId,
      sets,
      ...(ex.supersetGroup?.trim() ? { supersetGroup: ex.supersetGroup.trim() } : {}),
    });
  }
  if (exercises.length === 0) return null;

  const name = (log.workoutName || 'Session').trim() || 'Session';
  return { name, exercises: stripOrphanGroups(exercises) };
}

export function decideRepeatThisSession(input: {
  log: FinishedLog | null | undefined;
  active?: ActiveWorkout | null;
}): RepeatThisSessionDecision {
  if (!input.log) return { kind: 'empty' };
  const copied = copyLoggedExercisesForStart(input.log);
  if (!copied) return { kind: 'empty' };
  if (protectLiveStart(input.active) === 'keep') return { kind: 'resume-live' };
  return { kind: 'start', name: copied.name, exercises: copied.exercises };
}
