/** Mission Coach UI copy — merged into i18n `common` namespace. */

type CoachStrings = {
  coachPageTitle: string;
  coachPageSubtitle: string;
  /** `.766` — the log fact a Coach line stands on, and the no-logs admission. */
  coachCiteFromLog: string;
  coachCiteNoLogs: string;
  coachWeekEyebrow: string;
  coachGenerateWeek: string;
  coachGenerateWeekHint: string;
  coachRegenerate: string;
  coachRegenerateConfirm: string;
  coachStartSession: string;
  /** Today hero title when the primary CTA loads today's coach session (not freestyle). */
  coachPlanHeroTitle: string;
  /** Today hero body: honest that this is the plan, not Just Go. */
  coachPlanHeroDesc: string;
  coachViewPlan: string;
  coachTodayMission: string;
  coachWeekOverview: string;
  coachAdaptHeadline: string;
  coachAdaptMissedNote: string;
  coachAdaptSwappedNote: string;
  coachAdaptLoggedNote: string;
  coachAdaptRevisionNote: string;
  /** Why panel: today's prescription rationales (`.287`). */
  coachWhyTodayEyebrow: string;
  /** `.693` — log-cited why-this-week / adapt rationale (inputs · rule · effect). */
  coachWhyWeekEyebrow: string;
  coachRationaleInputLabel: string;
  coachRationaleRuleLabel: string;
  coachRationaleEffectLabel: string;
  coachRationaleMissedInput: string;
  coachRationaleMissedRule: string;
  coachRationaleMissedEffect: string;
  coachRationaleMissedCompact: string;
  coachRationaleSwapInput: string;
  coachRationaleSwapRule: string;
  coachRationaleSwapEffect: string;
  coachRationaleSwapCompact: string;
  coachRationaleLoggedInput: string;
  coachRationaleLoggedRule: string;
  coachRationaleLoggedEffect: string;
  coachRationaleLoggedCompact: string;
  coachRationaleDeloadInput: string;
  coachRationaleDeloadRule: string;
  coachRationaleDeloadEffect: string;
  coachRationaleDeloadCompact: string;
  coachRationalePlateauInput: string;
  coachRationalePlateauRule: string;
  coachRationalePlateauEffect: string;
  coachRationalePlateauCompact: string;
  coachRationaleSteadyInput: string;
  coachRationaleSteadyRule: string;
  coachRationaleSteadyEffect: string;
  coachRationaleSteadyCompact: string;
  coachRationaleLoadUpInput: string;
  coachRationaleLoadUpRule: string;
  coachRationaleLoadUpEffect: string;
  coachRationaleLoadUpCompact: string;
  coachRationaleHoldInput: string;
  coachRationaleHoldRule: string;
  coachRationaleHoldEffect: string;
  coachRationaleHoldCompact: string;
  coachRationaleGenerateInput: string;
  coachRationaleGenerateInputFresh: string;
  coachRationaleGenerateRule: string;
  coachRationaleGenerateEffect: string;
  coachRationaleGenerateCompact: string;
  coachRationaleGenerateCompactFresh: string;
  coachAdaptKeepVersion: string;
  coachWeekDose: string;
  coachWeekDoseStrength: string;
  coachWeekDoseConditioning: string;
  coachWeekDoseRecovery: string;
  coachWeekDoseMixed: string;
  coachAdaptReentryLead: string;
  coachAdaptJustGo: string;
  coachAdaptLighterWeek: string;
  coachNoSessionToday: string;
  coachRestDay: string;
  coachDaysPerWeek: string;
  coachVoiceTitle: string;
  coachVoiceLoading: string;
  coachVoiceError: string;
  coachVoiceOffline: string;
  coachVoiceErrorDesc: string;
  /** `.608` — the load band. `coachLoadUnmeasured*` is the honest pre-evidence state. */
  coachLoadTitle: string;
  coachLoadUnmeasured: string;
  coachLoadUnmeasuredBody: string;
  coachLoadBody: string;
  coachLoadDisclaimer: string;
  coachLoadZoneLight: string;
  coachLoadZoneSteady: string;
  coachLoadZoneHigh: string;
  coachTasterLocked: string;
  coachTasterLockedDesc: string;
  coachTasterFatigueNote: string;
  coachTasterDesc: string;
  coachCompareBundle: string;
  coachUnlockBundle: string;
  coachViewLockedPlan: string;
  coachLockedWeekSummary: string;
  coachLockedBenefit1: string;
  coachLockedBenefit2: string;
  coachLockedBenefit3: string;
  coachLockedBenefit4: string;
  coachFreeCoreNote: string;
  coachWhyLoadUp: string;
  coachWhyRepProgress: string;
  coachWhyHold: string;
  coachWhyHoldHard: string;
  /**
   * `.252` — restored. Both are emitted by the engine (`loadGuard.ts:42`,
   * `progression.ts:173`) and had **no entry here at all**, so
   * `PlanExerciseLine`'s `i18n.exists(whyKey) ? t(whyKey) : ''` rendered an
   * empty line for a steady week and a plateau deload, in every language. The
   * stale `public/locales/en/coach.json` still carried the copy, which is where
   * these strings come from.
   */
  coachWhySteadyWeek: string;
  coachWhyPlateauDeload: string;
  coachWhyDeload: string;
  coachWhyRecovery: string;
  coachWhyBodyweightReps: string;
  coachFindWorkingWeight: string;
  coachSessionDone: string;
  coachSessionMissed: string;
  coachSessionSwapped: string;
  coachEstMinutes: string;
  coachVoiceDefault: string;
  coachVoiceDeload: string;
  coachVoiceRecovery: string;
  coachVoiceHighVolume: string;
  coachWhyConservative: string;
  coachAdjustTitle: string;
  coachAdjustToday: string;
  coachAdjust20: string;
  coachAdjust30: string;
  coachAdjustBodyweight: string;
  coachAdjustHurts: string;
  coachAdjustNoteTime: string;
  coachAdjustNoteEquipment: string;
  coachAdjustNoteAvoid: string;
  coachAdjustClose: string;
  coachChatTitle: string;
  coachChatPlaceholder: string;
  coachChatSend: string;
  coachChatLockedTitle: string;
  coachChatLockedDesc: string;
  coachChatOffline: string;
  coachChatOpen: string;
  /** D12 — manage-week sheet */
  coachManageWeek: string;
  coachMoreDepth: string;
  coachChangeSchedule: string;
  coachAskCoach: string;
  coachScheduleRemapNote: string;
  coachRemapThisWeek: string;
  coachRegenerateWeekPlan: string;
  coachPreferredDays: string;
  coachPreferredDaysUsed: string;
  coachPreferredDaysSpread: string;
  coachGenerateEmptyTitle: string;
  coachFreeBetaNextWeek: string;
  coachGenerateEmptyDesc: string;
  coachManageCancel: string;
  coachManageBack: string;
  /** Kaizen Loop 3 M1 — Adjust/chat/today (.301) */
  coachAdjustAppliedTime: string;
  coachAdjustAppliedEquipment: string;
  coachAdjustAppliedAvoid: string;
  coachAdjustAppliedReadiness: string;
  coachAdjustAppliedTitle: string;
  coachAdjustGroupTime: string;
  coachAdjustGroupGear: string;
  coachAdjustGroupHurt: string;
  coachAdjustMinutes: string;
  coachAdjustPickArea: string;
  coachFreeFormTitle: string;
  coachFreeFormFallback: string;
  coachFreeFormChatHintFree: string;
  coachFreeFormChatHint: string;
  coachChatSoftTip: string;
  coachChatAskFormPrefill: string;
  coachChatRateLimited: string;
  coachChatUnauthorized: string;
  coachChatPremium: string;
  coachChatError: string;
  coachChatBrowserOffline: string;
  coachChatQuota: string;
  coachChatStopped: string;
  coachChatStop: string;
  coachTodayBandHigh: string;
  coachTodayBandLight: string;
  coachTodayBandSteady: string;
  coachTodayMoreExercises: string;
  coachSessionMobility: string;
  coachAiBadge: string;
  coachLoading: string;
};

