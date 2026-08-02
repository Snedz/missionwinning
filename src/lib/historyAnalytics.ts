import { EXERCISES } from '@/data/exercises';
import { buildExerciseBenchmark, getExercisesWithBenchmarkData } from '@/lib/benchmarks';
import { resolveMajorMuscleGroups } from '@/lib/exerciseMuscleMap';
import { computeReadiness } from '@/lib/score';
import {
  MAJOR_GROUPS,
  MUSCLE_GROUP_I18N,
  type MuscleGroup,
  type ReadinessStatusKey,
} from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKey, localWeekKey, startOfLocalWeek } from '@/lib/time/localDate';

export interface WeeklyVolumePoint {
  weekStart: string;
  label: string;
  volume: number;
  sessions: number;
}

export interface MuscleHeatCell {
  group: MuscleGroup;
  labelKey: string;
  volume: number;
  sets: number;
  sessions: number;
  daysSince: number;
  intensity: number;
  statusKey: ReadinessStatusKey;
}

/** Monday-based week start (local YYYY-MM-DD) — buckets the volume timeline. */
export function weekStartKey(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : localWeekKey(d);
}

function recentWeekStarts(count: number, locale = 'en'): { key: string; label: string }[] {
  const weeks: { key: string; label: string }[] = [];
  // Must bucket identically to `weekStartKey` or bars land in the wrong column.
  const now = startOfLocalWeek();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = localDateKey(d);
    weeks.push({
      key,
      label: d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    });
  }
  return weeks;
}

/** Weekly total volume + session count for the last N weeks. */
export function buildWeeklyVolumeTimeline(
  history: CompletedWorkoutLog[],
  weeks = 12,
  locale = 'en'
): WeeklyVolumePoint[] {
  const buckets = recentWeekStarts(weeks, locale);
  const byWeek: Record<string, { volume: number; sessions: number }> = {};
  buckets.forEach((b) => {
    byWeek[b.key] = { volume: 0, sessions: 0 };
  });

  for (const log of history) {
    const key = weekStartKey(log.completedAt);
    if (!byWeek[key]) continue;
    byWeek[key].volume += log.totalVolume;
    byWeek[key].sessions += 1;
  }

  return buckets.map((b) => ({
    weekStart: b.key,
    label: b.label,
    volume: byWeek[b.key]?.volume ?? 0,
    sessions: byWeek[b.key]?.sessions ?? 0,
  }));
}

function logsInWindow(history: CompletedWorkoutLog[], windowDays: number): CompletedWorkoutLog[] {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return history.filter((log) => new Date(log.completedAt).getTime() >= cutoff);
}

/** Per major muscle group: recent volume + readiness for heatmap cells. */
export function buildMuscleHeatmap(
  history: CompletedWorkoutLog[],
  windowDays = 14
): MuscleHeatCell[] {
  const readiness = computeReadiness(history);
  const windowLogs = logsInWindow(history, windowDays);

  const volumeByGroup: Record<MuscleGroup, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
  };
  const setsByGroup: Record<MuscleGroup, number> = { ...volumeByGroup };
  const sessionsByGroup: Record<MuscleGroup, number> = { ...volumeByGroup };

  for (const log of windowLogs) {
    const groupsHit = new Set<MuscleGroup>();
    for (const ex of log.exercises) {
      /*
       * Stored groups first, exactly as `readinessIndex` does.
       *
       * This was `EXERCISES.find()` alone, against a catalog whose extended
       * modules load lazily: only the ~126 base exercises exist at import time,
       * so every session built from the extended catalog contributed **zero** to
       * the heatmap. An athlete who trains only extended-catalog movements saw
       * those muscles reported as untrained — silently, with no error anywhere.
       *
       * The catalog lookup stays as the fallback rather than being deleted,
       * because logs written before `muscleGroups` was snapshotted onto the entry
       * have nothing else to resolve from, and `exerciseMuscleMap`'s map is only
       * populated when something has seeded it. Two sources, in priority order,
       * is the correct shape here — not the `.178` two-definitions smell, since
       * one is the log's own record and the other is a backfill for logs that
       * predate it.
       */
      const stored = resolveMajorMuscleGroups(ex.exerciseId, ex.muscleGroups);
      const groups = stored.length
        ? stored
        : (EXERCISES.find((e) => e.id === ex.exerciseId)?.muscleGroups ?? []).filter(
            (mg): mg is MuscleGroup => (MAJOR_GROUPS as readonly string[]).includes(mg)
          );
      const vol = ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
      const setCount = ex.sets.length;
      if (!groups.length) continue;
      const share = 1 / groups.length;
      groups.forEach((g) => {
        volumeByGroup[g] += vol * share;
        setsByGroup[g] += setCount * share;
        groupsHit.add(g);
      });
    }
    groupsHit.forEach((g) => {
      sessionsByGroup[g] += 1;
    });
  }

  const maxVol = Math.max(...MAJOR_GROUPS.map((g) => volumeByGroup[g]), 1);

  return MAJOR_GROUPS.map((group) => ({
    group,
    labelKey: MUSCLE_GROUP_I18N[group],
    volume: Math.round(volumeByGroup[group]),
    sets: Math.round(setsByGroup[group]),
    sessions: sessionsByGroup[group],
    daysSince: readiness[group].days,
    intensity: volumeByGroup[group] / maxVol,
    statusKey: readiness[group].statusKey,
  }));
}

/** Exercise with the most logged sessions (for default 1RM chart). */
export function pickChartExerciseId(history: CompletedWorkoutLog[]): string | null {
  const ids = getExercisesWithBenchmarkData(history);
  if (!ids.length) return null;

  const sessionCounts: Record<string, number> = {};
  for (const log of history) {
    for (const ex of log.exercises) {
      if (ex.sets.some((s) => s.weight > 0 && s.reps > 0)) {
        sessionCounts[ex.exerciseId] = (sessionCounts[ex.exerciseId] || 0) + 1;
      }
    }
  }

  return ids.sort((a, b) => (sessionCounts[b] || 0) - (sessionCounts[a] || 0))[0];
}

export function build1RMChartData(exerciseId: string, history: CompletedWorkoutLog[]) {
  const stats = buildExerciseBenchmark(exerciseId, history);
  if (!stats) return [];
  // Raw ISO, not a label. `.227` — the caller draws the axis and owns the
  // language; a label minted here would be stamped with whatever the app was
  // set to when the memo last ran.
  return stats.timeline.map((p) => ({
    date: p.date,
    estimated: p.estimated1RM,
    actual: p.actual1RM,
  }));
}

export function historySummaryStats(history: CompletedWorkoutLog[]) {
  const recent = history.slice(0, 5);
  const avgVolume =
    recent.length > 0
      ? Math.round(recent.reduce((s, l) => s + l.totalVolume, 0) / recent.length)
      : 0;
  const totalVolume = history.reduce((s, l) => s + l.totalVolume, 0);
  return { avgVolume, totalVolume, sessionCount: history.length };
}
