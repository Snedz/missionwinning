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
  /** Optional EMOM / AMRAP on the live set row (`.987`). */
  activeWorkClockEmom: string;
  activeWorkClockAmrap: string;
  activeWorkClockStop: string;
  activeWorkClockStartAria: string;
  activeWorkClockEmomAria: string;
  activeWorkClockAmrapAria: string;
  activeWorkClockStopAria: string;
  activeWorkClockRunningAria: string;
  activeRestAdd15: string;
  activeRestSub15: string;
  activeAddExercise: string;
  /** Mid-session swap sheet (AdaptiveOverlay) — `.269` / garage list `.721` */
  activeSwapEyebrow: string;
  activeSwapTitle: string;
  activeSwapPlaceholder: string;
  activeSwapGarageLead: string;
  /** Skip / swap this exercise once, this session (`.959`). */
  activeSkipThisExerciseHold: string;
  activeSkippedThisSession: string;
  activeSwapThisSessionEyebrow: string;
  activeSwapThisSessionTitle: string;
  activeSwapAnotherMovement: string;
  activeSwapConfirm: string;
  activeChooseExercise: string;
  activeEmptyExercises: string;
  activeFormGuide: string;
  /** Prior sessions of the open lift (`.993`). */
  activeMovementHistoryEyebrow: string;
  activeMovementHistoryEmpty: string;
  activeMovementHistoryClose: string;
  /** Drag the live list (`.998`). */
  activeReorderHandleAria: string;
  activeReorderMoveUp: string;
  activeReorderMoveDown: string;
  activeMovementHistoryOpenAria: string;
  /** Short written cues on the open live exercise (`.973`). */
  activeInSetCues: string;
  activeInSetCuesHide: string;
  activeInSetCuesDemoAlt: string;
  /** Quiet Learn door when the rack card is not enough (`.978`). */
  activeInSetCuesMore: string;
  activeLoadPctChip: string;
  activeAddSet: string;
  activeStartRest: string;
  /** Per-exercise rest lanes on the open lift (`.995`). */
  activeExerciseRestWork: string;
  activeExerciseRestWarmup: string;
  activeExerciseRestSetAria: string;
  activeLogSet: string;
  activeRepeatLast: string;
  /** Empty-state Start when a last completed session exists (.717). Not last set. */
  activeRepeatLastSession: string;
  activeRepeatLastSessionDesc: string;
  /** Empty-state Start when a saved routine owns the tap (`.960`). */
  activeSavedRoutineStart: string;
  activeSavedRoutineDesc: string;
  /** Empty-state Start for the I-Day equipment preview (`.768`). Not Just Go inside resolveActiveEmptyStart. */
  activeStartPreviewSession: string;
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
  /** Optional % of known 1RM on the live set row (`.981`). */
  activeSetPct: string;
  activeSetPctAria: string;
  /** Optional 1–10 RPE on a completed set (`.967`). */
  activeRpe10: string;
  activeRpe10Tip: string;
  activeRpe10Value: string;
  /** Optional reps in reserve on a completed set (`.725`). */
  activeRir: string;
  activeRirTip: string;
  activeRirValue: string;
  /** Optional ecc/pause/con on a completed set (`.734`). */
  activeTempo: string;
  activeTempoTip: string;
  activeTempoPlaceholder: string;
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
  /** Live set-row per-side stack (`25 + 15 / side`). */
  activePlatePerSideLine: string;
  /** Live set-row both-sides breakdown (`45 + 2×45`). */
  activePlateBarLine: string;
  activePlateSkip: string;
  activePlateBreakdownAria: string;
  activeAddWarmups: string;
  activeToggleWarmupAria: string;
  activeToggleWorkAria: string;
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
  activeSetAddedLoad: string;
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
  /** Pre-start hard-session warning (.727) — not a logger gate. */
  hardSessionEyebrow: string;
  hardSessionTitle: string;
  hardSessionLead: string;
  hardSessionStop: string;
  /** Pregnancy-flag variant of the stop line (.746 v1). */
  hardSessionStopPregnancy: string;
  hardSessionNotCare: string;
  hardSessionEmergency: string;
  hardSessionClinician: string;
  hardSessionContinue: string;
  hardSessionBack: string;
  /** Kaizen Loop 2 L4 — Active chrome + session volume (.299) */
  activeAddExerciseTitle: string;
  activeApplyAllTargets: string;
  activeAskAboutForm: string;
  activeCloseMenu: string;
  activeCoachNotesDefault: string;
  activeCoachNotesHighEffort: string;
  activeDiscardWorkout: string;
  /** `.958` — confirm before replacing this device's logged session. */
  openSessionTakeOther: string;
  activeEmptySubtitle: string;
  activeEmptySubtitleNoSw: string;
  /** Mid-session optional sign-in — device-first (F-001). */
  activeSignInTitle: string;
  activeSignInDesc: string;
  activeExerciseMore: string;
  activeEyebrow: string;
  activeGoBuilder: string;
  activeGoToday: string;
  activeLastNoteLine: string;
  activeLoadingSession: string;
  activeLoadingSessionDesc: string;
  /** Empty-state dock when re-entry dose is < 1 (.743 coverage). */
  activeReentryStart: string;
  activeReentryStartDesc: string;
  activeNextTargetLine: string;
  /** Educational Epley e1RM on the exercise row after a saved working set (`.761`). */
  activeE1rmLine: string;
  activeE1rmHide: string;
  activeE1rmShow: string;
  activeE1rmAria: string;
  activeNote: string;
  activeNotePlaceholder: string;
  /** Pinned reminder on the open lift — returns next session (`.996`). */
  activePinnedNote: string;
  activePinnedNotePlaceholder: string;
  activeRemoveExercise: string;
  activeRemoveExerciseLogged: string;
  activeRemoveSet: string;
  activeRestDefault: string;
  activeSessionMore: string;
  activeSessionTimer: string;
  /** Pause the live SESSION elapsed clock (`.1001`). Not Today Resume. */
  activeSessionClockPauseAria: string;
  activeSessionClockResumeAria: string;
  activeSessionClockPaused: string;
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
  activeColTime: string;
  activeColAssist: string;
  activeSetTime: string;
  activeSetAssist: string;
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
  /** Unilateral L/R/Alt on the set being entered (.724). */
  activeSetSideL: string;
  activeSetSideR: string;
  activeSetSideAlt: string;
  activeSetSideAria: string;
  activeSetRowCompleteAria: string;
  activeSetRowNextAria: string;
  activeSetRowPlannedAria: string;
  /** After-save vs-last on the set row (.741). */
  activeVsLastSame: string;
  activeVsLastRep: string;
  activeVsLastReps: string;
  activeVsLastAria: string;
  /** Quiet diary PR on the live set (`.999`). */
  activeInSetPrHeaviest: string;
  activeInSetPrMostReps: string;
  activeInSetPrBestLogged5: string;
  activeInSetPrAria: string;
  /** After-complete next-set cite (.939). */
  activeNextCiteRest: string;
  activeNextCiteFromSession: string;
  activeNextCiteLastRest: string;
  activeNextCiteSkip: string;
  activeNextCiteAria: string;
  activeTargetCiteCoach: string;
  activeTargetCiteSet: string;
  activeTargetCiteSets: string;
  activeTargetCiteFromLast: string;
  activeWeekdayMon: string;
  activeWeekdayTue: string;
  activeWeekdayWed: string;
  activeWeekdayThu: string;
  activeWeekdayFri: string;
  activeWeekdaySat: string;
  activeWeekdaySun: string;
  victoryMascotCue: string;
  victorySessionDetails: string;
  /** Split from a `finalSeconds` ternary default — see moveLocales. */
  activeRestSkipAriaFinal: string;
  activeRestSkipAriaPlain: string;
  activeCueMe: string;
  activeCueMeOn: string;
  activeCueMeAria: string;
  activeCueMeOnAria: string;
  activeSetDropTip: string;
  victoryDeltaWeight: string;
  victoryDeltaReps: string;
  victoryReceiptLabel: string;
  victoryPrsOne: string;
  victoryPrsMany: string;
  victoryPrBadge: string;
  victoryReceiptSetsCaption: string;
  victoryReceiptLoad: string;
  victorySaveReceipt: string;
  victoryVsLast: string;
  victorySecondaryMoveBecause: string;
  victoryDuration: string;
};