const en: CoachStrings = {
  coachPageTitle: 'Mission Coach',
  coachPageSubtitle:
    'Weekly plans from your workout logs alone — no wearable. Adapts when you miss or crush a session.',
  coachCiteFromLog: 'From your log: {{fact}}',
  coachCiteNoLogs:
    'No sets logged yet — log one and Coach builds the week from it.',
  coachLoadTitle: 'Training load',
  coachLoadUnmeasured: 'Not enough history yet',
  coachLoadUnmeasuredBody:
    'Keep logging — about {{days}} more days of training and this compares your last week against your own baseline.',
  coachLoadBody:
    'Last week against your 4-week baseline: {{ratio}}×. Built from your logged sets — no wearable involved.',
  coachLoadDisclaimer:
    'A description of your recent workload, not a medical or recovery reading.',
  coachLoadZoneLight: 'Lighter than your recent normal',
  coachLoadZoneSteady: 'In line with your recent normal',
  coachLoadZoneHigh: 'Above your recent normal',
  coachWeekEyebrow: "THIS WEEK'S MISSION",
  coachGenerateWeek: 'Generate this week',
  coachGenerateWeekHint: 'Generate a weekly plan from your logs — no wearable required.',
  coachRegenerate: 'Regenerate week',
  coachRegenerateConfirm: 'Tap again to confirm',
  coachStartSession: 'Start this session',
  coachPlanHeroTitle: '{{name}}',
  coachPlanHeroDesc:
    "Today's planned session from Mission Coach — not freestyle Just Go.",
  coachViewPlan: 'View full week',
  coachTodayMission: 'Mission Coach · adapts from logs',
  coachWeekOverview: 'Mission Coach · this week',
  coachAdaptHeadline: 'Adapted from your logs — no wearable needed',
  coachAdaptMissedNote:
    'Life happened — {{count}} session(s) missed. Remaining days are re-spread so the week still fits. No shame; just continue.',
  coachAdaptSwappedNote:
    '{{count}} day(s) swapped to recovery from readiness / strain — from logs, not a wearable.',
  coachAdaptLoggedNote:
    'Week updated from workouts you already logged — plan revision bumped, no wearable required.',
  coachAdaptRevisionNote:
    'Plan revision {{rev}} — week reshaped from workout history alone.',
  coachWhyTodayEyebrow: "Why today's plan",
  coachWhyWeekEyebrow: 'Why this week — from your logs',
  coachRationaleInputLabel: 'From your logs',
  coachRationaleRuleLabel: 'Rule applied',
  coachRationaleEffectLabel: 'Expected effect',
  coachRationaleMissedInput:
    'Missed {{days}} ({{count}} session(s)) in your plan log — past days with no finish.',
  coachRationaleMissedRule: 'Missed-day re-spread — remaining days still fit the week.',
  coachRationaleMissedEffect:
    'Later sessions keep their focus; the calendar shifts forward. No shame; just continue.',
  coachRationaleMissedCompact:
    'Missed {{days}} in your logs → re-spread remaining days → week still fits.',
  coachRationaleSwapInput:
    'Readiness / strain from your logs flagged {{days}} for a lighter day.',
  coachRationaleSwapRule:
    'Readiness recovery swap — strength day becomes recovery when readiness is low.',
  coachRationaleSwapEffect: 'That day is recovery / mobility — keep quality high, strain low.',
  coachRationaleSwapCompact:
    '{{days}}: readiness from logs → recovery swap → lighter day, same week.',
  coachRationaleLoggedInput:
    '{{count}} session(s) already finished in your workout log this week.',
  coachRationaleLoggedRule: 'Log match — finished workouts mark plan days done (no wearable).',
  coachRationaleLoggedEffect:
    'Week revision updated from what you logged; remaining days stay on mission.',
  coachRationaleLoggedCompact:
    '{{count}} logged → plan marked done → week updated from history alone.',
  coachRationaleDeloadInput:
    'Recent sets in your logs called for recovery (hard RPE / stall signals).',
  coachRationaleDeloadRule: 'Deload progression — lighter load, same movement patterns.',
  coachRationaleDeloadEffect:
    'Working sets stay patterned but lighter so you rebuild from a solid base.',
  coachRationaleDeloadCompact:
    'Logs showed recovery need → deload rule → lighter load, same patterns.',
  coachRationalePlateauInput: 'No new best in roughly a month across your logged sets.',
  coachRationalePlateauRule: 'Plateau deload — step back to rebuild.',
  coachRationalePlateauEffect: 'Lighter week so progress can restart from quality reps.',
  coachRationalePlateauCompact:
    'No recent best in logs → plateau deload → lighter rebuild week.',
  coachRationaleSteadyInput: 'Your last week of logs is heavier than your month (load band).',
  coachRationaleSteadyRule: 'Load guard — hold the rise; never auto-deload from the band alone.',
  coachRationaleSteadyEffect: 'Intensity held steady — clean reps over chasing fatigue.',
  coachRationaleSteadyCompact: 'Heavy recent week in logs → hold rise → intensity stays put.',
  coachRationaleLoadUpInput:
    'Last logged session felt manageable — room for a small load bump.',
  coachRationaleLoadUpRule: 'Load progression — small bump from easy recent sets.',
  coachRationaleLoadUpEffect: 'Working weight steps up slightly on the main lifts.',
  coachRationaleLoadUpCompact:
    'Easy recent sets in logs → load-up → small weight bump.',
  coachRationaleHoldInput: 'Recent logged sets are still settling at this load.',
  coachRationaleHoldRule: 'Hold load — quality over ego until reps feel solid.',
  coachRationaleHoldEffect: 'Same working weight; focus on crisp reps and full sets.',
  coachRationaleHoldCompact:
    'Logs say consolidate → hold load → same weight, better quality.',
  coachRationaleGenerateInput:
    '{{count}} workout(s) in your log · {{days}} training days · {{gear}}.',
  coachRationaleGenerateInputFresh:
    '{{days}} training days · {{gear}} — week shaped from your schedule and gear (clean start).',
  coachRationaleGenerateRule:
    'Weekly generate — split and sessions from logs and gear, not a wearable.',
  coachRationaleGenerateEffect:
    '{{sessions}} sessions on the calendar — miss or crush a day and the plan flexes.',
  coachRationaleGenerateCompact:
    '{{count}} logged workouts → weekly generate → {{sessions}} sessions this week.',
  coachRationaleGenerateCompactFresh:
    '{{days}} days · {{gear}} → weekly generate → {{sessions}} sessions this week.',
  coachAdaptKeepVersion: 'Adjust or keep my version of today',
  coachWeekDose:
    'This week’s dose: {{count}} sessions · {{intent}} · ~{{minutes}} min',
  coachWeekDoseStrength: 'mostly strength',
  coachWeekDoseConditioning: 'conditioning focus',
  coachWeekDoseRecovery: 'recovery-heavy',
  coachWeekDoseMixed: 'mixed strength & recovery',
  coachAdaptReentryLead: 'Ready to train again?',
  coachAdaptJustGo: 'Just Go — log one set',
  coachAdaptLighterWeek: 'Open Today',
  coachNoSessionToday: 'Rest or recovery day — light movement still counts.',
  coachRestDay: 'Rest day',
  coachDaysPerWeek: 'How many days a week?',
  coachVoiceTitle: "Commander's intent",
  coachVoiceLoading: 'Briefing your week…',
  coachVoiceError: 'Could not load briefing',
  coachVoiceOffline: 'You appear offline — try again when connected.',
  coachVoiceErrorDesc: 'Tap retry to load commander intent.',
  coachTasterLocked: 'Your free week is complete',
  coachTasterLockedDesc:
    'You got one free Coach week. Super Bundle unlocks a new plan every Monday, on-demand regeneration, and Commander\'s intent tuned to readiness.',
  coachTasterFatigueNote:
    'Premium also watches strain: when load runs high (≥70), future sessions auto-shift lighter so you recover without quitting the week.',
  coachTasterDesc: 'Unlock Mission Coach to regenerate and adapt your plan every week.',
  coachCompareBundle: 'Compare Super Bundle',
  coachUnlockBundle: 'Unlock Super Bundle',
  coachViewLockedPlan: 'View last week & unlock',
  coachLockedWeekSummary: '{{done}}/{{total}} sessions logged last week',
  coachLockedBenefit1: 'Unlimited week regeneration and Monday rollover',
  coachLockedBenefit2: 'Fatigue-aware plans that adapt when strain is elevated',
  coachLockedBenefit3: "Commander's intent briefings every week",
  coachLockedBenefit4: 'All six premium pillars — Train, Fuel, Move, Mind, Track, Learn',
  coachFreeCoreNote: 'Workout logger, library, and Today stay free — premium funds the mission.',
  coachWhyLoadUp: 'Last session felt easy — small load bump.',
  coachWhyRepProgress: 'Building reps before adding weight.',
  coachWhyHold: 'Hold this load until reps feel solid.',
  coachWhyHoldHard: 'Hard sets — hold load and consolidate.',
  coachWhySteadyWeek: 'Big week against your own recent average — holding here.',
  coachWhyPlateauDeload: 'No new best in a month — lighter week to rebuild from.',
  coachWhyDeload: 'Recovery week — lighter load, same patterns.',
  coachWhyRecovery: 'Mobility and activation for better training.',
  coachWhyBodyweightReps: 'Add reps until the set feels challenging.',
  coachFindWorkingWeight: 'Find a weight you could do for 2 more reps.',
  coachSessionDone: 'Done',
  coachSessionMissed: 'Missed',
  coachSessionSwapped: 'Adapted',
  coachEstMinutes: '{{minutes}} min',
  coachVoiceDefault:
    'This week balances progressive overload with recovery. Hit each session with intent and log your sets.',
  coachVoiceDeload:
    'Strain is elevated — treat this as a consolidation week. Same movements, slightly lighter loads.',
  coachVoiceRecovery:
    'Readiness is lower — prioritize mobility and quality reps. Strength returns when you recover.',
  coachVoiceHighVolume:
    'A full training week ahead. Fuel well, sleep consistently, and trust the progression.',
  coachWhyConservative: 'Conservative load after an avoid adjustment — quality over ego.',
  coachAdjustTitle: 'Adjust today’s session',
  coachAdjustToday: 'Adjust today',
  coachAdjust20: '20 min',
  coachAdjust30: '30 min',
  coachAdjustBodyweight: 'No equipment today',
  coachAdjustHurts: 'Something hurts',
  coachAdjustNoteTime: 'Shortened for time — same intent, fewer sets.',
  coachAdjustNoteEquipment: 'Bodyweight-only version of today’s focus.',
  coachAdjustNoteAvoid: 'Stepped around a sore group — conservative loads.',
  coachAdjustClose: 'Done',
  coachChatTitle: 'Ask your coach',
  coachChatPlaceholder: 'Ask about today’s session, form, or recovery…',
  coachChatSend: 'Send',
  coachChatLockedTitle: 'Coach chat is Super Bundle',
  coachChatLockedDesc:
    'Chat with your coach about form, fuel, and recovery. Free core keeps the plan and offline adjustments.',
  coachChatOffline: 'Coach voice offline — your plan and adjustments still work.',
  coachChatOpen: 'Ask your coach',
  coachManageWeek: 'Manage this week',
  coachMoreDepth: 'Voice, load & chat',
  coachChangeSchedule: 'Change schedule',
  coachAskCoach: 'Ask coach',
  coachScheduleRemapNote:
    'Changing days updates the next generate. Remap this week now so today’s strip matches — it replaces the current plan.',
  coachRemapThisWeek: 'Remap this week',
  coachRegenerateWeekPlan: 'Regenerate week plan',
  coachPreferredDays: 'Which days suit you?',
  coachPreferredDaysUsed: 'Your coach week will use these days.',
  coachPreferredDaysSpread:
    'Pick at least {{count}} to choose your own days — otherwise sessions spread evenly.',
  coachGenerateEmptyTitle: 'No plan this week',
  coachFreeBetaNextWeek: 'Generate next week from your latest logs. Free while beta is open.',
  coachGenerateEmptyDesc: 'One week from your logs. Free every week — no wearable.',
  coachManageCancel: 'Cancel',
  coachManageBack: 'Back',
  coachAdjustAppliedTime: 'Trimmed to about {{minutes}} minutes',
  coachAdjustAppliedEquipment: 'Rebuilt with bodyweight movements only',
  coachAdjustAppliedAvoid: 'Working around {{group}}',
  coachAdjustAppliedReadiness: 'Scaled to how recovered you are',
  coachAdjustAppliedTitle: 'Applied',
  coachAdjustGroupTime: 'Less time today',
  coachAdjustGroupGear: 'Different gear',
  coachAdjustGroupHurt: 'Something hurts',
  coachAdjustMinutes: '{{minutes}} min',
  coachAdjustPickArea: 'Pick the area',
  coachFreeFormTitle: 'Form cues — {{name}}',
  coachFreeFormFallback: 'Open Form guide on the logger for setup and execute tips.',
  coachFreeFormChatHintFree: 'Your weekly plan and Adjust today stay free. Live chat opens later in beta.',
  coachFreeFormChatHint: 'Live Q&A chat is Super Bundle — your weekly plan and Adjust today stay free.',
  coachChatSoftTip: 'Want to ask the coach anything? Chat is Super Bundle.',
  coachChatAskFormPrefill: 'How should I perform {{name}} with good form?',
  coachChatRateLimited: 'Too many messages — wait a moment and try again.',
  coachChatUnauthorized: 'Sign in again to keep chatting with your coach.',
  coachChatPremium: 'Coach chat needs an active Super Bundle.',
  coachChatError: 'Could not reach the coach. Try again.',
  coachChatBrowserOffline: 'You appear offline — reconnect and try again.',
  coachChatQuota: "Today's chat limit reached — resets tomorrow. Your plan and logger are unaffected.",
  coachChatStopped: 'Stopped.',
  coachChatStop: 'Stop',
  coachTodayBandHigh: 'Your last week is running heavier than your month.',
  coachTodayBandLight: 'Last week is lighter than your month.',
  coachTodayBandSteady: 'Your week is tracking with your month.',
  coachTodayMoreExercises: '+{{count}} more',
  coachSessionMobility: 'Mobility',
  coachAiBadge: 'Live',
  coachLoading: 'Looking at your week…',
};

