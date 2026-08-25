/**
 * This-device resume + Finish-partial (`.963`).
 *
 * Desk → gym is `openSessionContinuity` (`.958`). This file is leave Train
 * for Today / week / Wednesday / receipt and come back — same session —
 * or Finish writes the sets they actually did. No Force Sync. No
 * Session Expired. Empty leftovers invent no volume.
 */
import { calculateVolume } from '@/lib/utils';
import { parseOptionalRir } from '@/lib/workout/rir';
import { parseOptionalRpe10 } from '@/lib/workout/rpe10';
import { parseOptionalLoadPct } from '@/lib/workout/setRowPercent';
import { countsTowardVolume } from '@/lib/workout/setKind';
import { parseOptionalTempo } from '@/lib/workout/tempo';
import { completedLoggedSet } from '@/lib/workout/unilateral';
import { findNextSet } from '@/lib/workout/activeWorkoutHelpers';
import { stripOrphanGroups } from '@/lib/workout/superset';
import type { ActiveWorkout, CompletedWorkoutLog } from '@/types';

export type ThisDeviceResume =
  | {
      action: 'resume';
      clientId: string | undefined;
      nextSet: { exIdx: number; setIdx: number } | null;
    }
  | { action: 'empty' };

export type ProtectLiveStart = 'keep' | 'start';

export type FinishPartialResult = {
  exercises: CompletedWorkoutLog['exercises'];
  volume: number;
};

/**
 * A session they already tapped Start on — even 0 completed sets.
 * Malformed persist is not live (Start may replace it).
 */
export function isLiveThisDeviceSession(
  active: ActiveWorkout | null | undefined
): active is ActiveWorkout {
  if (!active || typeof active !== 'object') return false;
  if (!Array.isArray(active.exercises)) return false;
  return active.exercises.every(
    (ex) => !!ex && typeof ex === 'object' && Array.isArray(ex.sets)
  );
}

export function decideThisDeviceResume(
  active: ActiveWorkout | null | undefined
): ThisDeviceResume {
  if (!isLiveThisDeviceSession(active)) return { action: 'empty' };
  return {
    action: 'resume',
    clientId: active.clientId,
    nextSet: findNextSet(active.exercises),
  };
}

/** Start / Wednesday / Coach session consult this before `startWorkout`. */
export function protectLiveStart(
  active: ActiveWorkout | null | undefined
): ProtectLiveStart {
  return isLiveThisDeviceSession(active) ? 'keep' : 'start';
}

/**
 * Logged work only. Leftover empty planned sets are dropped.
 * Empty session ⇒ `null` (invents nothing).
 */
export function finishPartialFromActive(
  active: ActiveWorkout | null | undefined
): FinishPartialResult | null {
  if (!isLiveThisDeviceSession(active)) return null;

  const exercises = active.exercises
    .map((ex) => {
      const sets = ex.sets
        .filter((s) => s.completed)
        .map((s) => {
          const rec = completedLoggedSet(s, ex.exerciseId);
          const rir = parseOptionalRir(s.rir);
          const rpe10 = parseOptionalRpe10(s.rpe10);
          const tempo = parseOptionalTempo(s.tempo);
          const loadPct = parseOptionalLoadPct(s.loadPct);
          return {
            ...rec,
            ...(rir !== undefined ? { rir } : {}),
            ...(rpe10 !== undefined ? { rpe10 } : {}),
            ...(tempo ? { tempo } : {}),
            ...(loadPct !== undefined ? { loadPct } : {}),
          };
        });
      return {
        exerciseId: ex.exerciseId,
        sets,
        ...(ex.note?.trim() ? { note: ex.note.trim() } : {}),
        ...(ex.muscleGroups?.length ? { muscleGroups: [...ex.muscleGroups] } : {}),
        ...(ex.prescribed ? { prescribed: true as const } : {}),
        ...(ex.supersetGroup?.trim() ? { supersetGroup: ex.supersetGroup.trim() } : {}),
      };
    })
    .filter((ex) => ex.sets.length > 0);

  const grouped = stripOrphanGroups(exercises);

  if (grouped.length === 0) return null;

  const volumeSets = grouped.flatMap((e) => e.sets).filter((s) => countsTowardVolume(s.kind));
  return {
    exercises: grouped,
    volume: calculateVolume(volumeSets),
  };
}
