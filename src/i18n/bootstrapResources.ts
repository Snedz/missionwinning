/**
 * Minimal EN strings for first paint (nav + Today lean + shared chrome).
 * Full catalogs hydrate async via hydrateI18nResources().
 */

import { BETA_EN } from '@/i18n/betaLocales';
import { GATED_WWW_HONESTY } from '@/lib/gatedWwwHonesty';

export const BOOTSTRAP_EN: Record<string, string> = {
  ...BETA_EN,
  // F-008 — first paint on /private + gated marketing CTA before hydrate.
  gateEyebrow: GATED_WWW_HONESTY.gateEyebrow,
  gateSubtitle: GATED_WWW_HONESTY.gateSubtitle,
  gateWedgeTeaser: GATED_WWW_HONESTY.gateWedgeTeaser,
  gateCheckingSession: GATED_WWW_HONESTY.gateCheckingSession,
  gateLoading: GATED_WWW_HONESTY.gateLoading,
  gateWaitlistTitle: GATED_WWW_HONESTY.gateWaitlistTitle,
  landingNavStartGated: GATED_WWW_HONESTY.landingNavStartGated,
  welcomeGateKicker: GATED_WWW_HONESTY.welcomeKicker,
  welcomeGateSubtitleBrief: GATED_WWW_HONESTY.welcomeSubtitleBrief,
  appName: 'Mission Winning',
  tagline: 'Train anywhere. Win daily.',
  infoBetaTitle: 'Start here',
  infoBetaSubtitleBrief: 'I-Day → first workout → Mission Coach. Start with the primary path.',
  infoBetaMoreSteps: 'What we need & more steps',
  infoBetaNeedTitle: 'What we need from you',
  infoSkipToday: 'Skip to Today',
  navToday: 'Today',
  navTrain: 'Train',
  navFuel: 'Fuel',
  navTrack: 'Track',
  navYou: 'You',
  navCoach: 'AI weekly plan',
  navBuilder: 'Builder',
  navLibrary: 'Library',
  navHistory: 'History',
  navServer: 'Garage',
  navMove: 'Move',
  navMind: 'Mind',
  navLearn: 'Learn',
  navBundle: 'Super Bundle',
  about: 'About',
  termsOfService: 'Terms',
  privacyPolicy: 'Privacy',
  navOurMission: 'Our mission',
  navBetaGuide: 'Beta guide',
  navSectionTrain: 'Train tools',
  navSectionRecover: 'Recover',
  navSectionLearn: 'Learn & measure',
  navSectionPremium: 'Premium',
  navBasicFocusHint: 'Basic Training focus — train tools first. More pillars unlock as you go.',
  welcomeBegin: 'Begin',
  welcomeSkipSignIn: 'Skip — start training',
  todayBasicEncouragement:
    'One step at a time. Log a set — Mission Coach shapes the week from your history.',
  todayHabitWeekCount: 'This week: {{count}} days logged',
  todayCoachInviteEyebrow: 'AI weekly plan',
  todayCoachInviteTitle: 'Generate a free week of Mission Coach',
  todayCoachInviteBody:
    'Adaptive plan from your gear and days/week — free every week, no API key required.',
  landingNavStart: 'Start free',
  landingFaqEyebrow: 'Straight answers',
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
  install: 'Install App (PWA)',
  signOut: 'Sign Out',
  language: 'Language',
};
