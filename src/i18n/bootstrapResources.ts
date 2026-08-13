/**
 * Minimal EN strings for first paint (nav + Today lean + shared chrome).
 * Full catalogs hydrate async via hydrateI18nResources().
 */

import { BETA_EN } from '@/i18n/betaLocales';

export const BOOTSTRAP_EN: Record<string, string> = {
  ...BETA_EN,
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
  /*
   * `.746` — these three keys live **only** here, so `BOOTSTRAP_EN` is not the
   * first-paint value, it is the only value: the mount sites' `defaultValue`s
   * ("Mission Coach", "Turn your logs into this week's plan") have never once
   * rendered. The eyebrow above Today's Coach invite therefore read "AI weekly
   * plan" permanently, and the body advertised the absence of an API key.
   *
   * East Asia shard (mission-ops #13) scored coach-from-logs clarity 2.56/5 —
   * the lowest item — from an AI-skeptical cohort, diagnosed as "coach output
   * has no log-derived labels". Naming the technology instead of the evidence is
   * the copy equivalent of that defect, so these now match their call sites and
   * a `CoachLogCite` line underneath names the actual log.
   */
  todayCoachInviteEyebrow: 'Mission Coach',
  todayCoachInviteTitle: 'Turn your logs into this week’s plan',
  todayCoachInviteBody: 'Built from your gear and days per week — free every week.',
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
