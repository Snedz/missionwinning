import { MUSCLE_GROUP_I18N, type MuscleGroup } from '@/lib/muscleGroups';
import type { RecommendedFocus } from '@/lib/score';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/** Localized "Chest focus — Prime for growth" line for Today header and coach copy. */
export function formatRecommendedFocusLine(focus: RecommendedFocus, t: TranslateFn): string {
  const group = t(MUSCLE_GROUP_I18N[focus.group], { defaultValue: focus.group });
  const status = t(focus.statusKey, { defaultValue: focus.statusKey });
  return t('todayRecommendedFocusLine', {
    group,
    status,
    defaultValue: `${group} focus — ${status}`,
  });
}

export function muscleGroupLabel(group: MuscleGroup, t: TranslateFn): string {
  return t(MUSCLE_GROUP_I18N[group], { defaultValue: group });
}
