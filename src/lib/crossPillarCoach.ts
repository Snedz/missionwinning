import type { BodyScores, CoachInsight, RecommendedFocus } from './score';

export interface PillarWeekContext {
  moveFlows?: number;
  mindSessions?: number;
  proteinDays?: number;
  trainDays?: number;
  trackActivities?: number;
  learnLessons?: number;
}

export interface CoachSecondaryAction {
  actionLabelKey: string;
  actionPath: string;
}

/**
 * Cross-pillar coaching — recommends the weakest pillar when body scores imply synergy.
 * Extends rule-based coach with holistic "path" logic from vision.md.
 */
export function applyCrossPillarCoachRules(
  scores: BodyScores,
  focus: RecommendedFocus,
  insight: CoachInsight,
  pillars: PillarWeekContext,
  opts?: { assessmentRisk?: string }
): CoachInsight {
  if (opts?.assessmentRisk === 'high') return insight;

  const move = pillars.moveFlows ?? 0;
  const mind = pillars.mindSessions ?? 0;
  const protein = pillars.proteinDays ?? 0;
  const trainDays = pillars.trainDays ?? 0;

  if (scores.strain >= 55 && move === 0) {
    return {
      messageKey: 'coachInsightNeedMove',
      actionLabelKey: 'coachActionOpenMove',
      actionPath: '/move',
    };
  }

  if (trainDays >= 2 && protein === 0 && scores.strain >= 40) {
    return {
      messageKey: 'coachInsightNeedFuel',
      actionLabelKey: 'coachActionLogNutrition',
      actionPath: '/nutrition',
    };
  }

  if (scores.recovery < 55 && scores.strain >= 50 && mind === 0) {
    return {
      messageKey: 'coachInsightNeedMind',
      actionLabelKey: 'coachActionOpenMind',
      actionPath: '/mind',
    };
  }

  if (scores.readiness >= 65 && move < 2 && trainDays >= 3) {
    return {
      messageKey: 'coachInsightSynergyMove',
      actionLabelKey: 'coachActionOpenMove',
      actionPath: '/move',
    };
  }

  const track = pillars.trackActivities ?? 0;
  const learn = pillars.learnLessons ?? 0;

  if (trainDays >= 3 && track === 0 && scores.strain >= 35) {
    return {
      messageKey: 'coachInsightNeedTrack',
      actionLabelKey: 'coachActionOpenTrack',
      actionPath: '/track',
    };
  }

  if (trainDays >= 2 && learn === 0 && scores.readiness >= 45 && scores.strain >= 30) {
    return {
      messageKey: 'coachInsightNeedLearn',
      actionLabelKey: 'coachActionOpenLearn',
      actionPath: '/learn',
    };
  }

  return insight;
}

/**
 * Up to three secondary pillar CTAs when multiple gaps exist beyond the primary action.
 * Phase I5 — holistic "1+1+1 > sum" synergy on Today hub.
 */
export function getCrossPillarSecondaryActions(
  scores: BodyScores,
  pillars: PillarWeekContext,
  primaryPath: string,
  opts?: { assessmentRisk?: string }
): CoachSecondaryAction[] {
  if (opts?.assessmentRisk === 'high') return [];

  const move = pillars.moveFlows ?? 0;
  const mind = pillars.mindSessions ?? 0;
  const protein = pillars.proteinDays ?? 0;
  const trainDays = pillars.trainDays ?? 0;
  const track = pillars.trackActivities ?? 0;
  const learn = pillars.learnLessons ?? 0;

  const candidates: CoachSecondaryAction[] = [];

  const push = (path: string, labelKey: string) => {
    if (path === primaryPath) return;
    if (candidates.some((c) => c.actionPath === path)) return;
    candidates.push({ actionPath: path, actionLabelKey: labelKey });
  };

  if (move === 0 && scores.strain >= 40) push('/move', 'coachActionOpenMove');
  if (protein === 0 && trainDays >= 1) push('/nutrition', 'coachActionLogNutrition');
  if (mind === 0 && scores.recovery < 65) push('/mind', 'coachActionOpenMind');
  if (track === 0 && trainDays >= 2) push('/track', 'coachActionOpenTrack');
  if (learn === 0 && trainDays >= 1) push('/learn', 'coachActionOpenLearn');

  return candidates.slice(0, 3);
}
