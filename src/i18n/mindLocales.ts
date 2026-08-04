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
  mindPremiumRetry: string;
  mindPreviewPlayer: string;
  mindLockedHint: string;
};

const en: MindStrings = {
  mindTitle: 'Mind & Recovery',
  mindSubtitle:
    'Free breathing timer and daily check-in. Premium unlocks guided meditations and sleep tools (Super Bundle).',
  mindRecentWins: 'Recent Mind Wins',
  mindPremiumTitle: 'Premium — Calm / Waking Up depth',
  mindPremiumDesc: 'Guided sessions, sleep stories, expert lessons on building resilience.',
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
  mindPremiumRetry: 'Try again',
  mindPreviewPlayer: 'Press play — timed cues walk you through each step',
  mindLockedHint:
    'Free tier includes 10 guided sessions. Premium adds 17 deeper timed sessions — focus, recovery, race calm, and travel resets.',
};

const es: MindStrings = {
  ...en,
  mindTitle: 'Mente y recuperación',
  mindSubtitle: 'Temporizador de respiración y check-in diario gratis. Premium desbloquea meditaciones guiadas.',
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
