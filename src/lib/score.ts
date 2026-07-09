import type { CompletedWorkoutLog } from "@/types";
import {
  MAJOR_GROUPS,
  type MuscleGroup,
  type ReadinessStatusKey,
} from "@/lib/muscleGroups";
import {
  computeReadinessFromHistory,
  type ReadinessInfo,
} from "@/lib/readinessIndex";

export type { MuscleGroup, ReadinessStatusKey, ReadinessInfo };

export interface RecommendedFocus {
  group: MuscleGroup;
  statusKey: ReadinessStatusKey;
}

export interface WinScoreBreakdown {
  streak: number;
  protein: number;
  sessions: number;
  volume: number;
  saved: number;
  /** Cross-pillar contributions (Phase C) */
  move: number;
  mind: number;
  track: number;
  learn: number;
  pillars: {
    train: number;
    fuel: number;
    move: number;
    mind: number;
    track: number;
    learn: number;
  };
  total: number;
}

/**
 * Compute muscle readiness from workout history.
 * Prefers stored muscleGroups. For old logs missing groups, callers should
 * `await computeReadinessIndex(history)` first (lazy catalog seed).
 * HomePage above-fold uses `computeReadinessFromHistory` directly.
 */
export function computeReadiness(workoutHistory: CompletedWorkoutLog[]): Record<MuscleGroup, ReadinessInfo> {
  return computeReadinessFromHistory(workoutHistory);
}

/**
 * Get recommended focus group (longest rested major muscle).
 */
export function getRecommendedFocus(readiness: Record<MuscleGroup, ReadinessInfo>): RecommendedFocus {
  const groups = [...MAJOR_GROUPS];
  groups.sort((a, b) => readiness[b].days - readiness[a].days);
  const top = groups[0];
  return { group: top, statusKey: readiness[top].statusKey };
}

/**
 * Compute composite Win / Mission Score (0-100) with cross-pillar weighting.
 * Train ~40%, Fuel ~15%, Move/Mind/Track/Learn ~45% combined (holistic super app).
 */
export function computeWinScore(params: {
  streak: number;
  highProteinDays: number;
  totalSessions: number;
  totalVolume: number;
  savedCount: number;
  /** Weekly pillar activity (from gatherWeeklyPillarStats) */
  moveFlows?: number;
  mindSessions?: number;
  trackActivities?: number;
  learnLessons?: number;
  trainDaysThisWeek?: number;
  /** 1 when Fuel Coach plan exists this week — synergy with protein logging */
  fuelCoachActive?: number;
}): WinScoreBreakdown {
  const {
    streak,
    highProteinDays,
    totalSessions,
    totalVolume,
    savedCount,
    moveFlows = 0,
    mindSessions = 0,
    trackActivities = 0,
    learnLessons = 0,
    trainDaysThisWeek = 0,
    fuelCoachActive = 0,
  } = params;

  // Train pillar (~40 pts)
  const streakPart = Math.min(streak, 7) / 7 * 10;
  const trainDaysPart = Math.min(trainDaysThisWeek, 7) / 7 * 8;
  const sessionsPart = Math.min(totalSessions, 20) / 20 * 10;
  const volumePart = Math.min(totalVolume, 8000) / 8000 * 8;
  const savedPart = savedCount >= 3 ? 4 : savedCount >= 1 ? 2 : 0;
  const trainTotal = Math.round(streakPart + trainDaysPart + sessionsPart + volumePart + savedPart);

  // Fuel (~15 pts)
  const proteinPart = Math.min(highProteinDays, 7) / 7 * 15;
  const fuelCoachBonus =
    fuelCoachActive > 0 && highProteinDays > 0 ? Math.min(3, highProteinDays) : 0;
  const fuelTotal = Math.round(proteinPart + fuelCoachBonus);

  // Move (~12 pts) — up to 4 flows/week
  const movePart = Math.min(moveFlows, 4) / 4 * 12;
  const moveTotal = Math.round(movePart);

  // Mind (~12 pts)
  const mindPart = Math.min(mindSessions, 7) / 7 * 12;
  const mindTotal = Math.round(mindPart);

  // Track (~11 pts)
  const trackPart = Math.min(trackActivities, 5) / 5 * 11;
  const trackTotal = Math.round(trackPart);

  // Learn (~10 pts)
  const learnPart = Math.min(learnLessons, 5) / 5 * 10;
  const learnTotal = Math.round(learnPart);

  const total = Math.min(
    100,
    trainTotal + fuelTotal + moveTotal + mindTotal + trackTotal + learnTotal
  );

  return {
    streak: Math.round(streakPart),
    protein: fuelTotal,
    sessions: Math.round(sessionsPart),
    volume: Math.round(volumePart),
    saved: savedPart,
    move: moveTotal,
    mind: mindTotal,
    track: trackTotal,
    learn: learnTotal,
    pillars: {
      train: trainTotal,
      fuel: fuelTotal,
      move: moveTotal,
      mind: mindTotal,
      track: trackTotal,
      learn: learnTotal,
    },
    total,
  };
}

