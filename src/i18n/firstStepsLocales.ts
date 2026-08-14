/**
 * First-steps checklist strings — merged into the i18n `common` namespace.
 *
 * `.240`. English-first, like [`feedbackLocales.ts`](./feedbackLocales.ts):
 * `Record<string, string>` per language rather than a strict `Locale` type, so
 * a language can carry the lines that matter to it without a fifteen-way
 * translation pass blocking the feature. Every lookup falls back to `EN`.
 *
 * These exist as keys at all because `i18n-coverage.ts` fails on any **new**
 * uncovered key: a `t('x', { defaultValue: 'English' })` with no entry in an EN
 * pack is invisible to translators and renders English in fourteen languages
 * silently. The ratchet caught this wave doing exactly that, which is the check
 * working.
 *
 * Also carries the two Fuel strip labels and the public status line, because
 * `fuelLocales`/`todayLocales` use strict per-language types and a partial
 * addition there would not compile.
 */

const FIRST_STEPS_EN: Record<string, string> = {
  // Card + sheet chrome
  firstStepsEyebrow: 'Your first steps',
  firstStepsProgressLabel: 'Progress',
  firstStepsDismissToMore: 'Hide from Today — keep it under More',
  firstStepsSheetTitle: 'Get to know the app',
  firstStepsSheetIntro:
    'None of these are required — the logger and your weekly plan work without any of them. They are the parts of the app most people never find.',

  // The six steps. Each `Why` line is load-bearing: it is the difference
  // between a checklist someone finishes and a chore list they dismiss.
  firstStepWorkoutTitle: 'Log your first workout',
  firstStepWorkoutWhy: 'One logged set is all Mission Coach needs to start building your week.',
  firstStepSession2Title: 'Log a second session',
  firstStepSession2Why:
    'Two sessions in week one locks the habit. Coach builds from the logs — not every pillar at once.',
  week1SecondSessionCta: 'Start session 2',
  week1SecondSessionKicker: 'Week one habit',
  week1SecondSessionReason:
    'One session logged. A second this week locks the loop — Coach builds from the logs, not another pillar.',
  week1SecondSessionCoachDesc:
    'Session two of week one — from the plan that already saw your first log.',
  firstStepFuelTitle: 'Log what you ate',
  firstStepFuelWhy: 'Protein is the one number worth watching early. Nothing else is required.',
  firstStepMindTitle: 'Take one check-in',
  firstStepMindWhy: 'How rested you feel changes what the coach asks of you tomorrow.',
  firstStepMoveTitle: 'Try a mobility flow',
  firstStepMoveWhy:
    'Five minutes on the days you do not train is what keeps the streak reachable.',
  firstStepLearnTitle: 'Read one guide',
  firstStepLearnWhy:
    'Knowing why a session is built the way it is makes it easier to keep going.',
  firstStepParqTitle: 'Complete the health screen',
  firstStepParqWhy:
    'A short safety questionnaire. It is the one step the app does ask for before pushing harder.',

  // Segmented-control names. A tablist with no accessible name is a group a
  // screen reader announces as nothing.
  fuelMealStripLabel: 'Meal',
  fuelModeStripLabel: 'Log method',

  // The public status bar — true only while `isFreeBeta()`.
  // Stamp interpolates APP_PUBLIC_PRODUCT_VERSION (free beta, not invite-only).
  publicStatusOpenBeta:
    '{{productVersion}} — free beta. Offline logging plus Mission Coach from your logs.',
};

const fs = (over: Record<string, string>): Record<string, string> => ({
  ...FIRST_STEPS_EN,
  ...over,
});

