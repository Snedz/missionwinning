/** Active workout / rest timer copy — merged into i18n `common` namespace. */

type ActiveWorkoutStrings = {
  activeNoWorkout: string;
  activeNoWorkoutDesc: string;
  activeStartWorkout: string;
  activeSetsCompleted: string;
  activeCancel: string;
  activeLiveSession: string;
  /** Sticky eyebrow when session exercises are Coach-prescribed (not freestyle). */
  activeCoachSessionEyebrow: string;
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
  /** Mid-session swap sheet (AdaptiveOverlay) — `.269` */
  activeSwapEyebrow: string;
  activeSwapTitle: string;
  activeSwapPlaceholder: string;
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
  activeSetBodyweightAddLoad: string;
  /** Console progressive-overload strip (last · next · why). */
  activeOverloadLastLabel: string;
  activeOverloadNextLabel: string;
  activeOverloadAddReps: string;
  activeOverloadAddWeight: string;
  activeOverloadHold: string;
  activeOverloadFromLast: string;
  activeOverloadPrescribed: string;
  /** One-tap fill console from progressive-overload / coach next (.288). */
  activeUseNextTarget: string;
  /** Expand collapsed set-kind chips on outdoor console (.482). */
  activeSetKindMore: string;
  /** Compact console set ordinal ("Set 2 of 4"). */
  activeSetOf: string;
  activeDecreaseReps: string;
  activeIncreaseReps: string;
  activeDecreaseWeight: string;
  activeIncreaseWeight: string;
  /** Victory next-session progression (structured insight, `.290`). */
  victoryProgressAddWeight: string;
  victoryProgressAddReps: string;
  victoryProgressHold: string;
  victoryProgressAddRepsBw: string;
  victoryProgressHoldBw: string;
  /** Finish with zero sets — toast description (`.296`). */
  activeNothingLoggedDesc: string;
  /** Victory sheet (`.296`). */
  victoryShareText: string;
  victoryTitle: string;
  victoryScoutCue: string;
  victoryVolume: string;
  victorySets: string;
  victoryFeelSaved: string;
  victoryFeelPrompt: string;
  victoryFeelLow: string;
  victoryFeelHigh: string;
  victoryBodyDeltaLabel: string;
  victoryReadinessDelta: string;
  victoryStrainDelta: string;
  victoryRecoveryDelta: string;
  victoryStreak: string;
  victoryNextLabel: string;
  victoryBackToday: string;
  victoryViewHistory: string;
  victoryShare: string;
  victoryShareCard: string;
  /** Design review 2A — only when share + clipboard both fail (not cancel). */
  victoryShareFailed: string;
  /** Pre-session check-in sheet (`.296`). */
  sessionCheckInEyebrow: string;
  sessionCheckInTitle: string;
  sessionCheckInSave: string;
  sessionCheckInSkip: string;
  sessionCheckInLead: string;
  sessionCheckInSoreness: string;
  sessionCheckInFresh: string;
  sessionCheckInBeaten: string;
  sessionCheckInSleep: string;
  sessionCheckInPoor: string;
  sessionCheckInGreat: string;
  sessionCheckInMotivation: string;
  sessionCheckInLow: string;
  sessionCheckInFired: string;
  /** Kaizen Loop 2 L4 — Active chrome + session volume (.299) */
  activeAddExerciseTitle: string;
  activeApplyAllTargets: string;
  activeAskAboutForm: string;
  activeCloseMenu: string;
  activeCoachNotesDefault: string;
  activeCoachNotesHighEffort: string;
  activeDiscardWorkout: string;
  activeEmptySubtitle: string;
  activeEmptySubtitleNoSw: string;
  activeExerciseMore: string;
  activeEyebrow: string;
  activeGoBuilder: string;
  activeGoToday: string;
  activeLastNoteLine: string;
  activeLoadingSession: string;
  activeLoadingSessionDesc: string;
  activeNextTargetLine: string;
  activeNote: string;
  activeNotePlaceholder: string;
  activeRemoveExercise: string;
  activeRemoveExerciseLogged: string;
  activeRemoveSet: string;
  activeRestDefault: string;
  activeSessionMore: string;
  activeSessionTimer: string;
  activeSetLess: string;
  activeSetOptions: string;
  activeSwap: string;
  activeTitle: string;
  activeAddExerciseInline: string;
  activeAddSelectedExercise: string;
  sessionReadinessDelta: string;
  sessionReduceVolume: string;
  sessionVolumeNoPlan: string;
  sessionVolumeNoPlanDesc: string;
  sessionVolumeReduced: string;
  sessionVolumeReducedDesc: string;
  /** Kaizen Loop 3 M1 — set table + jot (.301) */
  activeAddExerciseEyebrow: string;
  activeColSet: string;
  activeColPrev: string;
  activeColReps: string;
  activeColAction: string;
  activePrBadge: string;
  activeSetInConsole: string;
  activeSetPlanned: string;
  activePrTip: string;
  sessionJotLabel: string;
  sessionJotPlaceholder: string;
  sessionJotPrivacy: string;
  /** Kaizen Loop 6 P3 — GuidedStepPlayer (.315) */
  guidedSessionComplete: string;
  guidedSessionNextHint: string;
  guidedSessionRepeat: string;
  guidedSessionBack: string;
  guidedSessionStepOf: string;
  guidedSessionProgress: string;
  guidedSessionStart: string;
  guidedSessionPause: string;
  guidedSessionResume: string;
  guidedSessionSkip: string;
  guidedSessionReset: string;
  liveHrConnectFailed: string;
  liveHrBpm: string;
  liveHrIdle: string;
  liveHrUnsupported: string;
  liveHrHint: string;
  liveHrDisconnect: string;
  liveHrConnect: string;
  /**
   * Kaizen set-row + rest a11y (`.549`–`.555`). These are screen-reader labels,
   * which is exactly why an untranslated `defaultValue` is worse here than on
   * visible copy: a sighted user sees the surrounding UI in their language and
   * the label is silent, so nothing looks wrong while the announcement is English.
   */
  activeSetLoggedSr: string;
  activeSetRowCompleteAria: string;
  activeSetRowNextAria: string;
  activeSetRowPlannedAria: string;
  victoryMascotCue: string;
  victorySessionDetails: string;
  /** Split from a `finalSeconds` ternary default — see moveLocales. */
  activeRestSkipAriaFinal: string;
  activeRestSkipAriaPlain: string;
};

