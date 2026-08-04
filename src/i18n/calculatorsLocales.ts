/** Calculators page UI — merged into i18n `common` namespace. */

type CalculatorsStrings = {
  calcTitle: string;
  calcSubtitle: string;
  calcTab1rm: string;
  calcTabMacros: string;
  calcTabPlates: string;
  calc1rmTitle: string;
  calc1rmHint: string;
  calc1rmAlt: string;
  calcWeightLabel: string;
  calcRepsLabel: string;
  calc1rmFoot: string;
  calcMacroTitle: string;
  calcMacroDesc: string;
  calcBwLabel: string;
  calcHeightLabel: string;
  calcAgeLabel: string;
  calcSexLabel: string;
  calcSexMale: string;
  calcSexFemale: string;
  calcActivityLabel: string;
  calcActivitySedentary: string;
  calcActivityLight: string;
  calcActivityModerate: string;
  calcActivityActive: string;
  calcGoalLabel: string;
  calcGoalMaintain: string;
  calcGoalCut: string;
  calcGoalBulk: string;
  calcTargetCals: string;
  calcProtein: string;
  calcFat: string;
  calcCarbs: string;
  calcMacroFoot: string;
  calcApplyTargets: string;
  calcViewFuel: string;
  calcToastApplied: string;
  calcToastAppliedDesc: string;
  calcBuildSession: string;
  calcAssessment: string;
  calcPlateTitle: string;
  calcPlateDesc: string;
  calcPlateTarget: string;
  calcPlateBar: string;
  calcPlatePerSide: string;
  calcPlateTotal: string;
  calcPlateRemainder: string;
  calcPlateApply: string;
  calcPremiumTitle: string;
  calcPremiumDesc: string;
  calcPremiumLink: string;
  calcPremiumBtn: string;
  calcUnitsFoot: string;
  calcSignInFoot: string;
  calcPlateExact: string;
};

const en: CalculatorsStrings = {
  calcTitle: 'Calculators',
  calcSubtitle:
    'Free 1RM, macro, and plate tools. Super Bundle unlocks advanced periodization and client sync.',
  calcTab1rm: '1RM',
  calcTabMacros: 'Macros',
  calcTabPlates: 'Plates',
  calc1rmTitle: 'Estimated 1RM',
  calc1rmHint: 'Best for 1–10 reps. Heavier sets give more reliable estimates.',
  calc1rmAlt: 'Alt estimate (Brzycki): {{alt}} {{unit}}',
  calcWeightLabel: 'Weight ({{unit}})',
  calcRepsLabel: 'Reps',
  calc1rmFoot: 'Epley formula. Use as starting point. Test real 1RM carefully.',
  calcMacroTitle: 'Macro & TDEE Estimator',
  calcMacroDesc: 'Mifflin-St Jeor BMR with activity multiplier. Adjust goal to shift calories.',
  calcBwLabel: 'Bodyweight ({{unit}})',
  calcHeightLabel: 'Height ({{unit}})',
  calcAgeLabel: 'Age',
  calcSexLabel: 'Sex',
  calcSexMale: 'Male',
  calcSexFemale: 'Female',
  calcActivityLabel: 'Activity level',
  calcActivitySedentary: 'Sedentary',
  calcActivityLight: 'Light',
  calcActivityModerate: 'Moderate',
  calcActivityActive: 'Active',
  calcGoalLabel: 'Goal',
  calcGoalMaintain: 'Maintain',
  calcGoalCut: 'Cut',
  calcGoalBulk: 'Bulk',
  calcTargetCals: 'Target Calories',
  calcProtein: 'Protein',
  calcFat: 'Fat',
  calcCarbs: 'Carbs',
  calcMacroFoot:
    'Rough Mifflin-St Jeor + activity. Premium programs add phase and body-comp adjustments.',
  calcApplyTargets: 'Apply targets to Fuel',
  calcViewFuel: 'Open Fuel',
  calcToastApplied: 'Targets applied',
  calcToastAppliedDesc: '{{protein}}g protein · {{cals}} kcal — visible on Fuel.',
  calcBuildSession: 'Build Session Targeting e1RM ~{{e1rm}}',
  calcAssessment: 'Run Readiness Assessment First',
  calcPlateTitle: 'Plate loader',
  calcPlateDesc: 'Greedy load from largest plates. Shows per-side stack and achieved weight.',
  calcPlateTarget: 'Target weight ({{unit}})',
  calcPlateBar: 'Bar weight ({{unit}})',
  calcPlatePerSide: 'Per side',
  calcPlateTotal: 'Total on bar: {{weight}} {{unit}}',
  calcPlateRemainder: 'Cannot load exactly — {{remainder}}{{unit}} short of target',
  calcPlateApply: 'Use {{weight}} {{unit}}',
  calcPremiumTitle: 'Premium calculators',
  calcPremiumDesc:
    'Super Bundle unlocks periodization blocks, contest prep macros, and client tools that sync to your log.',
  calcPremiumLink: 'View bundle',
  calcPremiumBtn: 'Unlock premium tools',
  calcUnitsFoot: 'Toggle kg/lbs and cm/in in Profile. Global default is metric.',
  calcSignInFoot: 'Sign in to sync calculator logs and nutrition targets across devices.',
  calcPlateExact: 'Achieved · exact',
};

const es: CalculatorsStrings = {
  ...en,
  calcTitle: 'Calculadoras',
  calcTabMacros: 'Macros',
  calc1rmTitle: '1RM estimado',
  calcMacroTitle: 'Macros y TDEE',
  calcGoalMaintain: 'Mantener',
  calcGoalCut: 'Definir',
  calcGoalBulk: 'Volumen',
  calcApplyTargets: 'Aplicar objetivos en Fuel',
  calcViewFuel: 'Abrir Fuel',
};

const zh: CalculatorsStrings = {
  ...en,
  calcTitle: '计算器',
  calc1rmTitle: '估算 1RM',
  calcMacroTitle: '宏量与 TDEE',
  calcGoalMaintain: '维持',
  calcGoalCut: '减脂',
  calcGoalBulk: '增肌',
};

const id: CalculatorsStrings = { ...en, calcTitle: 'Kalkulator' };
const th: CalculatorsStrings = { ...en, calcTitle: 'เครื่องคำนวณ' };
const ar: CalculatorsStrings = { ...en, calcTitle: 'حاسبات' };

const LOCALES: Partial<Record<string, CalculatorsStrings>> = { en, es, zh, id, th, ar };

export function calculatorsStringsFor(lang: string): CalculatorsStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeCalculatorsStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, calculatorsStringsFor(lang));
}
