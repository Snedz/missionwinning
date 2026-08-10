import {
  MUSCLE_GROUP_I18N,
  type MuscleGroup,
  type ReadinessStatusKey,
} from '@/lib/muscleGroups';
import type { CoachInsight, RecommendedFocus } from '@/lib/score';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * English catalog for readiness status keys.
 *
 * `defaultValue: focus.statusKey` used to paint the raw key on Today whenever
 * the async locale hydrate had not landed yet (or a pack omitted the entry).
 * Athletes saw "Chest focus — todayReadinessPrime" — a bootstrap defect, not a
 * translation gap. Catalog copy is the floor; packs still override via `t`.
 */
export const READINESS_STATUS_DEFAULTS: Record<ReadinessStatusKey, string> = {
  todayReadinessPrime: 'Prime for growth',
  todayReadinessRecovering: 'Recovering',
  todayReadinessGood: 'Good to go',
};

/** English catalog for body-score metric captions (MetricsRow). */
export const BODY_SCORE_LABEL_DEFAULTS: Record<string, string> = {
  todayBodyRestUp: 'Rest up',
  todayBodyTrainSmart: 'Train smart',
  todayBodyPrimePush: 'Prime to push',
  todayBodyLightWeek: 'Light week',
  todayBodyModerateLoad: 'Moderate load',
  todayBodyHighLoad: 'High load',
  todayBodyNeedsRest: 'Needs rest',
  todayBodyRebuilding: 'Rebuilding',
  todayBodyFullyRecovered: 'Fully recovered',
};

function readinessStatusDefault(key: string): string {
  return READINESS_STATUS_DEFAULTS[key as ReadinessStatusKey] ?? key;
}

/** Localized "Chest focus — Prime for growth" line for Today header and coach copy. */
export function formatRecommendedFocusLine(focus: RecommendedFocus, t: TranslateFn): string {
  const group = t(MUSCLE_GROUP_I18N[focus.group], { defaultValue: focus.group });
  const status = t(focus.statusKey, {
    defaultValue: readinessStatusDefault(focus.statusKey),
  });
  return t('todayRecommendedFocusLine', {
    group,
    status,
    defaultValue: `${group} focus — ${status}`,
  });
}

export function muscleGroupLabel(group: MuscleGroup, t: TranslateFn): string {
  return t(MUSCLE_GROUP_I18N[group], { defaultValue: group });
}

/**
 * Translate a rule-based coach insight for the Today score band.
 *
 * Locale strings use `{{focusLine}}` (see todayLocales). `getCoachInsight`
 * used to pass `focusGroup` / `focusStatusKey`, which never interpolated, and
 * `defaultValue: messageKey` painted the raw key during bootstrap. Build the
 * focus sentence here and always supply English floors.
 */
export function translateCoachInsightLine(
  insight: CoachInsight,
  focus: RecommendedFocus,
  t: TranslateFn
): string {
  const focusLine = formatRecommendedFocusLine(focus, t);
  const defaults: Record<string, string> = {
    coachInsightHighRisk:
      'Your assessment shows high risk. Prioritize recovery, mobility, and light movement today.',
    coachInsightHighStrain:
      'High strain with low recovery. A mobility or rest day helps you come back stronger.',
    coachInsightPrimed: `You're primed to train. ${focusLine}.`,
    coachInsightSolidRecovery:
      'Solid recovery — a good day to add volume on target groups or a reference session.',
    coachInsightLowReadiness:
      'Low readiness. Log protein in Fuel, try Mind, or keep today light.',
    coachInsightSteady: `Steady progress. ${focusLine} when you're ready.`,
  };
  return t(insight.messageKey, {
    ...(insight.messageParams ?? {}),
    focusLine,
    defaultValue: defaults[insight.messageKey] ?? insight.messageKey,
  });
}

export function bodyScoreLabel(key: string, t: TranslateFn): string {
  return t(key, {
    defaultValue: BODY_SCORE_LABEL_DEFAULTS[key] ?? key,
  });
}
