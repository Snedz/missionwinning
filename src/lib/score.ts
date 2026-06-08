import { EXERCISES } from "@/data/exercises";
import type { CompletedWorkoutLog } from "@/types";

const MAJOR_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] as const;
export type MuscleGroup = typeof MAJOR_GROUPS[number];

export interface ReadinessInfo {
  days: number;
  status: string;
}

export interface WinScoreBreakdown {
  streak: number;
  protein: number;
  sessions: number;
  volume: number;
  saved: number;
  total: number;
}

/**
 * Compute muscle readiness from workout history.
 * Returns map of group to {days since last worked, status label}.
 */
export function computeReadiness(workoutHistory: CompletedWorkoutLog[]): Record<MuscleGroup, ReadinessInfo> {
  const lastByGroup: Record<string, Date | null> = {};
  MAJOR_GROUPS.forEach(g => { lastByGroup[g] = null; });

  workoutHistory.forEach(log => {
    const logDate = new Date(log.completedAt);
    log.exercises.forEach(ex => {
      const exData = EXERCISES.find(e => e.id === ex.exerciseId);
      if (!exData) return;
      exData.muscleGroups.forEach(mg => {
        if ((MAJOR_GROUPS as readonly string[]).includes(mg)) {
          const g = mg as MuscleGroup;
          if (!lastByGroup[g] || logDate > lastByGroup[g]!) {
            lastByGroup[g] = logDate;
          }
        }
      });
    });
  });

  const readiness: Record<MuscleGroup, ReadinessInfo> = {} as any;
  MAJOR_GROUPS.forEach(g => {
    const last = lastByGroup[g];
    const days = last ? Math.floor((Date.now() - last.getTime()) / (1000 * 3600 * 24)) : 99;
    let status = 'Prime for growth';
    if (days < 2) status = 'Recovering';
    else if (days < 4) status = 'Good to go';
    readiness[g] = { days, status };
  });
  return readiness;
}

/**
 * Get recommended focus group (longest rested major muscle).
 */
export function getRecommendedFocus(readiness: Record<MuscleGroup, ReadinessInfo>): string {
  const groups = [...MAJOR_GROUPS];
  groups.sort((a, b) => readiness[b].days - readiness[a].days);
  const top = groups[0];
  return `${top} focus — ${readiness[top].status.toLowerCase()}`;
}

/**
 * Compute composite Win / Mission Score (0-100).
 * Uses streak, high protein days, sessions, volume, saved routines.
 * High protein days must be passed in (computed from nutrition logs outside).
 */
export function computeWinScore(params: {
  streak: number;
  highProteinDays: number;
  totalSessions: number;
  totalVolume: number;
  savedCount: number;
}): WinScoreBreakdown {
  const { streak, highProteinDays, totalSessions, totalVolume, savedCount } = params;
  const streakPart = Math.min(streak, 7) / 7 * 22;
  const proteinPart = Math.min(highProteinDays, 7) / 7 * 22;
  const sessionsPart = Math.min(totalSessions, 20) / 20 * 22;
  const volumePart = Math.min(totalVolume, 8000) / 8000 * 22;
  const savedPart = savedCount >= 3 ? 12 : 0;
  const total = Math.min(100, Math.round(streakPart + proteinPart + sessionsPart + volumePart + savedPart));
  return {
    streak: Math.round(streakPart),
    protein: Math.round(proteinPart),
    sessions: Math.round(sessionsPart),
    volume: Math.round(volumePart),
    saved: savedPart,
    total,
  };
}