import { levelForXp, levelProgress, rankForLevel } from '@/lib/rewards/catalog';
import { loadRewardState } from '@/lib/rewards/storage';
import type { BadgeId, RewardState } from '@/lib/rewards/types';
import { BADGE_DEFS } from '@/lib/rewards/catalog';
import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { getChallengeProgress } from '@/lib/challenges';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

export type RewardsSummary = {
  xpTotal: number;
  weekXp: number;
  level: number;
  rankTitleDefault: string;
  rankTitleKey: string;
  levelInto: number;
  levelNeed: number;
  levelRatio: number;
  badges: BadgeId[];
  weeklyTrainGoal: number;
  weeklyTrainCurrent: number;
  weeklyTrainPercent: number;
  challengesComplete: number;
  challengesTotal: number;
};

export function summarizeRewards(
  workoutHistory: CompletedWorkoutLog[] = [],
  state: RewardState = loadRewardState()
): RewardsSummary {
  const level = levelForXp(state.xpTotal);
  const rank = rankForLevel(level);
  const prog = levelProgress(state.xpTotal);
  const weekStart = localWeekKey();
  const weeklyTrainGoal = loadDaysPerWeek();
  const weeklyTrainCurrent = workoutHistory.filter(
    (w) => localDateKeyFromIso(w.completedAt) >= weekStart
  ).length;
  const challenges = getChallengeProgress();
  const challengesComplete = challenges.filter((c) => c.current >= c.target).length;

  return {
    xpTotal: state.xpTotal,
    weekXp: state.weekXp,
    level,
    rankTitleDefault: rank.titleDefault,
    rankTitleKey: rank.titleKey,
    levelInto: prog.into,
    levelNeed: prog.need,
    levelRatio: prog.ratio,
    badges: state.badges,
    weeklyTrainGoal,
    weeklyTrainCurrent,
    weeklyTrainPercent: Math.min(
      100,
      Math.round((weeklyTrainCurrent / Math.max(1, weeklyTrainGoal)) * 100)
    ),
    challengesComplete,
    challengesTotal: challenges.length,
  };
}

export function ownedBadgeDefs(badgeIds: BadgeId[]) {
  const set = new Set(badgeIds);
  return BADGE_DEFS.filter((b) => set.has(b.id));
}
