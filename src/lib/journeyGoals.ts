/** Journey goal presets — stored as `goal:<id>` in localStorage; legacy English strings still resolve. */

export const GOAL_PRESET_IDS = [
  'strength',
  'fat_loss',
  'endurance',
  'mobility',
  'general',
  'pft',
  'kids',
  'america_health',
] as const;
export type GoalPresetId = (typeof GOAL_PRESET_IDS)[number];

export function goalPresetValue(id: GoalPresetId): string {
  return `goal:${id}`;
}

const GOAL_I18N_BY_PRESET: Record<GoalPresetId, string> = {
  strength: 'goalPresetStrength',
  fat_loss: 'goalPresetFatLoss',
  endurance: 'goalPresetEndurance',
  mobility: 'goalPresetMobility',
  general: 'goalPresetGeneral',
  pft: 'goalPresetPft',
  kids: 'goalPresetKids',
  america_health: 'goalPresetAmericaHealth',
};

export { GOAL_I18N_BY_PRESET as GOAL_PRESET_LABEL_KEY };

/** English defaults for legacy localStorage values and i18n fallbacks. */
export const GOAL_PRESET_DEFAULTS: Record<GoalPresetId, string> = {
  strength: 'Build strength and stay healthy',
  fat_loss: 'Lose fat and keep muscle',
  endurance: 'Improve endurance and stamina',
  mobility: 'Move better — mobility and recovery',
  general: 'Stay healthy and consistent',
  pft: 'Prepare for the Presidential Fitness Test',
  kids: 'Get my kids moving every day',
  america_health: 'Make America Healthy Again — start with me',
};

const LEGACY_TO_PRESET: Record<string, GoalPresetId> = {
  'Build strength and stay healthy': 'strength',
  'Lose fat and keep muscle': 'fat_loss',
  'Improve endurance and stamina': 'endurance',
  'Move better — mobility and recovery': 'mobility',
  'Stay healthy and consistent': 'general',
  'Prepare for the Presidential Fitness Test': 'pft',
  'Get my kids moving every day': 'kids',
  'Make America Healthy Again — start with me': 'america_health',
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function parseGoalPresetId(value: string): GoalPresetId | null {
  const trimmed = value.trim();
  if (trimmed.startsWith('goal:')) {
    const id = trimmed.slice(5) as GoalPresetId;
    return GOAL_PRESET_IDS.includes(id) ? id : null;
  }
  return LEGACY_TO_PRESET[trimmed] ?? null;
}

/** Display label for stored goal (preset key, legacy English, or custom free text). */
export function formatStoredGoal(value: string, t: TranslateFn): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return t('goalPresetStrength', { defaultValue: GOAL_PRESET_DEFAULTS.strength });
  }
  const presetId = parseGoalPresetId(trimmed);
  if (presetId) {
    const key = GOAL_I18N_BY_PRESET[presetId];
    return t(key, { defaultValue: GOAL_PRESET_DEFAULTS[presetId] });
  }
  return trimmed;
}

export function isCustomGoal(value: string): boolean {
  return !parseGoalPresetId(value);
}
