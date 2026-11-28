import { EXERCISES } from '@/data/exercises';
import type { Exercise } from '@/types';
import type { MuscleGroup } from '@/lib/muscleGroups';
import { equipmentMatches } from '@/lib/coach/equipment';
import { nextTargets } from '@/lib/coach/progression';
import type { CoachContext, PlanExercise, SplitDay } from '@/lib/coach/types';
import { sessionNameFromKey } from '@/lib/coach/splitPlanner';

const RECOVERY_IDS = [
  'cat-camel',
  'bird-dog',
  'dead-bug',
  'glute-bridge',
  'worlds-greatest-stretch',
  'thread-needle',
  'wall-angels',
  'couch-stretch',
] as const;

const GOAL_TAG_MAP: Record<string, string[]> = {
  strength: ['strength'],
  fat_loss: ['conditioning', 'strength'],
  endurance: ['conditioning'],
  mobility: ['corrective'],
  general: ['hypertrophy', 'strength'],
  pft: ['strength', 'conditioning'],
};

function levelAllows(ex: Exercise, experience: string): boolean {
  if (!ex.level) return true;
  if (experience === 'beginner') return ex.level === 'beginner';
  if (experience === 'intermediate') return ex.level !== 'advanced';
  return true;
}

function exerciseCountForDay(
  kind: SplitDay['kind'],
  experience: string,
  strain?: number
): number {
  if (kind === 'recovery') return 4;
  if (kind === 'conditioning') return experience === 'beginner' ? 4 : 6;
  let count: number;
  if (experience === 'beginner') count = 3;
  else if (experience === 'advanced') count = 5;
  else count = 4;
  if (kind === 'strength' && strain !== undefined && strain >= 70) {
    count = Math.max(2, count - 1);
  }
  return count;
}

function historyExerciseIds(history: CoachContext['history']): Set<string> {
  const ids = new Set<string>();
  for (const log of history) {
    for (const ex of log.exercises) ids.add(ex.exerciseId);
  }
  return ids;
}

function intersectsGroups(ex: Exercise, focus: MuscleGroup[]): boolean {
  return ex.muscleGroups.some((g) => focus.includes(g as MuscleGroup));
}

function goalTagScore(ex: Exercise, goalId: string): number {
  const tags = GOAL_TAG_MAP[goalId] ?? GOAL_TAG_MAP.general;
  const exTags = ex.tags ?? [];
  return exTags.some((t) => tags.includes(t)) ? 1 : 0;
}

function rankExercises(
  candidates: Exercise[],
  familiar: Set<string>,
  goalId: string,
  rng: () => number
): Exercise[] {
  return [...candidates].sort((a, b) => {
    const famA = familiar.has(a.id) ? 1 : 0;
    const famB = familiar.has(b.id) ? 1 : 0;
    if (famB !== famA) return famB - famA;

    const compoundA = a.muscleGroups.length >= 2 ? 1 : 0;
    const compoundB = b.muscleGroups.length >= 2 ? 1 : 0;
    if (compoundB !== compoundA) return compoundB - compoundA;

    const tagA = goalTagScore(a, goalId);
    const tagB = goalTagScore(b, goalId);
    if (tagB !== tagA) return tagB - tagA;

    return rng() - 0.5;
  });
}

function recoveryCandidates(): Exercise[] {
  return RECOVERY_IDS.flatMap((id) => {
    const exercise = EXERCISES.find((e) => e.id === id);
    return exercise ? [exercise] : [];
  });
}

export function compatibleSessionCandidates(
  day: Pick<SplitDay, 'kind' | 'focusGroups'>,
  ctx: CoachContext
): Exercise[] {
  const pool = day.kind === 'recovery' ? recoveryCandidates() : EXERCISES;
  return pool.filter((ex) =>
    equipmentMatches(ex, ctx.equipment, ctx.homeGymKit) &&
    (day.kind === 'recovery' || levelAllows(ex, ctx.experience)) &&
    (day.kind === 'recovery' || (day.kind === 'conditioning'
      ? ex.tags?.includes('conditioning') || ex.muscleGroups.includes('Cardio') ||
        ex.muscleGroups.includes('Full Body')
      : intersectsGroups(ex, day.focusGroups)))
  );
}

export function planExerciseForSession(ex: Exercise, kind: SplitDay['kind'], ctx: CoachContext): PlanExercise {
  if (kind === 'recovery') {
    return { exerciseId: ex.id, sets: 2, reps: 10, weight: 0, whyKey: 'coachWhyRecovery' };
  }
  return {
    exerciseId: ex.id,
    ...nextTargets(ex.id, ctx.history, ctx.units, ctx.goalId, ctx.experience, ctx.loadZone),
  };
}

export function estimateMinutes(exercises: PlanExercise[], kind: SplitDay['kind']): number {
  const perEx = kind === 'conditioning' ? 5 : 8;
  const base = exercises.reduce((s, e) => s + e.sets * perEx, 0);
  return Math.max(20, Math.min(60, Math.round(base)));
}

export function pickExercises(
  day: SplitDay,
  ctx: CoachContext,
  rng: () => number
): { exercises: PlanExercise[]; estMinutes: number } {
  if (day.kind === 'recovery') {
    const exercises = recoveryCandidates().sort(() => rng() - 0.5).slice(0, 4)
      .map((ex) => planExerciseForSession(ex, day.kind, ctx));
    return { exercises, estMinutes: estimateMinutes(exercises, day.kind) };
  }

  const familiar = historyExerciseIds(ctx.history);
  const count = exerciseCountForDay(day.kind, ctx.experience, ctx.bodyScores.strain);

  const ranked = rankExercises(compatibleSessionCandidates(day, ctx), familiar, ctx.goalId, rng);
  const picked: Exercise[] = [];
  const usedGroups = new Set<MuscleGroup>();

  for (const ex of ranked) {
    if (picked.length >= count) break;
    const primary = ex.muscleGroups.find((g) => day.focusGroups.includes(g as MuscleGroup));
    if (!primary) continue;
    if (picked.length > 0 && usedGroups.has(primary as MuscleGroup) && picked.length < count - 1) {
      continue;
    }
    picked.push(ex);
    usedGroups.add(primary as MuscleGroup);
  }

  while (picked.length < count && ranked.length > picked.length) {
    const next = ranked.find((e) => !picked.includes(e));
    if (!next) break;
    picked.push(next);
  }

  const exercises = picked.map((ex) => planExerciseForSession(ex, day.kind, ctx));

  return { exercises, estMinutes: estimateMinutes(exercises, day.kind) };
}

export function buildSession(
  day: SplitDay,
  dayOffset: number,
  weekStart: string,
  ctx: CoachContext,
  rng: () => number
): import('@/lib/coach/types').PlanSession {
  const { exercises, estMinutes } = pickExercises(day, ctx, rng);
  const name = sessionNameFromKey(day.nameKey, day.focusGroups);
  return {
    id: `${weekStart}-d${dayOffset}`,
    dayOffset,
    kind: day.kind,
    name,
    focusGroups: day.focusGroups,
    exercises,
    estMinutes,
    status: 'planned',
  };
}
