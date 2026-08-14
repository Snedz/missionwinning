/**
 * Forge-style Just Go — rule-based session from readiness (no AI key).
 * Free forever. Prefer coach today's session when provided by caller.
 * See docs/DESIGN_RESEARCH.md § Wave 3.
 */

import { EXERCISES } from '@/data/exercises';
import { FREE_STARTER_PROGRAMS } from '@/data/starterPrograms';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { MAJOR_GROUPS } from '@/lib/muscleGroups';
import type { ReadinessInfo, RecommendedFocus } from '@/lib/score';
import { suggestNextSetTarget } from '@/lib/workout/nextSetTargets';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog, WorkoutExerciseTemplate } from '@/types';
import { kitMatchesExercise, type HomeGymKit } from '@/lib/workout/homeGymKit';

export type JustGoSession = {
  name: string;
  focusGroup: MuscleGroup;
  exercises: WorkoutExerciseTemplate[];
  source: 'coach' | 'focus' | 'starter';
};

export type CoachSessionLike = {
  name: string;
  status?: string;
  focusGroups?: MuscleGroup[];
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    loadPct?: number;
  }[];
};

const FOCUS_STARTER_HINTS: Partial<Record<MuscleGroup, string[]>> = {
  Chest: ['upper', 'push', 'full body'],
  Back: ['pull', 'upper', 'full body'],
  Legs: ['lower', 'full body', '5x5'],
  Shoulders: ['upper', 'push', 'full body'],
  Arms: ['upper', 'push', 'pull'],
  Core: ['mobility', 'bodyweight', 'full body'],
};

function lastSessionSets(history: CompletedWorkoutLog[], exerciseId: string) {
  for (const log of history) {
    const ex = log.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex?.sets.length) return ex.sets;
  }
  return null;
}

function seedExerciseFromHistory(
  exerciseId: string,
  setCount: number,
  defaultReps: number,
  defaultWeight: number,
  history: CompletedWorkoutLog[],
  units: UnitsPref,
  /** The athlete's goal range — without it every Just Go session assumes 8-12. */
  repRange?: { min: number; max: number }
): WorkoutExerciseTemplate {
  const last = lastSessionSets(history, exerciseId);
  const sets = Array.from({ length: Math.max(1, setCount) }, (_, i) => {
    if (last) {
      const target = suggestNextSetTarget(last, i, units, {
        repMin: repRange?.min,
        repMax: repRange?.max,
      });
      if (target) return { reps: target.reps, weight: target.weight };
      const match = last[i] ?? last[last.length - 1];
      return { reps: match.reps, weight: match.weight };
    }
    return { reps: defaultReps, weight: defaultWeight };
  });
  return { exerciseId, sets };
}

function pickExercisesForFocus(
  focus: MuscleGroup,
  equipment: string,
  count: number,
  kit?: HomeGymKit | null
): { exerciseId: string; reps: number }[] {
  const bodyweight = equipment === 'bodyweight' || equipment === 'minimal';
  let pool = EXERCISES.filter((e) => e.muscleGroups.includes(focus));
  if (kit) {
    pool = pool.filter((e) => kitMatchesExercise(e, kit));
  } else if (bodyweight) {
    const bw = pool.filter(
      (e) =>
        !e.equipment ||
        e.equipment.toLowerCase().includes('bodyweight') ||
        e.equipment.toLowerCase().includes('none')
    );
    if (bw.length >= 2) pool = bw;
  }
  // Prefer compounds (multi-group) first
  pool = [...pool].sort((a, b) => b.muscleGroups.length - a.muscleGroups.length);
  const picked: { exerciseId: string; reps: number }[] = [];
  for (const ex of pool) {
    if (picked.length >= count) break;
    if (picked.some((p) => p.exerciseId === ex.id)) continue;
    picked.push({ exerciseId: ex.id, reps: 8 });
  }
  return picked;
}

function starterForFocus(focus: MuscleGroup): WorkoutExerciseTemplate[] | null {
  const hints = FOCUS_STARTER_HINTS[focus] ?? ['full body'];
  for (const hint of hints) {
    const hit = FREE_STARTER_PROGRAMS.find((p) => p.name.toLowerCase().includes(hint));
    if (hit) return hit.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
  }
  return FREE_STARTER_PROGRAMS[0]?.exercises ?? null;
}