const BY_LANG: Record<string, Record<string, string>> = {
  en: FIRST_STEPS_EN,
  es: fs({
    firstStepsEyebrow: 'Tus primeros pasos',
    firstStepsProgressLabel: 'Progreso',
    firstStepsDismissToMore: 'Ocultar de Hoy — queda en Más',
    firstStepsSheetTitle: 'Conoce la aplicación',
    firstStepWorkoutTitle: 'Registra tu primer entrenamiento',
    firstStepFuelTitle: 'Registra lo que comiste',
    firstStepMindTitle: 'Haz un registro de ánimo',
    firstStepMoveTitle: 'Prueba una rutina de movilidad',
    firstStepLearnTitle: 'Lee una guía',
    firstStepParqTitle: 'Completa el cuestionario de salud',
    fuelMealStripLabel: 'Comida',
    fuelModeStripLabel: 'Método de registro',
  }),
  fr: fs({
    firstStepsEyebrow: 'Vos premiers pas',
    firstStepsProgressLabel: 'Progression',
    firstStepsDismissToMore: 'Masquer d’Aujourd’hui — reste dans Plus',
    firstStepsSheetTitle: 'Découvrir l’application',
    firstStepWorkoutTitle: 'Enregistrez votre première séance',
    firstStepFuelTitle: 'Enregistrez votre repas',
    firstStepMindTitle: 'Faites un point',
    firstStepMoveTitle: 'Essayez une séance de mobilité',
    firstStepLearnTitle: 'Lisez un guide',
    firstStepParqTitle: 'Complétez le questionnaire santé',
    fuelMealStripLabel: 'Repas',
    fuelModeStripLabel: 'Méthode',
  }),
  pt: fs({
    firstStepsEyebrow: 'Seus primeiros passos',
    firstStepsProgressLabel: 'Progresso',
    firstStepsDismissToMore: 'Ocultar de Hoje — fica em Mais',
    firstStepsSheetTitle: 'Conheça o aplicativo',
    firstStepWorkoutTitle: 'Registre seu primeiro treino',
    firstStepFuelTitle: 'Registre o que você comeu',
    firstStepMindTitle: 'Faça um check-in',
    firstStepMoveTitle: 'Experimente mobilidade',
    firstStepLearnTitle: 'Leia um guia',
    firstStepParqTitle: 'Complete a triagem de saúde',
    fuelMealStripLabel: 'Refeição',
    fuelModeStripLabel: 'Método de registro',
  }),
  de: fs({
    firstStepsEyebrow: 'Deine ersten Schritte',
    firstStepsProgressLabel: 'Fortschritt',
    firstStepsDismissToMore: 'Aus Heute ausblenden — bleibt unter Mehr',
    firstStepsSheetTitle: 'Lerne die App kennen',
    firstStepWorkoutTitle: 'Erstes Training erfassen',
    firstStepFuelTitle: 'Mahlzeit erfassen',
    firstStepMindTitle: 'Einmal einchecken',
    firstStepMoveTitle: 'Mobility ausprobieren',
    firstStepLearnTitle: 'Einen Leitfaden lesen',
    firstStepParqTitle: 'Gesundheits-Check ausfüllen',
    fuelMealStripLabel: 'Mahlzeit',
    fuelModeStripLabel: 'Erfassungsart',
  }),
  it: fs({
    firstStepsEyebrow: 'I tuoi primi passi',
    firstStepsProgressLabel: 'Progresso',
    firstStepsDismissToMore: 'Nascondi da Oggi — resta in Altro',
    firstStepsSheetTitle: 'Scopri l’app',
    firstStepWorkoutTitle: 'Registra il primo allenamento',
    firstStepFuelTitle: 'Registra cosa hai mangiato',
    firstStepMindTitle: 'Fai un check-in',
    firstStepMoveTitle: 'Prova la mobilità',
    firstStepLearnTitle: 'Leggi una guida',
    firstStepParqTitle: 'Completa lo screening sanitario',
    fuelMealStripLabel: 'Pasto',
    fuelModeStripLabel: 'Metodo',
  }),
};

export function firstStepsStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en!;
}

export function mergeFirstStepsStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, firstStepsStringsFor(lang));
}
