/** Calculators page UI — merged into i18n `common` namespace. */

type CalculatorsStrings = {
  calcTitle: string;
  calcSubtitle: string;
  calcBundleHint: string;
  calc1rmTitle: string;
  calcWeightLabel: string;
  calcRepsLabel: string;
  calc1rmFoot: string;
  calcMacroTitle: string;
  calcBwLabel: string;
  calcHeightLabel: string;
  calcAgeLabel: string;
  calcActivityLabel: string;
  calcGoalLabel: string;
  calcGoalMaintain: string;
  calcGoalCut: string;
  calcGoalBulk: string;
  calcTargetCals: string;
  calcProtein: string;
  calcFat: string;
  calcCarbs: string;
  calcMacroFoot: string;
  calcLogMacros: string;
  calcBuildSession: string;
  calcAssessment: string;
  calcPremiumTitle: string;
  calcPremiumDesc: string;
  calcPremiumBtn: string;
  calcUnitsFoot: string;
  calcCommunityFoot: string;
  calcBannerTitle: string;
  calcBannerDesc: string;
  calcSignInFoot: string;
  calcLogAlert: string;
};

const en: CalculatorsStrings = {
  calcTitle: 'Mission Winning Calculators',
  calcSubtitle:
    'Free tools for everyone. Super Bundle unlocks premium versions — advanced periodization, full macros, client tools that sync.',
  calcBundleHint: 'Join the Super Bundle for lifetime premium calculators + all pillars. See /bundle.',
  calc1rmTitle: 'Estimated 1RM',
  calcWeightLabel: 'Weight ({{unit}})',
  calcRepsLabel: 'Reps',
  calc1rmFoot: 'Epley formula. Use as starting point. Test real 1RM carefully.',
  calcMacroTitle: 'Macro & TDEE Estimator (Free — Super Bundle unlocks advanced)',
  calcBwLabel: 'Bodyweight ({{unit}})',
  calcHeightLabel: 'Height ({{unit}})',
  calcAgeLabel: 'Age',
  calcActivityLabel: 'Activity Multiplier',
  calcGoalLabel: 'Goal',
  calcGoalMaintain: 'maintain',
  calcGoalCut: 'cut',
  calcGoalBulk: 'bulk',
  calcTargetCals: 'Target Calories',
  calcProtein: 'Protein',
  calcFat: 'Fat',
  calcCarbs: 'Carbs',
  calcMacroFoot:
    'Rough Mifflin-St Jeor + activity. Premium version in programs includes adjustments for training phase, body comp, and Log integration.',
  calcLogMacros: 'Log Macro Targets to Nutrition',
  calcBuildSession: 'Build Session Targeting e1RM ~{{e1rm}}',
  calcAssessment: 'Run Readiness Assessment First',
  calcPremiumTitle: 'PREMIUM CALCULATORS & TOOLS — SUPER BUNDLE MEMBERS',
  calcPremiumDesc:
    'Enroll in any program to unlock advanced periodization calculators, contest prep macros, client assessment scoring, custom block generators that sync into your Log, and more.',
  calcPremiumBtn: 'See Super Bundle & Unlock Premium Tools',
  calcUnitsFoot: 'Toggle kg/lbs and cm/in in Profile. Global default is metric.',
  calcCommunityFoot:
    'Join the growing global community building healthier lives. Get the Super Bundle to unlock all premium tools + shape the future via /feedback.',
  calcBannerTitle: 'SUPER BUNDLE:',
  calcBannerDesc:
    'One subscription for all premium pillars (Train Coach, Fuel, Move, Mind, Learn). 50% intro pricing — free core always available.',
  calcSignInFoot: 'Sign in to sync calculator logs and nutrition targets across devices.',
  calcLogAlert: 'Logged {{protein}}g protein + {{cals}} cals target to today (view in Nutrition).',
};

const es: CalculatorsStrings = {
  ...en,
  calcTitle: 'Calculadoras Mission Winning',
  calc1rmTitle: '1RM estimado',
  calcMacroTitle: 'Macros y TDEE (gratis)',
  calcGoalMaintain: 'mantener',
  calcGoalCut: 'definir',
  calcGoalBulk: 'volumen',
  calcLogMacros: 'Registrar macros en Nutrición',
};

const zh: CalculatorsStrings = {
  ...en,
  calcTitle: 'Mission Winning 计算器',
  calc1rmTitle: '估算 1RM',
  calcMacroTitle: '宏量与 TDEE 估算（免费）',
  calcGoalMaintain: '维持',
  calcGoalCut: '减脂',
  calcGoalBulk: '增肌',
};

const id: CalculatorsStrings = { ...en, calcTitle: 'Kalkulator Mission Winning' };
const th: CalculatorsStrings = { ...en, calcTitle: 'เครื่องคำนวณ Mission Winning' };
const ar: CalculatorsStrings = { ...en, calcTitle: 'حاسبات Mission Winning' };

const LOCALES: Partial<Record<string, CalculatorsStrings>> = { en, es, zh, id, th, ar };

export function calculatorsStringsFor(lang: string): CalculatorsStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeCalculatorsStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, calculatorsStringsFor(lang));
}
