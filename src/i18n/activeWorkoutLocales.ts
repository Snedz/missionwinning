/** Active workout / rest timer copy — merged into i18n `common` namespace. */

type ActiveWorkoutStrings = {
  activeNoWorkout: string;
  activeNoWorkoutDesc: string;
  activeStartWorkout: string;
  activeSetsCompleted: string;
  activeCancel: string;
  activeLiveSession: string;
  activeElapsed: string;
  activeSetsLabel: string;
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
  activeLoadPctChip: string;
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
  /** Bodyweight load token when stored weight is 0 (not "0 kg"). */
  activeSetBodyweight: string;
};

const en: ActiveWorkoutStrings = {
  activeLiveSession: 'Live session',
  activeElapsed: 'Elapsed',
  activeSetsLabel: 'Sets',
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
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Add Set',
  activeStartRest: '{{seconds}}s Rest',
  activeLogSet: 'Log set',
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
  activeSetBodyweight: 'BW',
};

const es: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'Sesión en vivo',
  activeElapsed: 'Transcurrido',
  activeSetsLabel: 'Series',
  activeNoWorkout: 'Sin entrenamiento activo',
  activeNoWorkoutDesc:
    'Inicia un entrenamiento rápido desde Hoy o lanza una rutina guardada desde el Builder.',
  activeStartWorkout: 'Iniciar entrenamiento',
  activeSetsCompleted: '{{done}}/{{total}} series completadas',
  activeCancel: 'Cancelar',
  activeFinish: 'Terminar',
  activeCoachNotes: 'Notas del coach',
  activeCoachProgression: 'Progresión',
  activeRestTitle: 'Descanso',
  activeRestSubtitle: 'Recupera — siguiente serie cuando estés listo',
  activeRestSkip: 'Saltar',
  activeAddExercise: 'Añadir ejercicio',
  activeChooseExercise: 'Elegir ejercicio…',
  activeEmptyExercises: 'Añade ejercicios arriba para registrar series.',
  activeFormGuide: 'Guía de forma',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Añadir serie',
  activeStartRest: 'Descanso {{seconds}}s',
  activeLogSet: 'Registrar serie',
  activeRepeatLast: 'Repetir última serie',
  activeLastPerformance: 'Última: {{reps}} × {{weight}}',
  activeSetLogged: '¡Serie registrada!',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — descanso {{rest}}s',
  activeWorkoutComplete: '¡Entrenamiento completo!',
  activeNothingLogged: 'Nada registrado',
  activeReps: 'Reps',
  activeWeight: 'kg',
  activePrTitle: '¡Nuevo PR!',
  activePrDesc: '{{reps}} × {{weight}} — récord personal en este ejercicio',
};

const fr: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'Séance en direct',
  activeElapsed: 'Écoulé',
  activeSetsLabel: 'Séries',
  activeNoWorkout: 'Aucun entraînement actif',
  activeNoWorkoutDesc:
    'Démarrez un entraînement rapide depuis Aujourd’hui ou lancez une routine depuis le Builder.',
  activeStartWorkout: "Commencer l'entraînement",
  activeSetsCompleted: '{{done}}/{{total}} séries terminées',
  activeCancel: 'Annuler',
  activeFinish: 'Terminer',
  activeCoachNotes: 'Notes du coach',
  activeCoachProgression: 'Progression',
  activeRestTitle: 'Repos',
  activeRestSubtitle: 'Récupérez — série suivante quand vous êtes prêt',
  activeRestSkip: 'Passer',
  activeRestAdd15: '+15 s',
  activeRestSub15: '−15 s',
  activeAddExercise: 'Ajouter un exercice',
  activeChooseExercise: 'Choisir un exercice…',
  activeEmptyExercises: 'Ajoutez des exercices ci-dessus pour enregistrer des séries.',
  activeFormGuide: 'Guide de forme',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Ajouter une série',
  activeStartRest: 'Repos {{seconds}} s',
  activeLogSet: 'Enregistrer la série',
  activeRepeatLast: 'Répéter la dernière série',
  activeLastPerformance: 'Dernière : {{reps}} × {{weight}}',
  activeSetLogged: 'Série enregistrée !',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — repos {{rest}} s',
  activeWorkoutComplete: 'Entraînement terminé !',
  activeNothingLogged: 'Rien d’enregistré',
  activeReps: 'Reps',
  activeWeight: 'kg',
  activeRpeEasy: 'Facile',
  activeRpeMed: 'Moyen',
  activeRpeHard: 'Dur',
  activePrTitle: 'Nouveau PR !',
  activePrDesc: '{{reps}} × {{weight}} — record personnel pour cet exercice',
  activeCopyLast: 'Copier la dernière',
  activePlateCalcTitle: 'Calculateur de disques',
  activePlateCalcSubtitle: 'Charger la barre',
  activePlateTarget: 'Poids cible',
  activePlateBar: 'Poids de la barre',
  activePlatePerSide: 'Par côté',
  activePlateTotal: 'Total sur la barre : {{weight}} {{unit}}',
  activePlateRemainder: 'Charge exacte impossible — {{remainder}}{{unit}} manquants',
  activePlateApply: 'Utiliser {{weight}} {{unit}}',
  activeOpenPlateCalc: 'Disques',
  activeSetNormal: 'Travail',
  activeSetWarmup: 'Échauffement',
  activeSetFailure: 'Échec',
  activeSetDrop: 'Drop',
  activeSupersetLink: 'Superset avec le suivant',
  activeSupersetUnlink: 'Dissocier le superset',
  activeSetLoggedSuperset: '{{reps}} × {{weight}} — exercice suivant du superset',
};

