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

export interface BodyScores {
  readiness: number;
  strain: number;
  recovery: number;
  readinessLabel: string;
  strainLabel: string;
  recoveryLabel: string;
}

function scoreLabel(v: number, low: string, mid: string, high: string): string {
  return v >= 70 ? high : v >= 40 ? mid : low;
}

/**
 * Aggregate Readiness / Strain / Recovery (0–100) from workout history and optional context.
 */
export function computeBodyScores(
  workoutHistory: CompletedWorkoutLog[],
  opts?: { assessmentRisk?: string; pillarWins?: number }
): BodyScores {
  const readinessMap = computeReadiness(workoutHistory);
  const groupScores = Object.values(readinessMap).map((r) =>
    r.days === 99 ? 50 : r.days >= 4 ? 90 : r.days >= 2 ? 70 : 40
  );
  let readiness = Math.round(groupScores.reduce((a, b) => a + b, 0) / groupScores.length);
  if (opts?.assessmentRisk === 'high') readiness = Math.max(20, readiness - 20);
  else if (opts?.assessmentRisk === 'moderate') readiness = Math.max(30, readiness - 10);

  const last7 = workoutHistory.filter(
    (w) => (Date.now() - new Date(w.completedAt).getTime()) / 86400000 <= 7
  );
  const strain = Math.min(
    100,
    Math.round(last7.length * 12 + last7.reduce((s, w) => s + w.totalVolume, 0) / 200)
  );

  const daysSince = workoutHistory[0]
    ? Math.floor((Date.now() - new Date(workoutHistory[0].completedAt).getTime()) / 86400000)
    : 3;
  const restBonus = daysSince >= 2 ? 25 : daysSince === 1 ? 10 : 0;
  const pillarBonus = Math.min(20, (opts?.pillarWins ?? 0) * 5);
  const recovery = Math.min(100, Math.max(0, 100 - strain + restBonus + pillarBonus));

  return {
    readiness,
    strain,
    recovery,
    readinessLabel: scoreLabel(readiness, 'Rest up', 'Train smart', 'Prime to push'),
    strainLabel: scoreLabel(strain, 'Light week', 'Moderate load', 'High load'),
    recoveryLabel: scoreLabel(recovery, 'Needs rest', 'Rebuilding', 'Fully recovered'),
  };
}

export interface CoachInsight {
  message: string;
  actionLabel: string;
  actionPath: string;
}

/**
 * Rule-based daily coaching insight from body scores and recommended focus.
 */
export function getCoachInsight(
  scores: BodyScores,
  recommendedFocus: string,
  opts?: { assessmentRisk?: string }
): CoachInsight {
  if (opts?.assessmentRisk === 'high') {
    return {
      message: 'Your assessment flagged elevated risk. Prioritize recovery, mobility, and light movement today.',
      actionLabel: 'Try recovery flow',
      actionPath: '/move',
    };
  }
  if (scores.strain >= 70 && scores.recovery < 50) {
    return {
      message: 'High training load with low recovery. A mobility or rest day will help you come back stronger.',
      actionLabel: 'Open Move pillar',
      actionPath: '/move',
    };
  }
  if (scores.readiness >= 70 && scores.strain < 60) {
    return {
      message: `You're primed to train. ${recommendedFocus.charAt(0).toUpperCase()}${recommendedFocus.slice(1)}.`,
      actionLabel: 'Start workout',
      actionPath: '/active',
    };
  }
  if (scores.recovery >= 70 && scores.strain >= 50) {
    return {
      message: 'Recovery is solid — good day to push volume on your focus groups or hit a benchmark session.',
      actionLabel: 'Go to Builder',
      actionPath: '/builder',
    };
  }
  if (scores.readiness < 45) {
    return {
      message: 'Readiness is low. Log protein in Fuel, try a Mind breathing stack, or keep today lighter.',
      actionLabel: 'Log nutrition',
      actionPath: '/nutrition',
    };
  }
  return {
    message: `Steady progress. ${recommendedFocus.charAt(0).toUpperCase()}${recommendedFocus.slice(1)} when you're ready.`,
    actionLabel: 'View Today hub',
    actionPath: '/log',
  };
}