/**
 * Build a Just Go session. Prefer `coachToday` when present and not done.
 */
export function buildJustGoSession(opts: {
  focus: RecommendedFocus;
  readiness: Record<MuscleGroup, ReadinessInfo>;
  history: CompletedWorkoutLog[];
  units: UnitsPref;
  equipment?: string;
  homeGymKit?: HomeGymKit | null;
  coachToday?: CoachSessionLike | null;
}): JustGoSession {
  const { focus, history, units, equipment = 'full-gym', homeGymKit = null, coachToday } = opts;

  if (coachToday && coachToday.status !== 'done' && coachToday.exercises.length > 0) {
    const exercises = coachToday.exercises.map((ex) => {
      const seeded = seedExerciseFromHistory(
        ex.exerciseId,
        ex.sets,
        ex.reps,
        ex.weight,
        history,
        units
      );
      return {
        ...seeded,
        // Prefer Coach absolute prescription when present; keep loadPct for Active chip.
        sets:
          ex.weight > 0
            ? Array.from({ length: Math.max(1, ex.sets) }, () => ({
                reps: ex.reps,
                weight: ex.weight,
              }))
            : seeded.sets,
        ...(ex.loadPct != null && ex.loadPct > 0 ? { loadPct: ex.loadPct } : {}),
        // Same flag as planSessionToTemplates — Today Just Go must not re-guess
        // coach numbers via suggestNextSetTarget (see ActiveWorkoutPage getSetInput).
        prescribed: true,
      };
    });
    return {
      name: coachToday.name,
      focusGroup: coachToday.focusGroups?.[0] ?? focus.group,
      exercises,
      source: 'coach',
    };
  }

  const picked = pickExercisesForFocus(focus.group, equipment, 4, homeGymKit);
  if (picked.length >= 2) {
    const exercises = picked.map((p) =>
      seedExerciseFromHistory(p.exerciseId, 3, p.reps, 0, history, units)
    );
    return {
      name: `Just Go — ${focus.group}`,
      focusGroup: focus.group,
      exercises,
      source: 'focus',
    };
  }

  let starter = starterForFocus(focus.group) ?? [];
  if (homeGymKit) {
    starter = starter.filter((ex) => {
      const data = EXERCISES.find((e) => e.id === ex.exerciseId);
      return data ? kitMatchesExercise(data, homeGymKit) : false;
    });
  }
  const exercises = starter.map((ex) =>
    seedExerciseFromHistory(
      ex.exerciseId,
      ex.sets.length || 3,
      ex.sets[0]?.reps ?? 8,
      ex.sets[0]?.weight ?? 0,
      history,
      units
    )
  );

  return {
    name: `Just Go — ${focus.group}`,
    focusGroup: focus.group,
    exercises,
    source: 'starter',
  };
}

/** Compact freshness rows for Today strip (Forge-style). */
export function muscleFreshnessRows(
  readiness: Record<MuscleGroup, ReadinessInfo>
): { group: MuscleGroup; days: number; recommended: boolean }[] {
  return MAJOR_GROUPS.map((group) => {
    const r = readiness[group];
    const days = r.days === 99 ? 99 : r.days;
    return {
      group,
      days,
      recommended: days >= 4 || days === 99,
    };
  });
}

/**
 * Equipment-aware Just Go preview for I-Day (no history/readiness required).
 * Used so Welcome can show a real first session instead of an abstract score.
 */
export function previewJustGoForEquipment(
  equipment: string,
  units: UnitsPref = 'metric'
): JustGoSession {
  const equip =
    equipment === 'bodyweight' || equipment === 'minimal'
      ? 'bodyweight'
      : equipment === 'dumbbells' || equipment === 'bands'
        ? 'dumbbells'
        : 'full-gym';
  const readiness = {} as Record<MuscleGroup, ReadinessInfo>;
  for (const g of MAJOR_GROUPS) {
    readiness[g] = { days: 99, statusKey: 'todayReadinessPrime' };
  }
  return buildJustGoSession({
    focus: { group: 'Legs', statusKey: 'todayReadinessPrime' },
    readiness,
    history: [],
    units,
    equipment: equip,
  });
}