const es: CoachStrings = {
  ...en,
  coachPageTitle: 'Coach de misión',
  coachWeekEyebrow: 'MISIÓN DE ESTA SEMANA',
  coachGenerateWeek: 'Generar esta semana',
  coachStartSession: 'Iniciar sesión',
  coachPlanHeroTitle: '{{name}}',
  coachPlanHeroDesc:
    'Sesión planificada de hoy de Mission Coach — no es Just Go libre.',
  coachDaysPerWeek: '¿Cuántos días a la semana?',
  coachTasterLocked: 'Tu semana gratis terminó',
  coachTasterLockedDesc:
    'Tuviste una semana gratis de Coach. Super Bundle desbloquea un plan nuevo cada lunes, regeneración bajo demanda e intención del comandante según tu preparación.',
  coachTasterFatigueNote:
    'Premium también vigila la carga: si el strain es alto (≥70), las sesiones futuras se aligeran para que recuperes sin abandonar la semana.',
  coachUnlockBundle: 'Desbloquear Super Bundle',
  coachViewLockedPlan: 'Ver la semana pasada y desbloquear',
  coachWhyConservative: 'Carga conservadora tras evitar un grupo — calidad sobre ego.',
  coachAdjustTitle: 'Ajustar la sesión de hoy',
  coachAdjustToday: 'Ajustar hoy',
  coachAdjust20: '20 min',
  coachAdjust30: '30 min',
  coachAdjustBodyweight: 'Sin equipo hoy',
  coachAdjustHurts: 'Algo me duele',
  coachAdjustNoteTime: 'Acortada por tiempo — misma intención, menos series.',
  coachAdjustNoteEquipment: 'Versión solo peso corporal del enfoque de hoy.',
  coachAdjustNoteAvoid: 'Evitamos un grupo dolorido — cargas conservadoras.',
  coachAdjustClose: 'Listo',
  coachChatTitle: 'Pregunta a tu coach',
  coachChatPlaceholder: 'Pregunta por la sesión, la técnica o la recuperación…',
  coachChatSend: 'Enviar',
  coachChatLockedTitle: 'El chat del coach es Super Bundle',
  coachChatLockedDesc:
    'Habla con tu coach sobre técnica, nutrición y recuperación. El núcleo gratis mantiene el plan y los ajustes offline.',
  coachChatOffline: 'Coach offline — tu plan y ajustes siguen funcionando.',
  coachChatOpen: 'Pregunta a tu coach',
};

