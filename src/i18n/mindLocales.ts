/** Mind pillar UI copy — merged into i18n `common` namespace. */

type MindStrings = {
  mindTitle: string;
  mindSubtitle: string;
  mindRecentWins: string;
  mindPremiumTitle: string;
  mindPremiumDesc: string;
  mindPremiumBtn: string;
  /** Kaizen Loop 4 N1 — check-in / breathing / page leftovers (.306) */
  mindBreathingTitle: string;
  mindBreathingSubtitle: string;
  mindCheckInTitle: string;
  mindCheckInSubtitle: string;
  mindCheckInSleep: string;
  mindCheckInMood: string;
  mindCheckInStress: string;
  mindCheckInEnergy: string;
  mindCheckInSoreness: string;
  mindCheckInNoteLabel: string;
  mindCheckInNotePlaceholder: string;
  mindCheckInUpdate: string;
  mindCheckInSave: string;
  mindCheckInSaved: string;
  mindEyebrow: string;
  mindGuidedFree: string;
  mindPremiumOffline: string;
  mindPremiumSessions: string;
  mindPremiumPreview: string;
  mindEmptyTitle: string;
  mindEmptyDesc: string;
  mindEmptyCta: string;
  mindPremiumFetchFailed: string;
  mindPremiumFetchFailedDesc: string;
  /** Free-beta: depth unlocked — no “premium” empty/error merch. */
  mindPremiumFetchFailedOpenBeta: string;
  mindPremiumOfflineOpenBeta: string;
  mindPremiumSessionsCountOpenBeta: string;
  mindPremiumRetry: string;
  mindPreviewPlayer: string;
  mindLockedHint: string;
  /** Kaizen collection empties + counted headings (`.558`) — see moveLocales. */
  mindCollections: string;
  mindCollectionShowAll: string;
  mindCollectionEmpty: string;
  mindGuidedFreeCount: string;
  mindPremiumSessionsCount: string;
  mindPremiumPreviewCount: string;
  /** Split from an `isFreeBeta()` ternary default — see moveLocales. */
  mindSubtitleDepthBeta: string;
  mindSubtitleDepthPaid: string;
  mindSubtitleBrief: string;
  mindSeriesSleepWeekBlurb: string;
  /** Free-beta: depth unlocked — no “Premium sessions only” pitch. */
  mindSeriesSleepWeekBlurbOpenBeta: string;
};

const en: MindStrings = {
  mindTitle: 'Mind & Recovery',
  mindSubtitle:
    'Free breathing timer and daily check-in. Super Bundle adds skippable training questions — not a meditation library.',
  mindRecentWins: 'Recent Mind Wins',
  mindPremiumTitle: 'Premium — training questions, not a spa library',
  mindPremiumDesc:
    'Short journal-style sessions for before a lift, after a miss, sleep, and travel. Pause or skip any step. No streak. Not therapy.',
  mindPremiumBtn: 'Mind & Recovery Premium',
  mindBreathingTitle: 'Breathing Timer',
  mindBreathingSubtitle: 'Free guided patterns — no audio required. {{count}} cycles.',
  mindCheckInTitle: 'Daily Check-In',
  mindCheckInSubtitle:
    'Sleep, mood, stress, energy, soreness — 1 (low) to 5 (great). Feeds readiness on Today and Active. Free for all.',
  mindCheckInSleep: 'Sleep quality last night',
  mindCheckInMood: 'Mood today',
  mindCheckInStress: 'Stress level',
  mindCheckInEnergy: 'Energy',
  mindCheckInSoreness: 'Muscle soreness',
  mindCheckInNoteLabel: 'Optional note',
  mindCheckInNotePlaceholder: 'One line — what helped or what you need tomorrow',
  mindCheckInUpdate: "Update Today's Check-In",
  mindCheckInSave: 'Save Check-In',
  mindCheckInSaved: 'Saved for today — adjusts readiness (within honest bounds).',
  mindEyebrow: 'Mind',
  mindGuidedFree: 'Guided sessions',
  mindPremiumOffline: 'Premium sessions unavailable offline — free tools above still work.',
  mindPremiumSessions: 'Premium guided sessions',
  mindPremiumPreview: 'Premium guided sessions',
  mindEmptyTitle: 'No mind sessions logged yet',
  mindEmptyDesc: 'Try a guided session or breathing timer — your first win shows here.',
  mindEmptyCta: 'Browse guided sessions',
  mindPremiumFetchFailed: 'Could not load premium sessions',
  mindPremiumFetchFailedDesc: 'Free mind tools still work. Check your connection and try again.',
  mindPremiumFetchFailedOpenBeta: 'Could not load extra guided sessions',
  mindPremiumOfflineOpenBeta:
    'Extra sessions unavailable offline — free tools above still work.',
  mindPremiumRetry: 'Try again',
  mindPreviewPlayer: 'Press play — timed cues walk you through each step',
  mindLockedHint:
    'Free: {{free}} guided sessions. Super Bundle adds {{premium}} timed sessions you can skip — training questions, not a meditation library.',
  mindCollections: 'Collections',
  mindCollectionShowAll: 'Show all sessions',
  mindCollectionEmpty: 'No sessions in this collection.',
  mindGuidedFreeCount: 'Guided sessions ({{count}})',
  mindPremiumSessionsCount: 'Premium guided sessions ({{count}})',
  mindPremiumSessionsCountOpenBeta: 'More guided sessions ({{count}})',
  mindPremiumPreviewCount: 'Premium guided sessions ({{count}})',
  mindSubtitleDepthBeta:
    '{{free}} free guided sessions · {{unlocked}} unlocked in Alpha — breathing + check-in included.',
  mindSubtitleDepthPaid:
    '{{free}} free guided sessions · Super Bundle adds {{premium}} deeper timed sessions.',
  mindSubtitleBrief: 'Check in, then breathe or run a free guided session.',
  mindSeriesSleepWeekBlurb:
    'A {{count}}-night sequence — do nights in order when you can. Premium sessions only.',
  mindSeriesSleepWeekBlurbOpenBeta:
    'A {{count}}-night sequence — do nights in order when you can.',
};

const es: MindStrings = {
  ...en,
  mindTitle: 'Mente y recuperación',
  mindSubtitle:
    'Temporizador de respiración y check-in diario gratis. Super Bundle añade preguntas de entrenamiento que puedes saltar — no una biblioteca de meditación.',
  mindRecentWins: 'Victorias recientes de Mind',
};

const zh: MindStrings = {
  ...en,
  mindTitle: '心理与恢复',
  mindRecentWins: '最近 Mind 成就',
};

const id: MindStrings = {
  ...en,
  mindTitle: 'Pikiran & pemulihan',
  mindRecentWins: 'Kemenangan Mind terbaru',
};

const th: MindStrings = {
  ...en,
  mindTitle: 'จิตใจและการฟื้นตัว',
  mindRecentWins: 'ชัยชนะ Mind ล่าสุด',
};

const ar: MindStrings = {
  ...en,
  mindTitle: 'العقل والتعافي',
  mindRecentWins: 'انتصارات Mind الأخيرة',
};

const LOCALES: Partial<Record<string, MindStrings>> = { en, es, zh, id, th, ar };

export function mindStringsFor(lang: string): MindStrings {
  return LOCALES[lang.split('-')[0]] ?? en;
}

export function mergeMindStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, mindStringsFor(lang));
}
