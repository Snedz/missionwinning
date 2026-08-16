/**
 * Mission Rewards UI copy — merged into i18n `common` namespace.
 *
 * Extracted from `defaultValue`-only call sites (`.548`): the rewards surface
 * shipped in `.505`–`.531` with keys that existed in no catalog, so all 15
 * languages silently rendered English. Values here are the exact strings the
 * components carried; translations arrive as pack overlays.
 *
 * Interpolation names are deliberate: `count` is an i18next plural selector
 * (see feedbackLocales' `feedbackSheetRemaining`), so counters use plain names.
 */

type RewardsStrings = {
  rewardProfileTitle: string;
  rewardProfileShelfHint: string;
  rewardProfileRank: string;
  rewardProfileChallenges: string;
  rewardProfileEmpty: string;
  rewardHonor: string;
  rewardTodayTitle: string;
  rewardTodayRank: string;
  rewardTodayXpTotal: string;
  rewardLevelBar: string;
  rewardWeeklyGoal: string;
  rewardWeeklyGoalHint: string;
  rewardBadgeCount: string;
  rewardVictoryXp: string;
  rewardVictoryLevel: string;
  rewardVictoryBadges: string;
  rewardChallengeDone: string;
  rewardChallengeXpHint: string;
  /**
   * Rank titles, one per `RANKS` level in `rewards/catalog.ts`, plus the past-10
   * fallback. **These were authored nowhere until `.606`** — `catalog.ts` emitted
   * `titleKey: 'rewardRank1'` and the keys existed only in a stale committed
   * `public/locales/en/today.json`, so a fresh export dropped them and every
   * athlete outside English read their rank in English. Exactly `.252`'s
   * `coachWhySteadyWeek` defect: a key the app renders, present in the shipped
   * pack, defined in no source module. `rewardsKeyParity.test.ts` now derives the
   * required set from `RANKS` so a new level cannot ship without its title.
   */
  rewardRank1: string;
  rewardRank2: string;
  rewardRank3: string;
  rewardRank4: string;
  rewardRank5: string;
  rewardRank6: string;
  rewardRank7: string;
  rewardRank8: string;
  rewardRank9: string;
  rewardRank10: string;
  rewardRankMax: string;
  /**
   * Badge titles and descriptions, one pair per `BADGE_DEFS` entry. Same `.606`
   * repair as the ranks above: `catalog.ts` emitted all 26 keys, no catalog
   * defined any of them, and they survived only in a stale committed export —
   * so every badge an athlete earned read in English in all fifteen languages.
   */
  rewardBadgeFirstBlood: string;
  rewardBadgeFirstBloodDesc: string;
  rewardBadgeWeekOne: string;
  rewardBadgeWeekOneDesc: string;
  rewardBadgeConsistent: string;
  rewardBadgeConsistentDesc: string;
  rewardBadgeIron25: string;
  rewardBadgeIron25Desc: string;
  rewardBadgeIron100: string;
  rewardBadgeIron100Desc: string;
  rewardBadgeFuelSteady: string;
  rewardBadgeFuelSteadyDesc: string;
  rewardBadgeMobility: string;
  rewardBadgeMobilityDesc: string;
  rewardBadgeStillMind: string;
  rewardBadgeStillMindDesc: string;
  rewardBadgeStudent: string;
  rewardBadgeStudentDesc: string;
  rewardBadgeChallenge: string;
  rewardBadgeChallengeDesc: string;
  rewardBadgeSpectrum: string;
  rewardBadgeSpectrumDesc: string;
  rewardBadgeComeback: string;
  rewardBadgeComebackDesc: string;
  rewardBadgeCommissioned: string;
  rewardBadgeCommissionedDesc: string;
  /** `.610` — the Athlete Card. Picks-from-sets identity; no free text, no uploads. */
  athleteCardTitle: string;
  athleteCardPreviewEmpty: string;
  athleteCardEdit: string;
  athleteCardBody: string;
  athleteCardPreviewKicker: string;
  athleteCardPreviewFrame: string;
  athleteCardFrame: string;
  athleteCardBackdrop: string;
  athleteCardBadges: string;
  athleteCardShare: string;
  athleteCardSharing: string;
  athleteCardShareText: string;
  athleteCardPrivacy: string;
  rewardRestToday: string;
  rewardRestTodayOn: string;
};

