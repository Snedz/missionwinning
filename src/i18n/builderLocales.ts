/** Builder pillar UI chrome — merged into i18n `common` namespace. */

type BuilderStrings = {
  builderTitle: string;
  builderSubtitle: string;
  builderTemplatesTitle: string;
  builderTemplatesFoot: string;
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
};

const en: BuilderStrings = {
  builderTitle: 'Workout Builder',
  builderSubtitle:
    'Use the Beginner, Advanced, or Pro tabs below, then click Load on a session. Premium unlocks bodybuilding, corrective & conditioning specialist programs.',
  builderTemplatesTitle: 'Program Templates',
  builderTemplatesFoot: 'Includes new free bodyweight + mobility circuits (vision core)',
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
};

const es: BuilderStrings = {
  ...en,
  builderTitle: 'Constructor de entrenamientos',
  builderTabBeginner: 'Principiante',
  builderTabAdvanced: 'Avanzado',
  builderSaveWorkout: 'Guardar entrenamiento',
  builderStartWorkout: 'Iniciar entrenamiento',
  builderTemplateLoaded: 'Plantilla cargada',
};

const zh: BuilderStrings = {
  ...en,
  builderTitle: '训练构建器',
  builderTabBeginner: '初学者',
  builderTabAdvanced: '进阶',
  builderSaveWorkout: '保存训练',
  builderStartWorkout: '开始训练',
};

const id: BuilderStrings = {
  ...en,
  builderTitle: 'Pembuat latihan',
  builderSaveWorkout: 'Simpan latihan',
  builderStartWorkout: 'Mulai latihan',
};

const th: BuilderStrings = {
  ...en,
  builderTitle: 'สร้างการฝึก',
  builderSaveWorkout: 'บันทึกการฝึก',
  builderStartWorkout: 'เริ่มฝึก',
};

const ar: BuilderStrings = {
  ...en,
  builderTitle: 'منشئ التمارين',
  builderSaveWorkout: 'حفظ التمرين',
  builderStartWorkout: 'بدء التمرين',
};

const LOCALES: Partial<Record<string, BuilderStrings>> = { en, es, zh, id, th, ar };

export function builderStringsFor(lang: string): BuilderStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeBuilderStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, builderStringsFor(lang));
}