export type BodyScoreLabelKey =
  | 'todayBodyRestUp'
  | 'todayBodyTrainSmart'
  | 'todayBodyPrimePush'
  | 'todayBodyLightWeek'
  | 'todayBodyModerateLoad'
  | 'todayBodyHighLoad'
  | 'todayBodyNeedsRest'
  | 'todayBodyRebuilding'
  | 'todayBodyFullyRecovered';

export interface BodyScores {
  readiness: number;
  strain: number;
  recovery: number;
  readinessLabelKey: BodyScoreLabelKey;
  strainLabelKey: BodyScoreLabelKey;
  recoveryLabelKey: BodyScoreLabelKey;
}

function scoreLabelKey(
  v: number,
  low: BodyScoreLabelKey,
  mid: BodyScoreLabelKey,
  high: BodyScoreLabelKey
): BodyScoreLabelKey {
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
    readinessLabelKey: scoreLabelKey(readiness, 'todayBodyRestUp', 'todayBodyTrainSmart', 'todayBodyPrimePush'),
    strainLabelKey: scoreLabelKey(strain, 'todayBodyLightWeek', 'todayBodyModerateLoad', 'todayBodyHighLoad'),
    recoveryLabelKey: scoreLabelKey(recovery, 'todayBodyNeedsRest', 'todayBodyRebuilding', 'todayBodyFullyRecovered'),
  };
}

export interface CoachInsight {
  messageKey: string;
  messageParams?: Record<string, string>;
  actionLabelKey: string;
  actionPath: string;
}

/**
 * Rule-based daily coaching insight from body scores and recommended focus.
 * UI translates messageKey / actionLabelKey via i18n.
 */
export function getCoachInsight(
  scores: BodyScores,
  focus: RecommendedFocus,
  opts?: { assessmentRisk?: string }
): CoachInsight {
  if (opts?.assessmentRisk === 'high') {
    return {
      messageKey: 'coachInsightHighRisk',
      actionLabelKey: 'coachActionRecoveryFlow',
      actionPath: '/move',
    };
  }
  if (scores.strain >= 70 && scores.recovery < 50) {
    return {
      messageKey: 'coachInsightHighStrain',
      actionLabelKey: 'coachActionOpenMove',
      actionPath: '/move',
    };
  }
  if (scores.readiness >= 70 && scores.strain < 60) {
    return {
      messageKey: 'coachInsightPrimed',
      messageParams: { focusGroup: focus.group, focusStatusKey: focus.statusKey },
      actionLabelKey: 'coachActionStartWorkout',
      actionPath: '/active',
    };
  }
  if (scores.recovery >= 70 && scores.strain >= 50) {
    return {
      messageKey: 'coachInsightSolidRecovery',
      actionLabelKey: 'coachActionGoBuilder',
      actionPath: '/builder',
    };
  }
  if (scores.readiness < 45) {
    return {
      messageKey: 'coachInsightLowReadiness',
      actionLabelKey: 'coachActionLogNutrition',
      actionPath: '/nutrition',
    };
  }
  return {
    messageKey: 'coachInsightSteady',
    messageParams: { focusGroup: focus.group, focusStatusKey: focus.statusKey },
    actionLabelKey: 'coachActionViewToday',
    actionPath: '/log',
  };
}