const en: ActiveWorkoutStrings = {
  activeLiveSession: 'Live session',
  activeCoachSessionEyebrow: 'Mission Coach session',
  activeElapsed: 'Elapsed',
  activeSetsLabel: 'Sets',
  activeNoWorkout: 'No session running',
  activeNoWorkoutDesc:
    'Start here, or open Today for the session already planned for you. Sets and rest save on this device.',
  activeStartWorkout: 'Start Workout',
  activeSetsCompleted: '{{done}}/{{total}} sets completed',
  activeCancel: 'Cancel',
  activeFinish: 'Finish',
  activeCoachNotes: 'Coach Notes',
  activeCoachProgression: 'Progression',
  activeRestTitle: 'Rest',
  activeRestSubtitle: 'Recover — next set when ready',
  activeRestSkip: 'Skip',
  activeWorkClockEmom: 'EMOM',
  activeWorkClockAmrap: 'AMRAP',
  activeWorkClockStop: 'Stop',
  activeWorkClockStartAria: 'Optional interval or countdown',
  activeWorkClockEmomAria: 'Start EMOM minute',
  activeWorkClockAmrapAria: 'Start AMRAP window',
  activeWorkClockStopAria: 'Stop clock',
  activeWorkClockRunningAria: '{{kind}} {{clock}}',
  activeRestAdd15: '+15s',
  activeRestSub15: '−15s',
  activeAddExercise: 'Add Exercise',
  activeSwapEyebrow: 'No machine',
  activeSwapTitle: 'Swap',
  activeSwapPlaceholder: 'Swap to… (same muscles first)',
  activeSwapGarageLead: 'Same pattern. Floor, chair, or a bar you already have.',
  activeSkipThisExerciseHold: 'Skip this exercise — this session',
  activeSkippedThisSession: 'Skipped this session',
  activeSwapThisSessionEyebrow: 'This session',
  activeSwapThisSessionTitle: 'Swap this exercise',
  activeSwapAnotherMovement: 'Another movement',
  activeSwapConfirm: 'Swap this session',
  activeChooseExercise: 'Choose exercise...',
  activeEmptyExercises: 'Add an exercise to begin logging sets.',
  activeFormGuide: 'Form guide',
  activeMovementHistoryEyebrow: 'History',
  activeMovementHistoryEmpty: 'No prior sessions yet — log this one',
  activeMovementHistoryClose: 'Close',
  activeMovementHistoryOpenAria: 'Prior sessions of {{name}}',
  activeReorderHandleAria: 'Drag to reorder {{name}}',
  activeReorderMoveUp: 'Move {{name}} up',
  activeReorderMoveDown: 'Move {{name}} down',
  activeInSetCues: 'Cues',
  activeInSetCuesHide: 'Hide cues',
  activeInSetCuesDemoAlt: '{{name}} setup',
  activeInSetCuesMore: 'More than a rack card',
  activeLoadPctChip: '{{pct}}% · {{weight}} {{unit}}',
  activeAddSet: 'Add Set',
  activeStartRest: '{{seconds}}s Rest',
  activeExerciseRestWork: 'Work rest',
  activeExerciseRestWarmup: 'Warmup rest',
  activeExerciseRestSetAria: 'Set {{lane}} to {{clock}}',
  activeLogSet: 'Log set',
  activeRepeatLast: 'Repeat last set',
  activeRepeatLastSession: 'Repeat last session',
  activeRepeatLastSessionDesc: 'Same exercises and last loads. Log when ready.',
  activeSavedRoutineStart: 'Start {{name}}',
  activeSavedRoutineDesc: 'Your saved routine — last loads stay on the set row.',
  activeStartPreviewSession: 'Start {{name}} — {{count}} exercises',
  activeLastPerformance: 'Last: {{reps}} × {{weight}}',
  activeSetLogged: 'Set logged',
  activeSetLoggedDesc: '{{reps}} × {{weight}} — {{rest}}s rest',
  activeWorkoutComplete: 'Workout complete!',
  activeNothingLogged: 'Log a set first',
  activeNothingLoggedDesc: 'Finish unlocks after at least one completed set.',
  activeReps: 'Reps',
  activeWeight: 'lbs',
  activeSetPct: '%',
  activeSetPctAria: 'Percent of known one-rep max. Optional.',
  activeRpeEasy: 'Easy',
  activeRpeMed: 'Med',
  activeRpeHard: 'Hard',
  activeRpe10: 'RPE',
  activeRpe10Tip: 'Rate of perceived exertion 1–10. Optional.',
  activeRpe10Value: 'RPE {{n}}',
  activeRir: 'RIR',
  activeRirTip: 'Reps in reserve — how many more you could have done. Optional.',
  activeRirValue: 'RIR {{n}}',
  activeTempo: 'Tempo',
  activeTempoTip: 'Eccentric-pause-concentric seconds, e.g. 3-1-1. Optional.',
  activeTempoPlaceholder: '3-1-1',
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
  activePlatePerSideLine: '{{plates}} / side',
  activePlateBarLine: '{{bar}} + {{plates}}',
  activePlateSkip: 'Skip',
  activePlateBreakdownAria: 'Plates on the bar: {{line}}',
  activeAddWarmups: 'Add warmups',
  activeToggleWarmupAria: 'Mark as warmup',
  activeToggleWorkAria: 'Mark as work set',
  activeSetNormal: 'Work',
  activeSetWarmup: 'Warmup',
  activeSetFailure: 'Failure',
  activeSetDrop: 'Drop',
  activeSupersetLink: 'Superset w/ next',
  activeSupersetUnlink: 'Unlink superset',
  activeSetLoggedSuperset: '{{reps}} × {{weight}} — next exercise in superset',
  activeSetBodyweight: 'BW',
  activeSetBodyweightAddLoad: 'Bodyweight — tap to add load',
  activeSetAddedLoad: 'Load',
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
  hardSessionEyebrow: 'Before a hard session',
  hardSessionTitle: 'Stopping is allowed',
  hardSessionLead:
    'A max-effort or timed test can be dangerous. This is not the default way to train.',
  hardSessionStop:
    'Stop if you have chest pain, feel faint, have severe shortness of breath, or cannot talk.',
  hardSessionStopPregnancy:
    'Stop if you have bleeding, cramping, chest pain, feel faint or dizzy, have severe shortness of breath, or cannot talk.',
  hardSessionNotCare: 'This app is not medical care and cannot prevent a medical emergency.',
  hardSessionEmergency: 'If this is an emergency, call local emergency services — not this app.',
  hardSessionClinician:
    'Talk with a clinician before max-effort tests if you have a heart, breathing, or other health condition, or if you are unsure.',
  hardSessionContinue: 'I understand — start',
  hardSessionBack: 'Back',
  activeAddExerciseTitle: 'Add exercise',
  activeApplyAllTargets: 'Apply targets',
  activeAskAboutForm: 'Ask about form',
  activeCloseMenu: 'Close menu',
  activeCoachNotesDefault: 'Rate Easy / Med / Hard after each set so Coach can learn.',
  activeCoachNotesHighEffort: 'Hard sets stacking up — leave a little in the tank if form slips.',
  activeDiscardWorkout: 'Discard workout',
  openSessionTakeOther: 'Continue the other session',
  activeEmptySubtitle: 'Log sets with rest timers, PRs, and form cues — offline ready.',
  activeEmptySubtitleNoSw:
    'Log sets with rest timers, PRs, and form cues. Lose signal mid-session and logging keeps going.',
  activeSignInTitle: 'Sets save on this device',
  activeSignInDesc:
    'Logging and rest work offline. Sign in only if you want the same log on another device.',
  activeExerciseMore: 'More actions',
  activeEyebrow: 'Train',
  activeGoBuilder: 'Builder',
  activeGoToday: 'Today',
  activeLastNoteLine: 'Last note ({{date}}):',
  activeLoadingSession: 'Restoring session…',
  activeLoadingSessionDesc: 'Reading the last workout saved on this device.',
  activeReentryStart: 'Start easier session',
  activeReentryStartDesc:
    'Smaller first session back — finishable, then the week rebuilds.',
  activeNextTargetLine: 'Next: {{reps}} × {{weight}} {{unit}}',
  activeE1rmLine: 'est. 1RM ~{{e1rm}} {{unit}} (Epley) — formula estimate, not a tested max',
  activeE1rmHide: 'Hide estimate',
  activeE1rmShow: 'Show e1RM estimate',
  activeE1rmAria: 'Estimated one-rep max from the Epley formula, not a tested max',
  activeNote: 'Note',
  activeNotePlaceholder: 'Note — "left shoulder felt off"…',
  activePinnedNote: 'Pin',
  activePinnedNotePlaceholder: 'Pin — "45 degree incline"…',
  activeRemoveExercise: 'Remove exercise',
  activeRemoveExerciseLogged: 'Remove exercise — discards logged sets',
  activeRemoveSet: 'Remove set',
  activeRestDefault: 'Default',
  activeSessionMore: 'More session actions',
  activeSessionTimer: 'Session timer',
  activeSessionClockPauseAria: 'Pause session clock',
  activeSessionClockResumeAria: 'Resume session clock',
  activeSessionClockPaused: 'Paused',
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
  activeColTime: 'Time',
  activeColAssist: 'Assist',
  activeSetTime: 'Time',
  activeSetAssist: 'Assist',
  activeColAction: 'Action',
  activePrBadge: 'PR',
  activeSetInConsole: 'In the console',
  activeSetPlanned: '{{reps}} planned',
  activePrTip: 'Personal record for this exercise',
  sessionJotLabel: 'Notes',
  sessionJotPlaceholder: 'Add notes if you have more to record.',
  sessionJotPrivacy: 'Stays with this session on this device.',
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
  liveHrHint: 'Optional Polar / Wahoo chest strap — not used in Mission Score.',
  liveHrDisconnect: 'Disconnect',
  liveHrConnect: 'Connect HR',
  activeSetLoggedSr: 'Logged',
  activeSetSideL: 'L',
  activeSetSideR: 'R',
  activeSetSideAlt: 'Alt',
  activeSetSideAria: 'Set side',
  activeSetRowCompleteAria: 'Set {{n}} logged: {{line}}',
  activeSetRowNextAria: 'Set {{n}} — in the console',
  activeSetRowPlannedAria: 'Set {{n}} planned — {{reps}} reps',
  activeVsLastSame: 'same',
  activeVsLastRep: 'rep',
  activeVsLastReps: 'reps',
  activeVsLastAria: 'versus last {{delta}}',
  activeInSetPrHeaviest: 'Heaviest',
  activeInSetPrMostReps: 'Most reps',
  activeInSetPrBestLogged5: 'Best logged 5',
  activeInSetPrAria: 'Personal record: {{kinds}}',
  activeNextCiteRest: 'Rest {{clock}}',
  activeNextCiteFromSession: 'From this session · {{sets}}',
  activeNextCiteLastRest: 'Last rest',
  activeNextCiteSkip: 'Skip',
  activeNextCiteAria: 'Next from your logs: {{line}}',
  activeTargetCiteCoach: 'Coach plan',
  activeTargetCiteSet: 'set {{n}}',
  activeTargetCiteSets: 'sets {{from}}–{{to}}',
  activeTargetCiteFromLast: 'From last {{day}} · {{sets}}',
  activeWeekdayMon: 'Mon',
  activeWeekdayTue: 'Tue',
  activeWeekdayWed: 'Wed',
  activeWeekdayThu: 'Thu',
  activeWeekdayFri: 'Fri',
  activeWeekdaySat: 'Sat',
  activeWeekdaySun: 'Sun',
  victoryMascotCue: 'Session saved.',
  victorySessionDetails: 'Session details',
  activeRestSkipAriaFinal: 'Skip rest — go',
  activeRestSkipAriaPlain: 'Skip rest',
  activeCueMe: 'Cue me',
  activeCueMeOn: 'Cues on',
  activeCueMeAria: 'Speak next-set directions',
  activeCueMeOnAria: 'Stop spoken set directions',
  activeSetDropTip: 'Drop set — lighter follow-up; not a PR attempt',
  victoryDeltaWeight: '{{signed}} {{unit}}',
  victoryDeltaReps: '{{signed}} reps',
  victoryReceiptLabel: 'This session',
  victoryPrsOne: '1 PR',
  victoryPrsMany: '{{count}} PRs',
  victoryPrBadge: 'PR',
  victoryReceiptSetsCaption: '{{name}} sets',
  victoryReceiptLoad: 'Load',
  victorySaveReceipt: 'Save receipt',
  victoryVsLast: 'vs last',
  victorySecondaryMoveBecause: '{{flow}} — because you trained {{muscle}}',
  victoryDuration: 'Duration',
};

