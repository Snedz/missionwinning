/** Active workout / rest timer copy — merged into i18n `common` namespace. */

import { tier1ActiveBody } from './tier1WelcomeFuelActive';

type ActiveWorkoutStrings = {
  activeNoWorkout: string;
  activeNoWorkoutDesc: string;
  activeStartWorkout: string;
  activeSetsCompleted: string;
  activeCancel: string;
  activeFinish: string;
  activeCoachNotes: string;
  activeCoachProgression: string;
  activeRestTitle: string;
  activeRestSubtitle: string;
  activeRestSkip: string;
  activeRestAdd15: string;
  activeRestSub15: string;
  activeAddExercise: string;
  activeChooseExercise: string;
  activeEmptyExercises: string;
  activeFormGuide: string;
  activeAddSet: string;
  activeStartRest: string;
  activeLogSet: string;
  activeRepeatLast: string;
  activeLastPerformance: string;
  activeSetLogged: string;
  activeSetLoggedDesc: string;
  activeWorkoutComplete: string;
  activeNothingLogged: string;
  activeReps: string;
  activeWeight: string;
  activeRpeEasy: string;
  activeRpeMed: string;
  activeRpeHard: string;
  activePrTitle: string;
  activePrDesc: string;
  activeCopyLast: string;
  activePlateCalcTitle: string;
  activePlateCalcSubtitle: string;
  activePlateTarget: string;
  activePlateBar: string;
  activePlatePerSide: string;
  activePlateTotal: string;
  activePlateRemainder: string;
  activePlateApply: string;
  activeOpenPlateCalc: string;
  activeSetNormal: string;
  activeSetWarmup: string;
  activeSetFailure: string;
  activeSetDrop: string;
  activeSupersetLink: string;
  activeSupersetUnlink: string;
  activeSetLoggedSuperset: string;
};

const en: ActiveWorkoutStrings = {
  activeNoWorkout: 'No Active Workout',
  activeNoWorkoutDesc: 'Start a quick workout from Today or launch a saved routine from the builder.',
  activeStartWorkout: 'Start Workout',
  activeSetsCompleted: '{{done}}/{{total}} sets completed',
  activeCancel: 'Cancel',
  activeFinish: 'Finish',
  activeCoachNotes: 'Coach Notes',
  activeCoachProgression: 'Progression',
  activeRestTitle: 'Rest',
  activeRestSubtitle: 'Recover — next set when ready',
  activeRestSkip: 'Skip',
  activeRestAdd15: '+15s',
  activeRestSub15: '−15s',
  activeAddExercise: 'Add Exercise',
  activeChooseExercise: 'Choose exercise...',
  activeEmptyExercises: 'Add exercises above to begin logging sets.',
  activeFormGuide: 'Form guide',
  activeAddSet: 'Add Set',
  activeStartRest: '{{seconds}}s Rest',
  activeLogSet: 'Log',
  activeRepeatLast: 'Repeat last set',
  activeLastPerformance: 'Last: {{reps}} × {{weight}}',
  activeSetLogged: 'Set logged!',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — {{rest}}s rest',
  activeWorkoutComplete: 'Workout complete!',
  activeNothingLogged: 'Nothing logged',
  activeReps: 'Reps',
  activeWeight: 'lbs',
  activeRpeEasy: 'Easy',
  activeRpeMed: 'Med',
  activeRpeHard: 'Hard',
  activePrTitle: 'New PR!',
  activePrDesc: '{{reps}} × {{weight}} — personal best for this exercise',
  activeCopyLast: 'Copy last',
  activePlateCalcTitle: 'Plate calculator',
  activePlateCalcSubtitle: 'Load the bar',
  activePlateTarget: 'Target weight',
  activePlateBar: 'Bar weight',
  activePlatePerSide: 'Per side',
  activePlateTotal: 'Total on bar: {{weight}} {{unit}}',
  activePlateRemainder: 'Cannot load exactly — {{remainder}}{{unit}} short',
  activePlateApply: 'Use {{weight}} {{unit}}',
  activeOpenPlateCalc: 'Plates',
  activeSetNormal: 'Work',
  activeSetWarmup: 'Warmup',
  activeSetFailure: 'Failure',
  activeSetDrop: 'Drop',
  activeSupersetLink: 'Superset w/ next',
  activeSupersetUnlink: 'Unlink superset',
  activeSetLoggedSuperset: '{{reps}} × {{weight}} — next exercise in superset',
};

const es: ActiveWorkoutStrings = {
  ...en,
  activeNoWorkout: 'Sin entrenamiento activo',
  activeStartWorkout: 'Iniciar entrenamiento',
  activeSetsCompleted: '{{done}}/{{total}} series completadas',
  activeCancel: 'Cancelar',
  activeFinish: 'Terminar',
  activeRestTitle: 'Descanso',
  activeRestSkip: 'Saltar',
  activeLogSet: 'Registrar',
  activeRepeatLast: 'Repetir última serie',
  activeSetLogged: '¡Serie registrada!',
};

const zh: ActiveWorkoutStrings = {
  ...en,
  activeNoWorkout: '没有进行中的训练',
  activeStartWorkout: '开始训练',
  activeSetsCompleted: '已完成 {{done}}/{{total}} 组',
  activeCancel: '取消',
  activeFinish: '完成',
  activeRestTitle: '休息',
  activeRestSkip: '跳过',
  activeLogSet: '记录',
  activeRepeatLast: '重复上一组',
};

const id: ActiveWorkoutStrings = {
  ...en,
  activeStartWorkout: 'Mulai latihan',
  activeRestTitle: 'Istirahat',
  activeLogSet: 'Catat',
  activeRepeatLast: 'Ulangi set terakhir',
};

const th: ActiveWorkoutStrings = {
  ...en,
  activeStartWorkout: 'เริ่มฝึก',
  activeRestTitle: 'พัก',
  activeLogSet: 'บันทึก',
  activeRepeatLast: 'ทำซ้ำเซตล่าสุด',
};

const ar: ActiveWorkoutStrings = {
  ...en,
  activeStartWorkout: 'بدء التمرين',
  activeRestTitle: 'راحة',
  activeLogSet: 'تسجيل',
  activeRepeatLast: 'تكرار آخر مجموعة',
  activeRestSkip: 'تخطي',
};

const LOCALES: Partial<Record<string, ActiveWorkoutStrings>> = { en, es, zh, id, th, ar };

export function activeWorkoutStringsFor(lang: string): ActiveWorkoutStrings {
  const code = lang.split('-')[0];
  return { ...en, ...(tier1ActiveBody(lang) ?? {}), ...(LOCALES[code] ?? {}) };
}

export function mergeActiveWorkoutStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, activeWorkoutStringsFor(lang));
}