const fr: CoachStrings = {
  ...en,
  coachPageTitle: 'Coach de mission',
  coachWeekEyebrow: 'MISSION DE CETTE SEMAINE',
  coachGenerateWeek: 'Générer cette semaine',
  coachRegenerate: 'Régénérer la semaine',
  coachRegenerateConfirm: 'Appuyez encore pour confirmer',
  coachStartSession: 'Commencer cette séance',
  coachPlanHeroTitle: '{{name}}',
  coachPlanHeroDesc:
    "Séance planifiée d'aujourd'hui par Mission Coach — pas un Just Go libre.",
  coachViewPlan: 'Voir la semaine complète',
  coachTodayMission: 'Mission du jour',
  coachNoSessionToday: 'Jour de repos ou de récupération — un peu de mouvement compte encore.',
  coachRestDay: 'Jour de repos',
  coachDaysPerWeek: 'Combien de jours par semaine ?',
  coachVoiceTitle: 'Intention du commandant',
  coachVoiceLoading: 'Briefing de votre semaine…',
  coachTasterLocked: 'Votre semaine gratuite est terminée',
  coachTasterLockedDesc:
    'Vous avez eu une semaine Coach gratuite. Super Bundle débloque un nouveau plan chaque lundi, la régénération à la demande et l’intention du commandant selon votre préparation.',
  coachTasterFatigueNote:
    'Premium surveille aussi la charge : si le strain est élevé (≥70), les séances à venir s’allègent pour récupérer sans quitter la semaine.',
  coachTasterDesc: 'Débloquez Mission Coach pour régénérer et adapter votre plan chaque semaine.',
  coachCompareBundle: 'Comparer Super Bundle',
  coachUnlockBundle: 'Débloquer Super Bundle',
  coachViewLockedPlan: 'Voir la semaine dernière et débloquer',
  coachLockedWeekSummary: '{{done}}/{{total}} séances enregistrées la semaine dernière',
  coachLockedBenefit1: 'Régénération illimitée et bascule du lundi',
  coachLockedBenefit2: 'Plans sensibles à la fatigue quand le strain monte',
  coachLockedBenefit3: 'Briefings d’intention du commandant chaque semaine',
  coachLockedBenefit4: 'Les six piliers premium — Train, Fuel, Move, Mind, Track, Learn',
  coachFreeCoreNote:
    'Le journal d’entraînement, la bibliothèque et Aujourd’hui restent gratuits — le premium finance la mission.',
  coachSessionDone: 'Terminé',
  coachSessionMissed: 'Manqué',
  coachSessionSwapped: 'Adapté',
  coachEstMinutes: '{{minutes}} min',
  coachVoiceDefault:
    'Cette semaine équilibre surcharge progressive et récupération. Abordez chaque séance avec intention et enregistrez vos séries.',
  coachVoiceDeload:
    'La charge est élevée — traitez ceci comme une semaine de consolidation. Mêmes mouvements, charges un peu plus légères.',
  coachVoiceRecovery:
    'La préparation est plus basse — priorisez mobilité et qualité des reps. La force revient avec la récupération.',
  coachVoiceHighVolume:
    'Une semaine d’entraînement complète devant vous. Bien vous alimenter, dormir régulièrement, et faire confiance à la progression.',
};