const es: ActiveWorkoutStrings = {
  ...en,
  activeExerciseRestWork: 'Descanso de trabajo',
  activeExerciseRestWarmup: 'Descanso de calentamiento',
  activeExerciseRestSetAria: 'Fijar {{lane}} en {{clock}}',
  activeSetAddedLoad: 'Carga',
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
  activePlatePerSideLine: '{{plates}} / lado',
  activeAddWarmups: 'Añadir calentamientos',
  activeToggleWarmupAria: 'Marcar como calentamiento',
  activeToggleWorkAria: 'Marcar como serie de trabajo',
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
  activeSavedRoutineStart: 'Empezar {{name}}',
  activeSavedRoutineDesc: 'Tu rutina guardada — las cargas quedan en la fila.',
  activeReentryStart: 'Empezar sesión más fácil',
  activeReentryStartDesc:
    'Primera sesión más corta al volver — terminable, luego la semana se reconstruye.',
  hardSessionEyebrow: 'Antes de una sesión dura',
  hardSessionTitle: 'Parar está permitido',
  hardSessionLead:
    'Un esfuerzo máximo o un test cronometrado puede ser peligroso. Esta no es la forma habitual de entrenar.',
  hardSessionStop:
    'Para si tienes dolor en el pecho, te sientes desfallecido, tienes falta de aire grave, o no puedes hablar.',
  hardSessionStopPregnancy:
    'Para si tienes sangrado, calambres, dolor en el pecho, te sientes desfallecida o mareada, tienes falta de aire grave, o no puedes hablar.',
  hardSessionNotCare:
    'Esta app no es atención médica y no puede prevenir una emergencia médica.',
  hardSessionEmergency:
    'Si esto es una emergencia, llama a los servicios de emergencia locales — no a esta app.',
  hardSessionClinician:
    'Habla con un clínico antes de tests de esfuerzo máximo si tienes una condición del corazón, respiratoria u otra de salud, o si no estás seguro.',
  hardSessionContinue: 'Entiendo — empezar',
  hardSessionBack: 'Atrás',
  activeStartWorkout: 'Iniciar entrenamiento',
  activeStartPreviewSession: 'Empezar {{name}} — {{count}} ejercicios',
  activeSetsCompleted: '{{done}}/{{total}} series completadas',
  activeCancel: 'Cancelar',
  activeFinish: 'Terminar',
  activeDiscardWorkout: 'Descartar entrenamiento',
  openSessionTakeOther: 'Continuar la otra sesión',
  activeCoachNotes: 'Notas del coach',
  activeCoachProgression: 'Progresión',
  activeRestTitle: 'Descanso',
  activeRestSubtitle: 'Recupera — siguiente serie cuando estés listo',
  activeRestSkip: 'Saltar',
  activeWorkClockStop: 'Parar',
  activeWorkClockStartAria: 'Intervalo o cuenta atrás opcional',
  activeWorkClockEmomAria: 'Empezar minuto EMOM',
  activeWorkClockAmrapAria: 'Empezar ventana AMRAP',
  activeWorkClockStopAria: 'Parar el reloj',
  activeWorkClockRunningAria: 'Reloj {{kind}} {{clock}}',
  activeAddExercise: 'Añadir ejercicio',
  activeSwapEyebrow: 'Sin máquina',
  activeSwapTitle: 'Cambiar',
  activeSwapPlaceholder: 'Cambiar a… (mismos músculos primero)',
  activeSwapGarageLead: 'Mismo patrón. Suelo, silla o una barra que ya tengas.',
  activeChooseExercise: 'Elegir ejercicio…',
  activeEmptyExercises: 'Añade un ejercicio para registrar series.',
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
  activeVsLastSame: 'igual',
  activeVsLastAria: 'frente a la última {{delta}}',
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
  activeEmptyExercises: 'Füge eine Übung hinzu, um Sätze zu protokollieren.',
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
  activePlatePerSideLine: '{{plates}} / Seite',
  activeAddWarmups: 'Aufwärmsätze hinzufügen',
  activeToggleWarmupAria: 'Als Aufwärmsatz markieren',
  activeToggleWorkAria: 'Als Arbeitssatz markieren',
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
  zh,
  id,
  th,
  ar,
  de,
  pt: {
    ...en,
    activeExerciseRestWork: 'Descanso de trabalho',
    activeExerciseRestWarmup: 'Descanso de aquecimento',
    activeExerciseRestSetAria: 'Definir {{lane}} para {{clock}}',
    activeSetAddedLoad: 'Carga',
    activeNoWorkout: 'Nenhum treino ativo',
    activeSavedRoutineStart: 'Começar {{name}}',
    activeSavedRoutineDesc: 'A tua rotina guardada — as cargas ficam na linha.',
    activeStartPreviewSession: 'Começar {{name}} — {{count}} exercícios',
    activeReentryStart: 'Começar sessão mais fácil',
    activeReentryStartDesc:
      'Primeira sessão menor na volta — terminável, depois a semana se reconstrói.',
    hardSessionEyebrow: 'Antes de uma sessão dura',
    hardSessionTitle: 'Parar é permitido',
    hardSessionLead:
      'Um esforço máximo ou um teste cronometrado pode ser perigoso. Esta não é a forma habitual de treinar.',
    hardSessionStop:
      'Pare se tiver dor no peito, se sentir desmaio, falta de ar grave, ou não conseguir falar.',
    hardSessionStopPregnancy:
      'Pare se tiver sangramento, cãibras, dor no peito, se sentir desmaio ou tontura, falta de ar grave, ou não conseguir falar.',
    hardSessionNotCare:
      'Este app não é atendimento médico e não pode prevenir uma emergência médica.',
    hardSessionEmergency:
      'Se isto for uma emergência, ligue para os serviços de emergência locais — não para este app.',
    hardSessionClinician:
      'Fale com um clínico antes de testes de esforço máximo se tiver uma condição cardíaca, respiratória ou outra de saúde, ou se não tiver certeza.',
    hardSessionContinue: 'Entendi — começar',
    hardSessionBack: 'Voltar',
    activeFinish: 'Concluir',
    activeDiscardWorkout: 'Descartar treino',
    openSessionTakeOther: 'Continuar a outra sessão',
    activeLiveSession: 'Sessão ao vivo',
    activeCoachSessionEyebrow: 'Sessão Mission Coach',
    activeElapsed: 'Decorrido',
    activeSetsLabel: 'Séries',
    activeRestAdd15: '+15 s',
    activeRestSub15: '−15 s',
    activeSwapEyebrow: 'Sem máquina',
    activeSwapTitle: 'Trocar',
    activeSwapPlaceholder: 'Trocar por… (mesmos músculos primeiro)',
    activeSwapGarageLead: 'O mesmo padrão. Chão, cadeira ou uma barra que já tenhas.',
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
    activeVsLastSame: 'igual',
    activeVsLastAria: 'versus a última {{delta}}',
    activeWorkClockStop: 'Parar',
    activeWorkClockStartAria: 'Intervalo ou contagem decrescente opcional',
    activeWorkClockEmomAria: 'Começar minuto EMOM',
    activeWorkClockAmrapAria: 'Começar janela AMRAP',
    activeWorkClockStopAria: 'Parar o relógio',
    activeWorkClockRunningAria: 'Relógio {{kind}} {{clock}}',
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
