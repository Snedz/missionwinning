import type { CoachInsight } from '@/lib/score';
import type { DailyCoachContext } from '@/lib/coachDailyServer';
import { detectSaveData, readLiteModePreference } from '@/lib/connectivityMode';
import { getStoredEquipment } from '@/lib/equipmentPrefs';
import { isLowImpactGated, type ProgramGate } from '@/lib/pathfinderAssessment';
import { applyCrossPillarCoachRules, type PillarWeekContext } from '@/lib/crossPillarCoach';
import { getCoachInsight, type BodyScores, type RecommendedFocus } from '@/lib/score';

export type OfflineCoachSource = 'offline' | 'rules' | 'llm' | 'local';

export interface OfflineCoachOptions {
  equipment?: string;
  programGate?: ProgramGate;
  assessmentRisk?: string;
  dayOfWeek?: number;
}

/** Skip cloud LLM when offline, lite mode, or save-data is on. */
export function shouldSkipCloudCoach(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (readLiteModePreference()) return true;
  return detectSaveData();
}

function dayRotationInsight(dow: number, equipment: string): CoachInsight | null {
  if (equipment !== 'bodyweight') return null;
  const plans = [
    { messageKey: 'coachInsightOfflineBwPush', actionPath: '/builder?offline=bodyweight-strength-4w' },
    { messageKey: 'coachInsightOfflineBwMobility', actionPath: '/move' },
    { messageKey: 'coachInsightOfflineBwFull', actionPath: '/builder?offline=bodyweight-strength-4w' },
    { messageKey: 'coachInsightOfflineBwMind', actionPath: '/mind' },
    { messageKey: 'coachInsightOfflineBwLower', actionPath: '/active' },
    { messageKey: 'coachInsightOfflineBwActive', actionPath: '/builder?offline=bodyweight-strength-4w' },
    { messageKey: 'coachInsightOfflineBwRest', actionPath: '/mind' },
  ];
  const pick = plans[dow % plans.length];
  return {
    messageKey: pick.messageKey,
    actionLabelKey: 'coachActionOfflinePlan',
    actionPath: pick.actionPath,
  };
}

/**
 * Offline coach v2 — cross-pillar rules + Pathfinder/equipment awareness without any API.
 */
export function resolveOfflineCoachInsight(
  scores: BodyScores,
  focus: RecommendedFocus,
  pillars: PillarWeekContext,
  opts?: OfflineCoachOptions
): CoachInsight {
  const programGate = opts?.programGate ?? (isLowImpactGated() ? 'low-impact-only' : 'standard');
  const equipment = opts?.equipment ?? getStoredEquipment();
  const dow = opts?.dayOfWeek ?? new Date().getDay();

  if (programGate === 'low-impact-only' || opts?.assessmentRisk === 'high') {
    return {
      messageKey: 'coachInsightOfflinePathfinder',
      actionLabelKey: 'coachActionRecoveryFlow',
      actionPath: '/builder?offline=pathfinder-gentle-4w',
    };
  }

  const base = getCoachInsight(scores, focus, { assessmentRisk: opts?.assessmentRisk });
  const cross = applyCrossPillarCoachRules(scores, focus, base, pillars, {
    assessmentRisk: opts?.assessmentRisk,
  });

  const trainDays = pillars.trainDays ?? 0;
  if (trainDays === 0) {
    return {
      messageKey: 'coachInsightOfflineFirstWin',
      actionLabelKey: 'coachActionStartWorkout',
      actionPath: equipment === 'bodyweight' ? '/builder?offline=bodyweight-strength-4w' : '/active',
    };
  }

  if (shouldSkipCloudCoach()) {
    const rotated = dayRotationInsight(dow, equipment);
    if (rotated && cross.messageKey === 'coachInsightSteady') {
      return rotated;
    }
  }

  if (cross.actionPath === '/builder' && equipment === 'bodyweight') {
    return {
      ...cross,
      actionLabelKey: 'coachActionOfflinePlan',
      actionPath: '/builder?offline=bodyweight-strength-4w',
    };
  }

  return cross;
}

export function offlineCoachFromContext(
  ctx: Omit<DailyCoachContext, 'fallback'>,
  fallback: CoachInsight,
  opts?: OfflineCoachOptions
): CoachInsight {
  const scores: BodyScores = {
    readiness: ctx.readiness,
    strain: ctx.strain,
    recovery: ctx.recovery,
    readinessLabelKey: 'todayBodyTrainSmart',
    strainLabelKey: 'todayBodyModerateLoad',
    recoveryLabelKey: 'todayBodyRebuilding',
  };
  const focus: RecommendedFocus = {
    group: ctx.focusGroup as RecommendedFocus['group'],
    statusKey: 'todayFocusPush' as RecommendedFocus['statusKey'],
  };
  return resolveOfflineCoachInsight(scores, focus, ctx.pillars, opts);
}
