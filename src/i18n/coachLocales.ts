/** Mission Coach UI copy — merged into i18n `common` namespace. */

type CoachStrings = {
  coachPageTitle: string;
  coachWeekEyebrow: string;
  coachGenerateWeek: string;
  coachRegenerate: string;
  coachRegenerateConfirm: string;
  coachStartSession: string;
  coachViewPlan: string;
  coachTodayMission: string;
  coachNoSessionToday: string;
  coachRestDay: string;
  coachDaysPerWeek: string;
  coachVoiceTitle: string;
  coachVoiceLoading: string;
  coachTasterLocked: string;
  coachTasterLockedDesc: string;
  coachTasterDesc: string;
  coachCompareBundle: string;
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
};

const en: CoachStrings = {
  coachPageTitle: 'Mission Coach',
  coachWeekEyebrow: "THIS WEEK'S MISSION",
  coachGenerateWeek: 'Generate this week',
  coachRegenerate: 'Regenerate week',
  coachRegenerateConfirm: 'Tap again to confirm',
  coachStartSession: 'Start this session',
  coachViewPlan: 'View full week',
  coachTodayMission: "Today's mission",
  coachNoSessionToday: 'Rest or recovery day — light movement still counts.',
  coachRestDay: 'Rest day',
  coachDaysPerWeek: 'How many days a week?',
  coachVoiceTitle: "Commander's intent",
  coachVoiceLoading: 'Briefing your week…',
  coachTasterLocked: 'Your free week is complete',
  coachTasterLockedDesc:
    'Super Bundle unlocks a new weekly plan, on-demand regeneration, and Commander\'s intent briefings tuned to your readiness.',
  coachTasterDesc: 'Unlock Mission Coach to regenerate and adapt your plan every week.',
  coachCompareBundle: 'Compare Super Bundle',
  coachLockedWeekSummary: '{{done}}/{{total}} sessions logged last week',
  coachLockedBenefit1: 'Unlimited week regeneration and rollover',
  coachLockedBenefit2: 'Fatigue-aware plans that adapt to strain and recovery',
  coachLockedBenefit3: "Commander's intent briefings every week",
  coachLockedBenefit4: 'All six premium pillars — Train, Fuel, Move, Mind, Track, Learn',
  coachFreeCoreNote: 'Workout logger, library, and Today stay free — premium funds the mission.',
  coachWhyLoadUp: 'Last session felt easy — small load bump.',
  coachWhyRepProgress: 'Building reps before adding weight.',
  coachWhyHold: 'Hold this load until reps feel solid.',
  coachWhyHoldHard: 'Hard sets — hold load and consolidate.',
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
};

const es: CoachStrings = {
  ...en,
  coachPageTitle: 'Coach de misión',
  coachWeekEyebrow: 'MISIÓN DE ESTA SEMANA',
  coachGenerateWeek: 'Generar esta semana',
  coachStartSession: 'Iniciar sesión',
  coachDaysPerWeek: '¿Cuántos días a la semana?',
};

const LOCALES: Partial<Record<string, CoachStrings>> = { en, es };

export function coachStringsFor(lang: string): CoachStrings {
  const code = lang.split('-')[0];
  return { ...en, ...(LOCALES[code] ?? {}) };
}

export function mergeCoachStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, coachStringsFor(lang));
}