const en: ActiveWorkoutStrings = {
  activeLiveSession: 'Live session',
  activeCoachSessionEyebrow: 'Mission Coach session',
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
  activeSwapEyebrow: 'This exercise',
  activeSwapTitle: 'Swap exercise',
  activeSwapPlaceholder: 'Swap to… (same muscles first)',
  activeChooseExercise: 'Choose exercise...',
  activeEmptyExercises: 'Add exercises above to begin logging sets.',
  activeFormGuide: 'Form guide',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Add Set',
  activeStartRest: '{{seconds}}s Rest',
  activeLogSet: 'Log set',
  activeRepeatLast: 'Repeat last set',
  activeLastPerformance: 'Last: {{reps}} × {{weight}}',
  activeSetLogged: 'Set logged',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — {{rest}}s rest',
  activeWorkoutComplete: 'Workout complete!',
  activeNothingLogged: 'Log a set first',
  activeNothingLoggedDesc: 'Finish unlocks after at least one completed set.',
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
  activeSetBodyweightAddLoad: 'Bodyweight — tap to add load',
  activeOverloadLastLabel: 'Last',
  activeOverloadNextLabel: 'Next',
  activeOverloadAddReps: 'Add a rep',
  activeOverloadAddWeight: 'Add weight',
  activeOverloadHold: 'Hold',
  activeOverloadFromLast: 'From last time',
  activeOverloadPrescribed: 'Coach plan',
  activeUseNextTarget: 'Use next target',
  activeSetKindMore: 'Kind',
  activeSetOf: 'Set {{current}} of {{total}}',
  activeDecreaseReps: 'Decrease reps',
  activeIncreaseReps: 'Increase reps',
  activeDecreaseWeight: 'Decrease weight',
  activeIncreaseWeight: 'Increase weight',
  victoryProgressAddWeight: 'Next: +{{step}} {{unit}} on {{name}} (hit top of range)',
  victoryProgressAddReps: 'Next: {{reps}} × {{weight}} {{unit}} on {{name}}',
  victoryProgressHold: 'Next: hold {{reps}} × {{weight}} {{unit}} on {{name}}',
  victoryProgressAddRepsBw: 'Next: {{reps}} reps on {{name}}',
  victoryProgressHoldBw: 'Next: hold {{reps}} on {{name}}',
  victoryShareText:
    'Session done: {{name}} — {{volume}} {{unit}}, {{sets}} sets.',
  victoryTitle: 'Session locked',
  victoryScoutCue: 'Session saved.',
  victoryVolume: 'Volume',
  victorySets: 'Sets',
  victoryFeelSaved: 'Saved for readiness.',
  victoryFeelPrompt: 'How do you feel after this session?',
  victoryFeelLow: 'Drained',
  victoryFeelHigh: 'Energized',
  victoryBodyDeltaLabel: 'What changed',
  victoryReadinessDelta: 'Readiness {{delta}}',
  victoryStrainDelta: 'Strain {{delta}}',
  victoryRecoveryDelta: 'Recovery {{delta}}',
  victoryStreak: '{{count}}-day streak',
  victoryNextLabel: 'Next',
  victoryBackToday: 'Back to Today',
  victoryViewHistory: 'History',
  victoryShare: 'Share',
  victoryShareCard: 'Share card',
  victoryShareFailed:
    'Couldn’t share from this browser. Tap Share again, or copy from History later.',
  sessionCheckInEyebrow: 'Before you train',
  sessionCheckInTitle: 'How do you feel?',
  sessionCheckInSave: 'Save & continue',
  sessionCheckInSkip: 'Not now',
  sessionCheckInLead:
    'Three quick ratings. We adjust readiness — we never cut your sets without asking.',
  sessionCheckInSoreness: 'Soreness',
  sessionCheckInFresh: 'Fresh',
  sessionCheckInBeaten: 'Beaten up',
  sessionCheckInSleep: 'Sleep last night',
  sessionCheckInPoor: 'Poor',
  sessionCheckInGreat: 'Great',
  sessionCheckInMotivation: 'Motivation',
  sessionCheckInLow: 'Low',
  sessionCheckInFired: 'Fired up',
  activeAddExerciseTitle: 'Add exercise',
  activeApplyAllTargets: 'Apply targets',
  activeAskAboutForm: 'Ask about form',
  activeCloseMenu: 'Close menu',
  activeCoachNotesDefault: 'Rate Easy / Med / Hard after each set so Coach can learn.',
  activeCoachNotesHighEffort: 'Hard sets stacking up — leave a little in the tank if form slips.',
  activeDiscardWorkout: 'Discard workout',
  activeEmptySubtitle: 'Log sets with rest timers, PRs, and form cues — offline ready.',
  activeEmptySubtitleNoSw:
    'Log sets with rest timers, PRs, and form cues. Lose signal mid-session and logging keeps going.',
  activeExerciseMore: 'More actions',
  activeEyebrow: 'Train',
  activeGoBuilder: 'Builder',
  activeGoToday: 'Today',
  activeLastNoteLine: 'Last note ({{date}}):',
  activeLoadingSession: 'Restoring session…',
  activeLoadingSessionDesc: 'Reading the last workout saved on this device.',
  activeNextTargetLine: 'Next: {{reps}} × {{weight}} {{unit}}',
  activeNote: 'Note',
  activeNotePlaceholder: 'Note — "machine 3, seat 4", "left knee tight"…',
  activeRemoveExercise: 'Remove exercise',
  activeRemoveExerciseLogged: 'Remove exercise — discards logged sets',
  activeRemoveSet: 'Remove set',
  activeRestDefault: 'Default',
  activeSessionMore: 'More session actions',
  activeSessionTimer: 'Session timer',
  activeSetLess: 'Less',
  activeSetOptions: 'Set options',
  activeSwap: 'Swap',
  activeTitle: 'Active workout',
  activeAddExerciseInline: 'Add exercise — search 300+ movements',
  activeAddSelectedExercise: 'Add selected exercise',
  sessionReadinessDelta: 'Readiness {{from}} → {{to}}',
  sessionReduceVolume: "Reduce today's volume",
  sessionVolumeNoPlan: 'No coach session today',
  sessionVolumeNoPlanDesc: 'Start from Mission Coach for plan volume cuts. Sets here stay yours.',
  sessionVolumeReduced: 'Volume reduced',
  sessionVolumeReducedDesc: 'One set trimmed from accessories (min 2). Plan marked Adapted.',
  activeAddExerciseEyebrow: 'This session',
  activeColSet: 'Set',
  activeColPrev: 'Prev',
  activeColReps: 'Reps',
  activeColAction: 'Action',
  activePrBadge: 'PR',
  activeSetInConsole: 'In the console',
  activeSetPlanned: '{{reps}} planned',
  activePrTip: 'Personal record for this exercise',
  sessionJotLabel: 'Field note',
  sessionJotPlaceholder: 'Five words is enough — "knee twinge set 3". Opens your journal entry.',
  sessionJotPrivacy: 'Stays on this device.',
  guidedSessionComplete: 'Session complete',
  guidedSessionNextHint: 'Next: log protein on Fuel, read a Learn chapter, or return to Today.',
  guidedSessionRepeat: 'Repeat',
  guidedSessionBack: 'Back',
  guidedSessionStepOf: 'Step {{current}}/{{total}}',
  guidedSessionProgress: 'Progress',
  guidedSessionStart: 'Start session',
  guidedSessionPause: 'Pause',
  guidedSessionResume: 'Resume',
  guidedSessionSkip: 'Skip step',
  guidedSessionReset: 'Reset',
  liveHrConnectFailed: 'Could not connect heart rate monitor.',
  liveHrBpm: '{{bpm}} BPM',
  liveHrIdle: 'Heart rate',
  liveHrUnsupported: 'Bluetooth HR needs Chrome or another browser with Web Bluetooth.',
  liveHrHint: 'Optional Polar / Wahoo chest strap — not used in Win Score.',
  liveHrDisconnect: 'Disconnect',
  liveHrConnect: 'Connect HR',
  activeSetLoggedSr: 'Logged',
  activeSetRowCompleteAria: 'Set {{n}} logged: {{line}}',
  activeSetRowNextAria: 'Set {{n}} — in the console',
  activeSetRowPlannedAria: 'Set {{n}} planned — {{reps}} reps',
  victoryMascotCue: 'Session saved.',
  victorySessionDetails: 'Session details',
  activeRestSkipAriaFinal: 'Skip rest — go',
  activeRestSkipAriaPlain: 'Skip rest',
};

