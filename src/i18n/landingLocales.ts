/** Landing / marketing page copy — merged into i18n `common` namespace. */

const LANDING_EN: Record<string, string> = {
  landingNavPath: 'The path',
  landingNavPillars: 'Pillars',
  landingNavBundle: 'Super Bundle',
  landingNavStart: 'Start free',
  landingHeroEyebrow: 'Free core forever · Global PWA',
  landingHeroTitle1: 'Train anywhere.',
  landingHeroTitle2: 'Win daily.',
  landingHeroSubtitle:
    'The free health everything app — workout tracking, nutrition, mobility, mind, activity, and learning scored together. No store. No paywall on the core.',
  landingCtaStart: 'Start your path',
  landingCtaBundle: 'Super Bundle',
  landingJourneyTitle: 'The member path',
  landingJourneyPhase0Name: 'I-Day',
  landingJourneyPhase0Desc:
    'Three questions — experience, equipment, goal. No account needed. Under three minutes.',
  landingJourneyPhase1Name: 'Basic Training',
  landingJourneyPhase1Desc:
    'One small win in each pillar: first workout, first meal logged, first flow, first breath, first lesson.',
  landingJourneyPhase2Name: 'Readiness',
  landingJourneyPhase2Desc:
    'A health screen, your baseline Win Score, and a seven-day streak. Standards before speed.',
  landingJourneyPhase3Name: 'Commissioned',
  landingJourneyPhase3Desc:
    'Today becomes your command center. One clear action every day, scored across all six pillars.',
  landingFaqFreeQ: 'Is the free version actually complete?',
  landingFaqFreeA:
    'Yes. The workout tracker, exercise library, program templates, nutrition log, scores, streaks, and leaderboards are free forever, with no account required.',
  landingFaqOfflineQ: 'Does it work offline, in my country, in my language?',
  landingFaqOfflineA:
    'Mission Winning is an installable web app that runs in any modern browser and keeps the core working offline.',
  landingFaqBundleQ: 'What is the Super Bundle?',
  landingFaqBundleA:
    'One subscription that unlocks premium depth across all six pillars — training plans, deep nutrition, mobility, mind, tracking, and specialist programs.',
  landingFaqWhoQ: 'Who is this for?',
  landingFaqWhoA:
    'Anyone who wants a disciplined, evidence-based path — from a garage gym to a park with only floor space.',
};

const LANDING_ES: Record<string, string> = {
  ...LANDING_EN,
  landingNavPath: 'El camino',
  landingNavPillars: 'Pilares',
  landingNavStart: 'Empezar gratis',
  landingHeroTitle1: 'Entrena en cualquier lugar.',
  landingHeroTitle2: 'Gana a diario.',
  landingCtaStart: 'Comienza tu camino',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: LANDING_EN,
  es: LANDING_ES,
};

export function landingStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? BY_LANG.en;
}

export function mergeLandingStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, landingStringsFor(lang));
}

export const LANDING_JOURNEY_KEYS = [
  { phase: 'Phase 0', nameKey: 'landingJourneyPhase0Name', descKey: 'landingJourneyPhase0Desc' },
  { phase: 'Phase 1', nameKey: 'landingJourneyPhase1Name', descKey: 'landingJourneyPhase1Desc' },
  { phase: 'Phase 2', nameKey: 'landingJourneyPhase2Name', descKey: 'landingJourneyPhase2Desc' },
  { phase: 'Phase 3', nameKey: 'landingJourneyPhase3Name', descKey: 'landingJourneyPhase3Desc' },
] as const;

export const LANDING_FAQ_KEYS = [
  { qKey: 'landingFaqFreeQ', aKey: 'landingFaqFreeA' },
  { qKey: 'landingFaqOfflineQ', aKey: 'landingFaqOfflineA' },
  { qKey: 'landingFaqBundleQ', aKey: 'landingFaqBundleA' },
  { qKey: 'landingFaqWhoQ', aKey: 'landingFaqWhoA' },
] as const;
