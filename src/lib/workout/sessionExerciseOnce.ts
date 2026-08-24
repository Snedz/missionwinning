/**
 * Skip or swap this exercise once, this session (`.959`).
 *
 * Active list only. Does not write the Coach plan, saved routines,
 * or Wednesday. Empty / missing index invents nothing.
 */

import { getExerciseById } from '@/data/exercises';
import { applyGarageSwapToActive, garageEquipmentChanged } from '@/lib/workout/garageSwap';
import { unpair } from '@/lib/workout/superset';
import type { ActiveExerciseLog, MuscleGroup } from '@/types';

export function isSkippedThisSession(ex: { skippedThisSession?: boolean } | null | undefined): boolean {
  return ex?.skippedThisSession === true;
}

export function skipExerciseThisSession(
  exercises: readonly ActiveExerciseLog[],
  index: number
): ActiveExerciseLog[] | null {
  if (!exercises.length) return null;
  if (!Number.isInteger(index) || index < 0 || index >= exercises.length) return null;
  const current = exercises[index];
  if (!current || isSkippedThisSession(current)) return null;
  const unpaired = unpair(exercises.slice(), index);
  return unpaired.map((ex, i) => (i === index ? { ...ex, skippedThisSession: true } : ex));
}

export function swapExerciseThisSession(
  exercises: readonly ActiveExerciseLog[],
  index: number,
  nextId: string,
  nextMuscleGroups?: MuscleGroup[]
): ActiveExerciseLog[] | null {
  if (!exercises.length) return null;
  if (!Number.isInteger(index) || index < 0 || index >= exercises.length) return null;
  const current = exercises[index];
  if (!current || isSkippedThisSession(current)) return null;
  if (current.sets.some((s) => s.completed)) return null;
  const id = nextId.trim();
  if (!id || id === current.exerciseId) return null;
  const to = getExerciseById(id);
  const from = getExerciseById(current.exerciseId);
  const swapped = applyGarageSwapToActive({
    current,
    nextId: id,
    nextMuscleGroups: nextMuscleGroups?.length ? nextMuscleGroups : to?.muscleGroups,
    // Unknown id (tests / custom name) keeps load — do not invent an equipment change.
    equipmentChanged: to ? garageEquipmentChanged(from?.equipment, to.equipment) : false,
  });
  return exercises.map((ex, i) => (i === index ? swapped : ex));
}