const es: ActiveWorkoutStrings = {
  ...en,
  activeLiveSession: 'Sesión en vivo',
  activeCoachSessionEyebrow: 'Sesión Mission Coach',
  activeOverloadLastLabel: 'Última',
  activeOverloadNextLabel: 'Siguiente',
  activeOverloadAddReps: 'Suma una rep',
  activeOverloadAddWeight: 'Sube el peso',
  activeOverloadHold: 'Mantén',
  activeOverloadFromLast: 'De la última vez',
  activeOverloadPrescribed: 'Plan del coach',
  activeUseNextTarget: 'Usar el siguiente objetivo',
  activeSetKindMore: 'Tipo',
  victoryProgressAddWeight: 'Siguiente: +{{step}} {{unit}} en {{name}} (tope del rango)',
  victoryProgressAddReps: 'Siguiente: {{reps}} × {{weight}} {{unit}} en {{name}}',
  victoryProgressHold: 'Siguiente: mantén {{reps}} × {{weight}} {{unit}} en {{name}}',
  victoryProgressAddRepsBw: 'Siguiente: {{reps}} reps en {{name}}',
  victoryProgressHoldBw: 'Siguiente: mantén {{reps}} en {{name}}',
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
  activeSwapEyebrow: 'Este ejercicio',
  activeSwapTitle: 'Cambiar ejercicio',
  activeSwapPlaceholder: 'Cambiar a… (mismos músculos primero)',
  activeChooseExercise: 'Elegir ejercicio…',
  activeEmptyExercises: 'Añade ejercicios arriba para registrar series.',
  activeFormGuide: 'Guía de forma',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Añadir serie',
  activeStartRest: 'Descanso {{seconds}}s',
  activeLogSet: 'Registrar serie',
  activeRepeatLast: 'Repetir última serie',
  activeLastPerformance: 'Última: {{reps}} × {{weight}}',
  activeSetLogged: 'Serie registrada',
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
  activeCoachSessionEyebrow: 'Séance Mission Coach',
  activeOverloadLastLabel: 'Dernière',
  activeOverloadNextLabel: 'Prochaine',
  activeOverloadAddReps: 'Ajoute une rep',
  activeOverloadAddWeight: 'Augmente la charge',
  activeOverloadHold: 'Maintiens',
  activeOverloadFromLast: 'De la dernière fois',
  activeOverloadPrescribed: 'Plan coach',
  activeUseNextTarget: 'Utiliser la cible suivante',
  activeSetKindMore: 'Type',
  victoryProgressAddWeight: 'Suite : +{{step}} {{unit}} sur {{name}} (haut de fourchette)',
  victoryProgressAddReps: 'Suite : {{reps}} × {{weight}} {{unit}} sur {{name}}',
  victoryProgressHold: 'Suite : maintiens {{reps}} × {{weight}} {{unit}} sur {{name}}',
  victoryProgressAddRepsBw: 'Suite : {{reps}} reps sur {{name}}',
  victoryProgressHoldBw: 'Suite : maintiens {{reps}} sur {{name}}',
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
  activeSwapEyebrow: 'Cet exercice',
  activeSwapTitle: 'Remplacer l’exercice',
  activeSwapPlaceholder: 'Remplacer par… (mêmes muscles d’abord)',
  activeChooseExercise: 'Choisir un exercice…',
  activeEmptyExercises: 'Ajoutez des exercices ci-dessus pour enregistrer des séries.',
  activeFormGuide: 'Guide de forme',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Ajouter une série',
  activeStartRest: 'Repos {{seconds}} s',
  activeLogSet: 'Enregistrer la série',
  activeRepeatLast: 'Répéter la dernière série',
  activeLastPerformance: 'Dernière : {{reps}} × {{weight}}',
  activeSetLogged: 'Série enregistrée',
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
  activeCoachSessionEyebrow: 'Mission Coach 训练',
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
  activeCoachSessionEyebrow: 'Sesi Mission Coach',
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
  activeCoachSessionEyebrow: 'เซสชัน Mission Coach',
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
  activeCoachSessionEyebrow: 'جلسة Mission Coach',
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
  activeCoachSessionEyebrow: 'Mission-Coach-Einheit',
  activeOverloadLastLabel: 'Zuletzt',
  activeOverloadNextLabel: 'Als Nächstes',
  activeOverloadAddReps: 'Eine Wiederholung mehr',
  activeOverloadAddWeight: 'Gewicht erhöhen',
  activeOverloadHold: 'Halten',
  activeOverloadFromLast: 'Vom letzten Mal',
  activeOverloadPrescribed: 'Coach-Plan',
  activeSetKindMore: 'Art',
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
  activeSwapEyebrow: 'Diese Übung',
  activeSwapTitle: 'Übung tauschen',
  activeSwapPlaceholder: 'Tauschen zu… (gleiche Muskeln zuerst)',
  activeChooseExercise: 'Übung wählen…',
  activeEmptyExercises: 'Füge oben Übungen hinzu, um Sätze zu protokollieren.',
  activeFormGuide: 'Form-Guide',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Satz hinzufügen',
  activeStartRest: 'Pause {{seconds}} s',
  activeLogSet: 'Satz speichern',
  activeRepeatLast: 'Letzten Satz wiederholen',
  activeLastPerformance: 'Zuletzt: {{reps}} × {{weight}}',
  activeSetLogged: 'Satz gespeichert',
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
    activeCoachSessionEyebrow: 'Sessão Mission Coach',
    activeElapsed: 'Decorrido',
    activeSetsLabel: 'Séries',
    activeRestAdd15: '+15 s',
    activeRestSub15: '−15 s',
    activeSwapEyebrow: 'Este exercício',
    activeSwapTitle: 'Trocar exercício',
    activeSwapPlaceholder: 'Trocar por… (mesmos músculos primeiro)',
    activeOverloadLastLabel: 'Última',
    activeOverloadNextLabel: 'Próxima',
    activeOverloadAddReps: 'Mais uma rep',
    activeOverloadAddWeight: 'Aumentar carga',
    activeOverloadHold: 'Manter',
    activeOverloadFromLast: 'Da última vez',
    activeOverloadPrescribed: 'Plano do coach',
    activeUseNextTarget: 'Usar próximo alvo',
    victoryProgressAddWeight: 'Próximo: +{{step}} {{unit}} em {{name}} (topo da faixa)',
    victoryProgressAddReps: 'Próximo: {{reps}} × {{weight}} {{unit}} em {{name}}',
    victoryProgressHold: 'Próximo: mantenha {{reps}} × {{weight}} {{unit}} em {{name}}',
    victoryProgressAddRepsBw: 'Próximo: {{reps}} reps em {{name}}',
    victoryProgressHoldBw: 'Próximo: mantenha {{reps}} em {{name}}',
  },
  it: {
    ...en,
    activeNoWorkout: 'Nessun allenamento attivo',
    activeFinish: 'Fine',
    activeLiveSession: 'Sessione dal vivo',
    activeCoachSessionEyebrow: 'Sessione Mission Coach',
    activeElapsed: 'Trascorso',
    activeSetsLabel: 'Serie',
    activeOverloadLastLabel: 'Ultima',
    activeOverloadNextLabel: 'Prossima',
    activeOverloadAddReps: 'Aggiungi una rep',
    activeOverloadAddWeight: 'Aumenta il carico',
    activeOverloadHold: 'Mantieni',
    activeOverloadFromLast: "Dall'ultima volta",
    activeOverloadPrescribed: 'Piano coach',
  },
  ko: {
    ...en,
    activeNoWorkout: '진행 중인 운동 없음',
    activeFinish: '완료',
    activeLiveSession: '진행 중인 세션',
    activeCoachSessionEyebrow: 'Mission Coach 세션',
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
