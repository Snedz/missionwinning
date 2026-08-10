/** Builder pillar UI chrome — merged into i18n `common` namespace. */

type BuilderStrings = {
  builderTitle: string;
  builderSubtitle: string;
  builderSubtitleBrief: string;
  builderTemplatesTitle: string;
  builderTemplatesFoot: string;
  builderProgramCount: string;
  builderTabBeginner: string;
  builderTabAdvanced: string;
  builderTabPro: string;
  builderDraftTitle: string;
  builderWorkoutName: string;
  builderSessionNotes: string;
  builderAddExercise: string;
  builderChooseExercise: string;
  builderSaveWorkout: string;
  builderStartWorkout: string;
  builderSavedTitle: string;
  builderNoSaved: string;
  builderLoad: string;
  builderDelete: string;
  builderTemplateLoaded: string;
  builderTemplateLoadedDesc: string;
  builderIncomplete: string;
  builderStarted: string;
  builderSignInFoot: string;
  builderCycleSaved: string;
  builderCycleSavedDesc: string;
  builderAlreadyAdded: string;
  builderAlreadyAddedDesc: string;
  builderNameRequired: string;
  builderNameRequiredDesc: string;
  builderAddExercises: string;
  builderAddExercisesDesc: string;
  builderWorkoutSaved: string;
  builderWorkoutSavedDesc: string;
  builderNewWorkout: string;
  builderNewWorkoutDesc: string;
  builderWorkoutNamePlaceholder: string;
  builderProgramNotes: string;
  builderSelectExercise: string;
  builderAdd: string;
  builderMobilityAlready: string;
  builderQuickMobility: string;
  builderLoadHabitStack: string;
  builderHabitStackName: string;
  builderHabitStackNotes: string;
  builderTableSet: string;
  builderTableReps: string;
  builderTableWeight: string;
  builderAddSet: string;
  builderSavedMeta: string;
  builderSessionReps: string;
  builderNoPrograms: string;
  builderDetails: string;
  builderSaveAll: string;
  builderSessionMeta: string;
  builderTemplateLoadFail: string;
  builderStyleFilter: string;
  builderFilterAll: string;
  builderProPremium: string;
  builderUnlockBundle: string;
  builderQuickLoadLabel: string;
  builderQuickLoadPlaceholder: string;
  builderQuickLoadButton: string;
  builderStepStart: string;
  builderStepArrange: string;
  builderStepFinish: string;
  builderEyebrow: string;
  builderPickStart: string;
  builderPickStartDesc: string;
  builderStartBlank: string;
  builderLoadSaved: string;
  builderShowLessSaved: string;
  builderShowAllSaved: string;
  builderNoSavedDesc: string;
  builderFinishDesc: string;
  builderExerciseCount: string;
  builderBack: string;
  builderSessionCount: string;
  builderProOffline: string;
  builderProLoadFail: string;
  /** Free-beta: depth unlocked — no “premium” load/offline merch. */
  builderProOfflineOpenBeta: string;
  builderProLoadFailOpenBeta: string;
  builderTemplateSearch: string;
  builderTemplateSearchCount: string;
  builderProFreeBeta: string;
  builderRemoveExercise: string;
  builderRemoveSet: string;
  builderContinue: string;
};

