/** Mission Coach UI copy — merged into i18n `common` namespace. */

type CoachStrings = {
  coachPageTitle: string;
  coachPageSubtitle: string;
  coachWeekEyebrow: string;
  coachGenerateWeek: string;
  coachGenerateWeekHint: string;
  coachRegenerate: string;
  coachRegenerateConfirm: string;
  coachStartSession: string;
  coachViewPlan: string;
  coachTodayMission: string;
  coachWeekOverview: string;
  coachAdaptHeadline: string;
  coachAdaptMissedNote: string;
  coachAdaptSwappedNote: string;
  coachAdaptLoggedNote: string;
  coachAdaptRevisionNote: string;
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
};

const en: CoachStrings = {
  coachPageTitle: 'Mission Coach',
  coachPageSubtitle:
    'Weekly plans from your workout logs alone — no wearable. Adapts when you miss or crush a session.',
  coachWeekEyebrow: "THIS WEEK'S MISSION",
  coachGenerateWeek: 'Generate this week',
  coachGenerateWeekHint: 'Generate a weekly plan from your logs — no wearable required.',
  coachRegenerate: 'Regenerate week',
  coachRegenerateConfirm: 'Tap again to confirm',
  coachStartSession: 'Start this session',
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
  coachWeekDose:
    'This week’s dose: {{count}} sessions · {{intent}} · ~{{minutes}} min',
  coachWeekDoseStrength: 'mostly strength',
  coachWeekDoseConditioning: 'conditioning focus',
  coachWeekDoseRecovery: 'recovery-heavy',
  coachWeekDoseMixed: 'mixed strength & recovery',
  coachAdaptReentryLead: 'Ready to get back on the path?',
  coachAdaptJustGo: 'Just Go — log one set',
  coachAdaptLighterWeek: 'Open Today',
  coachNoSessionToday: 'Rest or recovery day — light movement still counts.',
  coachRestDay: 'Rest day',
  coachDaysPerWeek: 'How many days a week?',
  coachVoiceTitle: "Commander's intent",
  coachVoiceLoading: 'Briefing your week…',
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
};

const es: CoachStrings = {
  ...en,
  coachPageTitle: 'Coach de misión',
  coachWeekEyebrow: 'MISIÓN DE ESTA SEMANA',
  coachGenerateWeek: 'Generar esta semana',
  coachStartSession: 'Iniciar sesión',
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
