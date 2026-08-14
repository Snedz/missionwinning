/**
 * Compact citations the chat route may hold — never raw workout logs.
 *
 * The schema comment on coachChatSchema is the contract: the model sees
 * quotable facts (exercise, load, date) the athlete can check against
 * memory. Tombstones, warmups, and zero-rep rows are not facts.
 */

import type { CompletedWorkoutLog } from '@/types';
import type { CoachLogFact, CoachWeekSessionFact } from '@/lib/coach/agent/types';
import { getExerciseById } from '@/data/exercises';
import { localDateKey, localDateKeyFromIso } from '@/lib/time/localDate';

export const MAX_COACH_LOG_FACTS = 12;
export const MAX_COACH_WEEK_SESSIONS = 8;

function isQuotedSet(set: { reps: number; kind?: string }): boolean {
  return (set.reps ?? 0) > 0 && set.kind !== 'warmup';
}

/**
 * Last working set per exercise, most recent exercises first.
 * One fact per exercise so a long history cannot flood the 32KB chat body.
 */
export function slimCoachLogFacts(
  history: CompletedWorkoutLog[],
  options?: { limit?: number; now?: Date }
): CoachLogFact[] {
  const limit = options?.limit ?? MAX_COACH_LOG_FACTS;
  const logs = (Array.isArray(history) ? history : [])
    .filter((w) => w && !w.deletedAt && typeof w.completedAt === 'string')
    .filter((w) => localDateKeyFromIso(w.completedAt) !== '')
    .slice()
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  const facts: CoachLogFact[] = [];
  const seen = new Set<string>();
  for (const log of logs) {
    if (facts.length >= limit) break;
    for (const exercise of log.exercises ?? []) {
      if (facts.length >= limit) break;
      if (!exercise.exerciseId || seen.has(exercise.exerciseId)) continue;
      const set = [...(exercise.sets ?? [])].reverse().find(isQuotedSet);
      if (!set) continue;
      seen.add(exercise.exerciseId);
      facts.push({
        exerciseId: exercise.exerciseId,
        exerciseName: getExerciseById(exercise.exerciseId)?.name ?? exercise.exerciseId,
        weight: set.weight ?? 0,
        reps: set.reps,
        at: log.completedAt,
      });
    }
  }
  return facts;
}

export function countTrainDays14(history: CompletedWorkoutLog[], now: Date = new Date()): number {
  const today = localDateKey(now);
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const cutoffKey = localDateKey(cutoff);
  const days = new Set<string>();
  for (const w of history) {
    if (!w || w.deletedAt) continue;
    const key = localDateKeyFromIso(w.completedAt);
    if (key && key > cutoffKey && key <= today) days.add(key);
  }
  return Math.min(14, days.size);
}

export type CoachPlanSessions = {
  sessions: {
    name: string;
    kind: string;
    status: string;
    exercises?: { exerciseId: string }[];
  }[];
} | null | undefined;

export function slimCoachWeekSessions(
  plan: CoachPlanSessions,
  limit = MAX_COACH_WEEK_SESSIONS
): CoachWeekSessionFact[] {
  if (!plan?.sessions) return [];
  return plan.sessions.slice(0, limit).map((s) => ({
    name: s.name,
    kind: s.kind,
    status: s.status,
    exerciseIds: (s.exercises ?? []).slice(0, 12).map((e) => e.exerciseId),
  }));
}
