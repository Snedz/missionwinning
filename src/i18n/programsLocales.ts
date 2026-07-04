/** Programs page filter chip labels — merged into i18n `common` namespace. */

const PROGRAMS_EN: Record<string, string> = {
  programsFilterGoal: 'Filter by goal:',
  programsFilterEquip: 'Equipment:',
  programsGoalAll: 'All',
  programsGoalHypertrophy: 'Hypertrophy',
  programsGoalCorrective: 'Corrective',
  programsGoalStrengthBusiness: 'Strength/Business',
  programsGoalConditioning: 'Conditioning',
  programsEquipAll: 'All',
  programsEquipBodyweight: 'Bodyweight/Minimal',
  programsEquipGym: 'Gym/Barbell',
};

const PROGRAMS_ES: Record<string, string> = {
  ...PROGRAMS_EN,
  programsFilterGoal: 'Filtrar por objetivo:',
  programsFilterEquip: 'Equipo:',
  programsGoalAll: 'Todos',
  programsGoalHypertrophy: 'Hipertrofia',
  programsGoalCorrective: 'Correctivo',
  programsGoalStrengthBusiness: 'Fuerza/Negocio',
  programsGoalConditioning: 'Acondicionamiento',
  programsEquipBodyweight: 'Peso corporal/Mínimo',
  programsEquipGym: 'Gimnasio/Barra',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: PROGRAMS_EN,
  es: PROGRAMS_ES,
};

export function programsStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeProgramsStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, programsStringsFor(lang));
}

/** Internal filter values → i18n keys for display labels. */
export const PROGRAM_GOAL_FILTERS = [
  { value: 'All', labelKey: 'programsGoalAll' },
  { value: 'Hypertrophy', labelKey: 'programsGoalHypertrophy' },
  { value: 'Corrective', labelKey: 'programsGoalCorrective' },
  { value: 'Strength/Business', labelKey: 'programsGoalStrengthBusiness' },
  { value: 'Conditioning', labelKey: 'programsGoalConditioning' },
] as const;

export const PROGRAM_EQUIP_FILTERS = [
  { value: 'All', labelKey: 'programsEquipAll' },
  { value: 'Bodyweight/Minimal', labelKey: 'programsEquipBodyweight' },
  { value: 'Gym/Barbell', labelKey: 'programsEquipGym' },
] as const;
