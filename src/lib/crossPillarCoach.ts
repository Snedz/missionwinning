import type { BodyScores, CoachInsight, RecommendedFocus } from './score';

export interface PillarWeekContext {
  moveFlows?: number;
  mindSessions?: number;
  proteinDays?: number;
  trainDays?: number;
  trackActivities?: number;
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

  return insight;
}

/** All cross-pillar suggestions that apply (for actionable chips on Today). */
export function listCrossPillarCoachSuggestions(
  scores: BodyScores,
  pillars: PillarWeekContext,
  opts?: { assessmentRisk?: string }
): CoachInsight[] {
  if (opts?.assessmentRisk === 'high') return [];

  const move = pillars.moveFlows ?? 0;
  const mind = pillars.mindSessions ?? 0;
  const protein = pillars.proteinDays ?? 0;
  const trainDays = pillars.trainDays ?? 0;
  const trackActivities = pillars.trackActivities ?? 0;
  const out: CoachInsight[] = [];

  if (scores.strain >= 55 && move === 0) {
    out.push({
      messageKey: 'coachInsightNeedMove',
      actionLabelKey: 'coachActionOpenMove',
      actionPath: '/move',
    });
  }

  if (trainDays >= 2 && protein === 0 && scores.strain >= 40) {
    out.push({
      messageKey: 'coachInsightNeedFuel',
      actionLabelKey: 'coachActionLogNutrition',
      actionPath: '/nutrition',
    });
  }

  if (scores.recovery < 55 && scores.strain >= 50 && mind === 0) {
    out.push({
      messageKey: 'coachInsightNeedMind',
      actionLabelKey: 'coachActionOpenMind',
      actionPath: '/mind',
    });
  }

  if (scores.readiness >= 65 && move < 2 && trainDays >= 3) {
    out.push({
      messageKey: 'coachInsightSynergyMove',
      actionLabelKey: 'coachActionOpenMove',
      actionPath: '/move',
    });
  }

  if (trainDays >= 2 && trackActivities === 0) {
    out.push({
      messageKey: 'coachInsightNeedTrack',
      actionLabelKey: 'coachActionOpenTrack',
      actionPath: '/track',
    });
  }

  return out;
}
