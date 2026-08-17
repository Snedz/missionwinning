/**
 * Published standings from already-synced logs — no localStorage, no client scores.
 *
 * Same `computeWinScore` contract as `computeLocalLeaderboardSnapshot` for Train
 * and Fuel. Pillars that exist only on-device (Track activities, unsigned mind
 * check-ins, STREAK_KEY override, planned rest) stay 0 / empty here.
 */
import { isLocalDateKey } from '@/lib/time/localDate';
import { streakFromDatesAllowingRest } from '@/lib/plannedRest';
import { computeWinScore } from '@/lib/score';
import { tierToScore } from '@/lib/presidentialFitnessTest';

/** Matches `PROTEIN_THRESHOLD` in challenges.ts. */
const HIGH_PROTEIN_GRAMS = 120;

export type StandingWorkout = {
  completedAt: string;
  totalVolume?: number | null;
  deletedAt?: string | null;
};

export type StandingNutrition = {
  date: unknown;
  protein?: number | null;
};

export type StandingFromLogs = {
  missionScore: number;
  trainingStreak: number;
  weeklyVolume: number;
  fuelDays: number;
  nightSessions: number;
  dawnSessions: number;
  pftScore: number;
  pftTier?: string;
};

function nutritionDateKey(value: unknown): string {
  if (isLocalDateKey(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    return isLocalDateKey(key) ? key : '';
  }
  return '';
}

export function computeStandingFromLogs(input: {
  workouts: readonly StandingWorkout[];
  nutrition: readonly StandingNutrition[];
  pftTier?: string | null;
  todayKey: string;
  weekStartKey: string;
  plannedRestKeys?: readonly string[];
  dateKeyOf: (iso: string) => string;
  hourOf: (iso: string) => number | null;
}): StandingFromLogs {
  const weekStart = isLocalDateKey(input.weekStartKey) ? input.weekStartKey : '';
  const today = isLocalDateKey(input.todayKey) ? input.todayKey : '';
  const live = input.workouts.filter((w) => !w.deletedAt && w.completedAt);

  let sessionsThisWeek = 0;
  let volumeThisWeek = 0;
  let nightSessions = 0;
  let dawnSessions = 0;
  const workoutDateKeys: string[] = [];
  const trainDays = new Set<string>();

  for (const w of live) {
    const dateKey = input.dateKeyOf(w.completedAt);
    if (dateKey) {
      workoutDateKeys.push(dateKey);
      if (weekStart && dateKey >= weekStart) {
        trainDays.add(dateKey);
        sessionsThisWeek += 1;
        const volume = w.totalVolume;
        if (typeof volume === 'number' && Number.isFinite(volume)) {
          volumeThisWeek += volume;
        }
      }
    }
    const hour = input.hourOf(w.completedAt);
    if (hour === null) continue;
    if (hour >= 22 || hour < 5) nightSessions += 1;
    else if (hour >= 5 && hour < 8) dawnSessions += 1;
  }

  const proteinDays = new Set<string>();
  for (const row of input.nutrition) {
    const dateKey = nutritionDateKey(row.date);
    if (!dateKey || !weekStart || dateKey < weekStart) continue;
    const protein = Number(row.protein ?? 0);
    if (Number.isFinite(protein) && protein >= HIGH_PROTEIN_GRAMS) {
      proteinDays.add(dateKey);
    }
  }

  const trainingStreak = today
    ? streakFromDatesAllowingRest(workoutDateKeys, input.plannedRestKeys ?? [], today)
    : 0;

  const fuelDays = proteinDays.size;
  const pftTier = input.pftTier || undefined;
  const pftScore = pftTier ? tierToScore(pftTier) : 0;

  const win = computeWinScore({
    streak: trainingStreak,
    highProteinDays: fuelDays,
    sessionsThisWeek,
    volumeThisWeek,
    trainDaysThisWeek: trainDays.size,
    moveFlows: 0,
    mindSessions: 0,
    trackActivities: 0,
    learnLessons: 0,
  });

  return {
    missionScore: win.total,
    trainingStreak,
    weeklyVolume: volumeThisWeek,
    fuelDays,
    nightSessions,
    dawnSessions,
    pftScore,
    pftTier,
  };
}