const de: CoachStrings = {
  ...en,
  coachPageTitle: 'Mission Coach',
  coachWeekEyebrow: 'MISSION DIESER WOCHE',
  coachGenerateWeek: 'Diese Woche generieren',
  coachRegenerate: 'Woche neu generieren',
  coachRegenerateConfirm: 'Nochmal tippen zum Bestätigen',
  coachStartSession: 'Diese Einheit starten',
  coachPlanHeroTitle: '{{name}}',
  coachPlanHeroDesc:
    'Heutige geplante Einheit von Mission Coach — kein freies Just Go.',
  coachViewPlan: 'Ganze Woche ansehen',
  coachTodayMission: 'Mission des Tages',
  coachNoSessionToday: 'Ruhe- oder Erholungstag — leichte Bewegung zählt trotzdem.',
  coachRestDay: 'Ruhetag',
  coachDaysPerWeek: 'Wie viele Tage pro Woche?',
  coachVoiceTitle: 'Absicht des Kommandanten',
  coachVoiceLoading: 'Briefing deiner Woche…',
  coachTasterLocked: 'Deine kostenlose Woche ist vorbei',
  coachTasterLockedDesc:
    'Du hattest eine kostenlose Coach-Woche. Super Bundle schaltet jeden Montag einen neuen Plan frei, Regeneration auf Abruf und Absicht des Kommandanten nach deiner Bereitschaft.',
  coachTasterFatigueNote:
    'Premium überwacht auch die Belastung: Wenn der Strain hoch ist (≥70), werden kommende Einheiten leichter, damit du dich erholst, ohne die Woche abzubrechen.',
  coachTasterDesc: 'Schalte Mission Coach frei, um deinen Plan jede Woche neu zu generieren und anzupassen.',
  coachCompareBundle: 'Super Bundle vergleichen',
  coachUnlockBundle: 'Super Bundle freischalten',
  coachViewLockedPlan: 'Letzte Woche ansehen und freischalten',
  coachLockedWeekSummary: '{{done}}/{{total}} Einheiten letzte Woche protokolliert',
  coachLockedBenefit1: 'Unbegrenzte Wochen-Regeneration und Montags-Rollover',
  coachLockedBenefit2: 'Ermüdungssensible Pläne, die sich bei hohem Strain anpassen',
  coachLockedBenefit3: 'Briefings zur Absicht des Kommandanten jede Woche',
  coachLockedBenefit4: 'Alle sechs Premium-Säulen — Train, Fuel, Move, Mind, Track, Learn',
  coachFreeCoreNote:
    'Trainingsjournal, Bibliothek und Heute bleiben kostenlos — Premium finanziert die Mission.',
  coachSessionDone: 'Erledigt',
  coachSessionMissed: 'Verpasst',
  coachSessionSwapped: 'Angepasst',
  coachEstMinutes: '{{minutes}} Min',
  coachVoiceDefault:
    'Diese Woche balanciert progressive Überlastung und Erholung. Geh jede Einheit mit Absicht an und protokolliere deine Sätze.',
  coachVoiceDeload:
    'Die Belastung ist hoch — behandle das als Konsolidierungswoche. Gleiche Bewegungen, etwas leichtere Lasten.',
  coachVoiceRecovery:
    'Die Bereitschaft ist niedriger — priorisiere Mobilität und saubere Reps. Kraft kommt mit der Erholung zurück.',
  coachVoiceHighVolume:
    'Eine volle Trainingswoche liegt vor dir. Ernähre dich gut, schlaf regelmäßig und vertrau der Progression.',
};

const LOCALES: Partial<Record<string, CoachStrings>> = { en, es, fr, de };

export function coachStringsFor(lang: string): CoachStrings {
  const code = lang.split('-')[0];
  return { ...en, ...(LOCALES[code] ?? {}) };
}

export function mergeCoachStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, coachStringsFor(lang));
}
