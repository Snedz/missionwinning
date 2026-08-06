/**
 * Mission Rewards UI copy — merged into i18n `common` namespace.
 *
 * Extracted from `defaultValue`-only call sites (`.545`): the rewards surface
 * shipped in `.505`–`.531` with keys that existed in no catalog, so all 15
 * languages silently rendered English. Values here are the exact strings the
 * components carried; translations arrive as pack overlays.
 *
 * Interpolation names are deliberate: `count` is an i18next plural selector
 * (see feedbackLocales' `feedbackSheetRemaining`), so counters use plain names.
 */

type RewardsStrings = {
  rewardProfileTitle: string;
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
};

const en: RewardsStrings = {
  rewardProfileTitle: 'Badges & rank',
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
