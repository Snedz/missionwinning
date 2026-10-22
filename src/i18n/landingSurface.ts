/**
 * FAQ and journey key lists for the landing page.
 *
 * These live apart from `landingLocales.ts` on purpose. That module indexes
 * every language through `BY_LANG` and spreads `LANDING_EN`, so a client
 * import of any export ships every pack. The landing accordion only needs
 * these keys; translated strings arrive later through `hydrateResources`.
 */

import { isFreeBeta } from '@/lib/freeBeta';

export const LANDING_JOURNEY_KEYS = [
  { phase: 'Phase 0', nameKey: 'landingJourneyPhase0Name', descKey: 'landingJourneyPhase0Desc' },
  { phase: 'Phase 1', nameKey: 'landingJourneyPhase1Name', descKey: 'landingJourneyPhase1Desc' },
  { phase: 'Phase 2', nameKey: 'landingJourneyPhase2Name', descKey: 'landingJourneyPhase2Desc' },
  { phase: 'Phase 3', nameKey: 'landingJourneyPhase3Name', descKey: 'landingJourneyPhase3Desc' },
] as const;

export const LANDING_FAQ_KEYS = [
  {
    qKey: 'landingFaqFreeQ',
    aKey: 'landingFaqFreeA',
    qDefault: 'Is the free version actually complete?',
    aDefault:
      'Yes. The workout tracker, exercise library, program templates, nutrition log, scores, streaks, and leaderboards are free forever, with no account required.',
  },
  {
    qKey: 'landingFaqOfflineQ',
    aKey: 'landingFaqOfflineA',
    qDefault: 'Does it work offline, in my country, in my language?',
    aDefault:
      'Mission Winning is an installable web app that runs in any modern browser and keeps the core working offline.',
  },
  {
    qKey: 'landingFaqBundleQ',
    aKey: 'landingFaqBundleA',
    qDefault: 'What is the Super Bundle?',
    aDefault:
      'One subscription that unlocks premium depth across all six pillars — training plans, deep nutrition, mobility, mind, tracking, and specialist programs.',
  },
  {
    qKey: 'landingFaqWhoQ',
    aKey: 'landingFaqWhoA',
    qDefault: 'Who is this for?',
    aDefault:
      'Anyone who wants a disciplined, evidence-based path — from a garage gym to a park with only floor space.',
  },
] as const;

/**
 * FAQ keys for landing UI + FAQPage JSON-LD.
 * Free beta drops Super Bundle merch so schema matches the visible accordion.
 */
export function landingFaqKeysForSurface(): (typeof LANDING_FAQ_KEYS)[number][] {
  if (isFreeBeta()) {
    return LANDING_FAQ_KEYS.filter((f) => f.qKey !== 'landingFaqBundleQ');
  }
  return [...LANDING_FAQ_KEYS];
}