const en: RewardsStrings = {
  athleteCardTitle: 'Your card',
  athleteCardPreviewEmpty: 'Log a session and the card fills from your record.',
  athleteCardEdit: 'Edit card',
  athleteCardBody: 'Training unlocks more of the card.',
  athleteCardPreviewKicker: 'On the path',
  athleteCardPreviewFrame: '{{frame}} · {{backdrop}}',
  athleteCardFrame: 'Frame',
  athleteCardBackdrop: 'Backdrop',
  athleteCardBadges: 'Badges — pick up to {{slots}}',
  athleteCardShare: 'Share your card',
  athleteCardSharing: 'Preparing…',
  athleteCardShareText: 'On the path.',
  athleteCardPrivacy: 'Rendered on this device and shared only if you send it. Nothing is uploaded.',
  rewardProfileTitle: 'Badges',
  rewardProfileShelfHint: 'Earned from logs on this device. Not a ranking.',
  rewardProfileRank: 'Level {{level}} · {{rank}} · {{xp}} XP',
  rewardProfileChallenges: '{{done}}/{{total}} weekly challenges met',
  rewardProfileEmpty: 'Log workouts and pillar wins to earn badges. Free forever.',
  rewardHonor: 'Honor',
  rewardTodayTitle: 'Mission progress',
  rewardTodayRank: 'Level {{level}} · {{rank}}',
  rewardTodayXpTotal: ' · {{xp}} XP',
  rewardLevelBar: 'Next level',
  rewardWeeklyGoal: 'Weekly train goal',
  rewardWeeklyGoalHint: 'Hit your weekly sessions — rest days are part of the plan.',
  rewardBadgeCount: '{{n}} badges earned',
  rewardVictoryXp: '+{{xp}} XP',
  rewardVictoryLevel: ' · Level {{level}}',
  rewardVictoryBadges: ' · {{names}}',
  rewardChallengeDone: 'Done',
  rewardChallengeXpHint: ' · +{{xp}} XP earned',
  rewardRank1: 'Pathfinder',
  rewardRank2: 'Regular',
  rewardRank3: 'Operator',
  rewardRank4: 'Steady Hand',
  rewardRank5: 'Path Keeper',
  rewardRank6: 'Mission Ready',
  rewardRank7: 'Field Guide',
  rewardRank8: 'Iron Path',
  rewardRank9: 'Long Haul',
  rewardRank10: 'Lifelong',
  rewardRankMax: 'Lifelong',
  rewardBadgeFirstBlood: 'First Blood',
  rewardBadgeFirstBloodDesc: 'Finished your first workout.',
  rewardBadgeWeekOne: 'Week One',
  rewardBadgeWeekOneDesc: 'Three sessions in your first seven days.',
  rewardBadgeConsistent: 'Consistent',
  rewardBadgeConsistentDesc: 'Hit your weekly train goal four separate weeks.',
  rewardBadgeIron25: 'Iron Log 25',
  rewardBadgeIron25Desc: 'Twenty-five finished workouts.',
  rewardBadgeIron100: 'Iron Log 100',
  rewardBadgeIron100Desc: 'One hundred finished workouts.',
  rewardBadgeFuelSteady: 'Fuel Steady',
  rewardBadgeFuelSteadyDesc: 'Seven fuel days logged.',
  rewardBadgeMobility: 'Mobility Kept',
  rewardBadgeMobilityDesc: 'Eight Move wins.',
  rewardBadgeStillMind: 'Still Mind',
  rewardBadgeStillMindDesc: 'Eight Mind sessions.',
  rewardBadgeStudent: 'Student',
  rewardBadgeStudentDesc: 'Ten Learn wins.',
  rewardBadgeChallenge: 'Challenge Cleared',
  rewardBadgeChallengeDesc: 'Completed a weekly challenge.',
  rewardBadgeSpectrum: 'Full Spectrum',
  rewardBadgeSpectrumDesc: 'Train plus every other pillar in one week.',
  rewardBadgeComeback: 'Comeback',
  rewardBadgeComebackDesc: 'Trained again after a week or more away.',
  rewardBadgeCommissioned: 'Commissioned',
  rewardBadgeCommissionedDesc: 'Completed the Mission Journey path.',
  rewardRestToday: 'Rest today',
  rewardRestTodayOn: 'Rest today is planned',
};

const LOCALES: Partial<Record<string, Partial<RewardsStrings>>> = {};

export function rewardsStringsFor(lang: string): RewardsStrings {
  const code = lang.split('-')[0];
  return { ...en, ...(LOCALES[code] ?? {}) };
}

export function mergeRewardsStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, rewardsStringsFor(lang));
}

export type { RewardsStrings };