const en: BuilderStrings = {
  builderTitle: 'Workout Builder',
  builderSubtitle:
    'Use the Beginner, Advanced, or Pro tabs below, then click Load on a session. Premium unlocks bodybuilding, corrective & conditioning specialist programs.',
  builderSubtitleBrief: 'Three steps: start, arrange, train.',
  builderTemplatesTitle: 'Program Templates',
  builderTemplatesFoot: 'Includes new free bodyweight + mobility circuits (vision core)',
  builderProgramCount: '{{count}} programs',
  builderTabBeginner: 'Beginner',
  builderTabAdvanced: 'Advanced',
  builderTabPro: 'Pro',
  builderDraftTitle: 'Draft workout',
  builderWorkoutName: 'Workout name',
  builderSessionNotes: 'Session notes (optional)',
  builderAddExercise: 'Add exercise',
  builderChooseExercise: 'Choose exercise…',
  builderSaveWorkout: 'Save workout',
  builderStartWorkout: 'Start workout',
  builderSavedTitle: 'Saved workouts',
  builderNoSaved: 'No saved workouts yet. Build one above or load a template.',
  builderLoad: 'Load',
  builderDelete: 'Delete',
  builderTemplateLoaded: 'Template loaded',
  builderTemplateLoadedDesc: '{{session}} — adjust weights and save or start.',
  builderIncomplete: 'Incomplete workout',
  builderStarted: 'Workout started!',
  builderSignInFoot: 'Sign in to sync saved routines across devices.',
  builderCycleSaved: 'Cycle saved',
  builderCycleSavedDesc: '{{count}} workouts added to saved list.',
  builderAlreadyAdded: 'Already added',
  builderAlreadyAddedDesc: 'This exercise is in the workout.',
  builderNameRequired: 'Name required',
  builderNameRequiredDesc: 'Give your workout a name.',
  builderAddExercises: 'Add exercises',
  builderAddExercisesDesc: 'Add at least one exercise.',
  builderWorkoutSaved: 'Workout saved',
  builderWorkoutSavedDesc: '"{{name}}" is ready to use.',
  builderNewWorkout: 'New Workout',
  builderNewWorkoutDesc: 'Pick exercises and configure sets',
  builderWorkoutNamePlaceholder: 'e.g. Push Day A',
  builderProgramNotes: 'Program notes:',
  builderSelectExercise: 'Select exercise…',
  builderAdd: 'Add',
  builderMobilityAlready: 'Mobility warm-up already in session.',
  builderQuickMobility: '+ Quick Add Free Mobility Warm-up (5 moves)',
  builderLoadHabitStack: 'Load Free Habit/Mobility Stack',
  builderHabitStackName: 'Daily Habit Stack (Free)',
  builderHabitStackNotes: 'Vision-aligned free core: mobility + consistency. Log in Nutrition too.',
  builderTableSet: 'Set',
  builderTableReps: 'Reps',
  builderTableWeight: 'Weight ({{unit}})',
  builderAddSet: 'Add Set',
  builderSavedMeta: '{{count}} exercises · {{date}}',
  builderSessionReps: '{{name}}: {{sets}}× ({{reps}} reps)',
  builderNoPrograms: 'No programs in this category.',
  builderDetails: 'Details',
  builderSaveAll: 'Save all ({{count}})',
  builderSessionMeta: '{{exercises}} exercises · {{sets}} sets',
  builderTemplateLoadFail: 'Template data failed to load. Restart the dev server.',
  builderStyleFilter: 'Style:',
  builderFilterAll: 'All',
  builderProPremium: 'Pro cycles require Super Bundle premium.',
  builderUnlockBundle: 'Unlock Super Bundle',
  builderQuickLoadLabel: 'Quick load (all categories)',
  builderQuickLoadPlaceholder: 'Choose program & session…',
  builderQuickLoadButton: 'Load into builder',
  builderStepStart: 'Start',
  builderStepArrange: 'Arrange',
  builderStepFinish: 'Finish',
  builderEyebrow: 'Builder',
  builderPickStart: 'How do you want to start?',
  builderPickStartDesc: 'Blank session, a program template, or a saved routine.',
  builderStartBlank: 'Blank workout',
  builderLoadSaved: 'Load',
  builderShowLessSaved: 'Show less',
  builderShowAllSaved: 'Show all {{count}}',
  builderNoSavedDesc: 'Build a workout and save it — your routines appear here.',
  builderFinishDesc: 'Name your session and save or start training.',
  builderExerciseCount: '{{count}} exercises ready',
  builderBack: 'Back',
  builderSessionCount: '{{count}} sessions',
  builderProOffline: 'Offline — premium program list will load when you reconnect.',
  builderProLoadFail: 'Could not load premium programs. Try again.',
  builderProOfflineOpenBeta:
    'Offline — pro program list will load when you reconnect. Free templates still work.',
  builderProLoadFailOpenBeta: 'Could not load pro programs. Try again — free templates still work.',
  builderTemplateSearch: 'Search programs or sessions…',
  builderTemplateSearchCount: '{{count}} matching',
  builderProFreeBeta: 'Pro cycles are paused during open beta — free templates stay available.',
  builderRemoveExercise: 'Remove exercise',
  builderRemoveSet: 'Remove set',
  builderContinue: 'Continue',
};

const es: BuilderStrings = {
  ...en,
  builderTitle: 'Constructor de entrenamientos',
  builderTabBeginner: 'Principiante',
  builderTabAdvanced: 'Avanzado',
  builderSaveWorkout: 'Guardar entrenamiento',
  builderStartWorkout: 'Iniciar entrenamiento',
  builderTemplateLoaded: 'Plantilla cargada',
  builderNewWorkout: 'Nuevo entrenamiento',
  builderAdd: 'Añadir',
  builderLoad: 'Cargar',
  builderDetails: 'Detalles',
};

const zh: BuilderStrings = {
  ...en,
  builderTitle: '训练构建器',
  builderTabBeginner: '初学者',
  builderTabAdvanced: '进阶',
  builderSaveWorkout: '保存训练',
  builderStartWorkout: '开始训练',
  builderNewWorkout: '新建训练',
  builderAdd: '添加',
  builderLoad: '加载',
};

const id: BuilderStrings = {
  ...en,
  builderTitle: 'Pembuat latihan',
  builderSaveWorkout: 'Simpan latihan',
  builderStartWorkout: 'Mulai latihan',
  builderNewWorkout: 'Latihan baru',
  builderAdd: 'Tambah',
};

const th: BuilderStrings = {
  ...en,
  builderTitle: 'สร้างการฝึก',
  builderSaveWorkout: 'บันทึกการฝึก',
  builderStartWorkout: 'เริ่มฝึก',
  builderNewWorkout: 'การฝึกใหม่',
  builderAdd: 'เพิ่ม',
};

const ar: BuilderStrings = {
  ...en,
  builderTitle: 'منشئ التمارين',
  builderSaveWorkout: 'حفظ التمرين',
  builderStartWorkout: 'بدء التمرين',
  builderNewWorkout: 'تمرين جديد',
  builderAdd: 'إضافة',
};

const LOCALES: Partial<Record<string, BuilderStrings>> = { en, es, zh, id, th, ar };

export function builderStringsFor(lang: string): BuilderStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeBuilderStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, builderStringsFor(lang));
}
