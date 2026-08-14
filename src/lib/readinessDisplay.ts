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

/** English floor for a readiness status key — never the raw key on hydrate. */
export function readinessStatusDefault(key: string): string {
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

/** Action labels on coach insight cards / cross-pillar chips. */
export const COACH_ACTION_LABEL_DEFAULTS: Record<string, string> = {
  coachActionRecoveryFlow: 'Try recovery flow',
  coachActionOpenMove: 'Open Move pillar',
  coachActionOpenMind: 'Open Mind pillar',
  coachActionOpenTrack: 'Open Track pillar',
  coachActionOpenLearn: 'Open Learn courses',
  coachActionOpenFuel: 'Open Fuel Coach',
  coachActionStartWorkout: 'Start workout',
  coachActionGoBuilder: 'Go to Builder',
  coachActionLogNutrition: 'Log nutrition',
  coachActionViewToday: 'View Today',
};

/**
 * Message floors for rule + cross-pillar insights. `focusLine` is interpolated
 * for primed/steady; other keys are static English matching todayLocales EN.
 */
export function coachInsightMessageDefaults(focusLine: string): Record<string, string> {
  return {
    coachInsightHighRisk:
      'Your assessment flagged elevated risk. Prioritize recovery, mobility, and light movement today.',
    coachInsightHighStrain:
      'High training load with low recovery. A mobility or rest day will help you come back stronger.',
    coachInsightPrimed: `You're primed to train. ${focusLine}.`,
    coachInsightSolidRecovery:
      'Recovery is solid — good day to push volume on your focus groups or hit a benchmark session.',
    coachInsightLowReadiness:
      'Readiness is low — life happens. Keep today lighter, Just Go for one set, or try a short Mind breath. Getting back on the path beats a perfect week.',
    coachInsightSteady: `Steady progress. ${focusLine} when you're ready.`,
    coachInsightNeedMove:
      'Training load is building — add mobility today to protect joints and stay on the path.',
    coachInsightNeedFuel:
      "You're training hard but protein is lagging. Hit protein first in Fuel — log a plate, not a barcode.",
    coachInsightNeedMind:
      'Recovery is under stress. A short Mind session can help sleep, focus, and sticking with training — educational habit tools, not clinical care.',
    coachInsightSynergyMove:
      'Strong training week — pair it with mobility so you keep progressing without breakdown.',
    coachInsightNeedTrack:
      "You're training consistently — log an outdoor walk or run in Track to complete the picture.",
    coachInsightNeedLearn:
      "You're active across pillars — open a specialist course in Learn to deepen the stack.",
    coachInsightSynergyMultipillar:
      'Multi-pillar week — your Mission Score reflects Train + recovery + learning together.',
    coachInsightFuelCoachSynergy:
      "Heavy training logged — Fuel Coach added +{{carbs}}g carbs to today's plan.",
  };
}

/**
 * Translate a rule-based coach insight for the Today score band + daily card.
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
  const defaults = coachInsightMessageDefaults(focusLine);
  const floor = defaults[insight.messageKey] ?? insight.messageKey;
  return t(insight.messageKey, {
    ...(insight.messageParams ?? {}),
    focusLine,
    defaultValue: floor,
  });
}

/**
 * Focus when only messageParams exist (API / daily-insight hook).
 * Falls back to Legs / Prime so floors still interpolate.
 */
export function focusFromInsightParams(
  params?: Record<string, string>
): RecommendedFocus {
  const group = (params?.focusGroup as MuscleGroup) || 'Legs';
  const statusKey =
    (params?.focusStatusKey as ReadinessStatusKey) || 'todayReadinessPrime';
  return { group, statusKey };
}

export function translateCoachActionLabel(actionLabelKey: string, t: TranslateFn): string {
  return t(actionLabelKey, {
    defaultValue: COACH_ACTION_LABEL_DEFAULTS[actionLabelKey] ?? actionLabelKey,
  });
}

export function bodyScoreLabel(key: string, t: TranslateFn): string {
  return t(key, {
    defaultValue: BODY_SCORE_LABEL_DEFAULTS[key] ?? key,
  });
}