const zh: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: '进行中',
  activeElapsed: '已用时',
  activeSetsLabel: '组数',
  activeNoWorkout: '没有进行中的训练',
  activeStartWorkout: '开始训练',
  activeSetsCompleted: '已完成 {{done}}/{{total}} 组',
  activeCancel: '取消',
  activeFinish: '完成',
  activeRestTitle: '休息',
  activeRestSkip: '跳过',
  activeLogSet: '记录组',
  activeRepeatLast: '重复上一组',
};

const id: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'Sesi langsung',
  activeElapsed: 'Berjalan',
  activeSetsLabel: 'Set',
  activeStartWorkout: 'Mulai latihan',
  activeRestTitle: 'Istirahat',
  activeLogSet: 'Catat set',
  activeRepeatLast: 'Ulangi set terakhir',
};

const th: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'เซสชันสด',
  activeElapsed: 'ผ่านไป',
  activeSetsLabel: 'เซ็ต',
  activeStartWorkout: 'เริ่มฝึก',
  activeRestTitle: 'พัก',
  activeLogSet: 'บันทึกเซต',
  activeRepeatLast: 'ทำซ้ำเซตล่าสุด',
};

const ar: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'جلسة مباشرة',
  activeElapsed: 'المنقضي',
  activeSetsLabel: 'المجموعات',
  activeStartWorkout: 'بدء التمرين',
  activeRestTitle: 'راحة',
  activeLogSet: 'تسجيل المجموعة',
  activeRepeatLast: 'تكرار آخر مجموعة',
  activeRestSkip: 'تخطي',
};

const de: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'Live-Einheit',
  activeElapsed: 'Verstrichen',
  activeSetsLabel: 'Sätze',
  activeNoWorkout: 'Kein aktives Training',
  activeNoWorkoutDesc:
    'Starte ein Schnelltraining von Heute oder starte eine Routine aus dem Builder.',
  activeStartWorkout: 'Training starten',
  activeSetsCompleted: '{{done}}/{{total}} Sätze abgeschlossen',
  activeCancel: 'Abbrechen',
  activeFinish: 'Beenden',
  activeCoachNotes: 'Coach-Notizen',
  activeCoachProgression: 'Progression',
  activeRestTitle: 'Pause',
  activeRestSubtitle: 'Erhole dich — nächster Satz, wenn du bereit bist',
  activeRestSkip: 'Überspringen',
  activeRestAdd15: '+15 s',
  activeRestSub15: '−15 s',
  activeAddExercise: 'Übung hinzufügen',
  activeChooseExercise: 'Übung wählen…',
  activeEmptyExercises: 'Füge oben Übungen hinzu, um Sätze zu protokollieren.',
  activeFormGuide: 'Form-Guide',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Satz hinzufügen',
  activeStartRest: 'Pause {{seconds}} s',
  activeLogSet: 'Satz speichern',
  activeRepeatLast: 'Letzten Satz wiederholen',
  activeLastPerformance: 'Zuletzt: {{reps}} × {{weight}}',
  activeSetLogged: 'Satz gespeichert!',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — Pause {{rest}} s',
  activeWorkoutComplete: 'Training abgeschlossen!',
  activeNothingLogged: 'Nichts protokolliert',
  activeReps: 'Wdh.',
  activeWeight: 'kg',
  activeRpeEasy: 'Leicht',
  activeRpeMed: 'Mittel',
  activeRpeHard: 'Hart',
  activePrTitle: 'Neuer PR!',
  activePrDesc: '{{reps}} × {{weight}} — persönlicher Rekord für diese Übung',
  activeCopyLast: 'Letzten kopieren',
  activePlateCalcTitle: 'Scheibenrechner',
  activePlateCalcSubtitle: 'Stange beladen',
  activePlateTarget: 'Zielgewicht',
  activePlateBar: 'Stangengewicht',
  activePlatePerSide: 'Pro Seite',
  activePlateTotal: 'Gesamt auf der Stange: {{weight}} {{unit}}',
  activePlateRemainder: 'Exakte Last nicht möglich — {{remainder}}{{unit}} fehlen',
  activePlateApply: '{{weight}} {{unit}} verwenden',
  activeOpenPlateCalc: 'Scheiben',
  activeSetNormal: 'Arbeit',
  activeSetWarmup: 'Aufwärmen',
  activeSetFailure: 'Versagen',
  activeSetDrop: 'Drop',
  activeSupersetLink: 'Supersatz mit nächster',
  activeSupersetUnlink: 'Supersatz trennen',
  activeSetLoggedSuperset: '{{reps}} × {{weight}} — nächste Übung im Supersatz',
};

const LOCALES: Partial<Record<string, ActiveWorkoutStrings>> = {
  en,
  es,
  fr,
  zh,
  id,
  th,
  ar,
  de,
  pt: {
    ...en,
    activeNoWorkout: 'Nenhum treino ativo',
    activeFinish: 'Concluir',
    activeLiveSession: 'Sessão ao vivo',
    activeElapsed: 'Decorrido',
    activeSetsLabel: 'Séries',
  },
  it: {
    ...en,
    activeNoWorkout: 'Nessun allenamento attivo',
    activeFinish: 'Fine',
    activeLiveSession: 'Sessione dal vivo',
    activeElapsed: 'Trascorso',
    activeSetsLabel: 'Serie',
  },
  ko: {
    ...en,
    activeNoWorkout: '진행 중인 운동 없음',
    activeFinish: '완료',
    activeLiveSession: '진행 중인 세션',
    activeElapsed: '경과',
    activeSetsLabel: '세트',
  },
};

export function activeWorkoutStringsFor(lang: string): ActiveWorkoutStrings {
  const code = lang.split('-')[0];
  return LOCALES[code] ?? en;
}

export function mergeActiveWorkoutStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, activeWorkoutStringsFor(lang));
}
