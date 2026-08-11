import type { BadgeId, BadgeRarity, RankDef, RewardActionId } from '@/lib/rewards/types';

/** Soft cap so multi-pillar grinding cannot skip ranks in a day. */
export const DAILY_XP_SOFT_CAP = 200;

/** Claimed-event ring size — enough for months of daily play without bloat. */
export const CLAIMED_EVENT_CAP = 400;

export const XP_BY_ACTION: Record<RewardActionId, number> = {
  workout_finish: 45,
  weekly_train_goal: 100,
  fuel_day: 15,
  pillar_move: 15,
  pillar_mind: 15,
  pillar_track: 15,
  pillar_learn: 20,
  challenge_complete: 75,
  /** Stacks with workout_finish on session 1 — keep first week under level 2. */
  journey_first_workout: 30,
  journey_commissioned: 200,
  perfect_week_bonus: 50,
};

/** Per-calendar-day caps (in addition to the soft total). */
export const DAILY_ACTION_CAPS: Partial<Record<RewardActionId, number>> = {
  workout_finish: 2,
  fuel_day: 1,
  pillar_move: 2,
  pillar_mind: 2,
  pillar_track: 2,
  pillar_learn: 3,
};

export interface BadgeDef {
  id: BadgeId;
  rarity: BadgeRarity;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
}

/** Public path for badge medallion art (SVG). */
export function badgeIconPath(id: BadgeId): string {
  return `/rewards/badges/${id}.svg`;
}

export const BADGE_DEFS: readonly BadgeDef[] = [
  {
    id: 'first_blood',
    rarity: 'honor',
    titleKey: 'rewardBadgeFirstBlood',
    titleDefault: 'First Blood',
    descKey: 'rewardBadgeFirstBloodDesc',
    descDefault: 'Finished your first workout.',
  },
  {
    id: 'week_one',
    rarity: 'common',
    titleKey: 'rewardBadgeWeekOne',
    titleDefault: 'Week One',
    descKey: 'rewardBadgeWeekOneDesc',
    descDefault: 'Three sessions in your first seven days.',
  },
  {
    id: 'consistent',
    rarity: 'honor',
    titleKey: 'rewardBadgeConsistent',
    titleDefault: 'Consistent',
    descKey: 'rewardBadgeConsistentDesc',
    descDefault: 'Hit your weekly train goal four separate weeks.',
  },
  {
    id: 'iron_25',
    rarity: 'common',
    titleKey: 'rewardBadgeIron25',
    titleDefault: 'Iron Log 25',
    descKey: 'rewardBadgeIron25Desc',
    descDefault: 'Twenty-five finished workouts.',
  },
  {
    id: 'iron_100',
    rarity: 'honor',
    titleKey: 'rewardBadgeIron100',
    titleDefault: 'Iron Log 100',
    descKey: 'rewardBadgeIron100Desc',
    descDefault: 'One hundred finished workouts.',
  },
  {
    id: 'fuel_steady',
    rarity: 'common',
    titleKey: 'rewardBadgeFuelSteady',
    titleDefault: 'Fuel Steady',
    descKey: 'rewardBadgeFuelSteadyDesc',
    descDefault: 'Seven fuel days logged.',
  },
  {
    id: 'mobility_kept',
    rarity: 'common',
    titleKey: 'rewardBadgeMobility',
    titleDefault: 'Mobility Kept',
    descKey: 'rewardBadgeMobilityDesc',
    descDefault: 'Eight Move wins.',
  },
  {
    id: 'still_mind',
    rarity: 'common',
    titleKey: 'rewardBadgeStillMind',
    titleDefault: 'Still Mind',
    descKey: 'rewardBadgeStillMindDesc',
    descDefault: 'Eight Mind sessions.',
  },
  {
    id: 'student',
    rarity: 'common',
    titleKey: 'rewardBadgeStudent',
    titleDefault: 'Student',
    descKey: 'rewardBadgeStudentDesc',
    descDefault: 'Ten Learn wins.',
  },
  {
    id: 'challenge_cleared',
    rarity: 'common',
    titleKey: 'rewardBadgeChallenge',
    titleDefault: 'Challenge Cleared',
    descKey: 'rewardBadgeChallengeDesc',
    descDefault: 'Completed a weekly challenge.',
  },
  {
    id: 'full_spectrum',
    rarity: 'honor',
    titleKey: 'rewardBadgeSpectrum',
    titleDefault: 'Full Spectrum',
    descKey: 'rewardBadgeSpectrumDesc',
    descDefault: 'Train plus every other pillar in one week.',
  },
  {
    id: 'comeback',
    rarity: 'honor',
    titleKey: 'rewardBadgeComeback',
    titleDefault: 'Comeback',
    descKey: 'rewardBadgeComebackDesc',
    descDefault: 'Trained again after a week or more away.',
  },
  {
    id: 'commissioned',
    rarity: 'honor',
    titleKey: 'rewardBadgeCommissioned',
    titleDefault: 'Commissioned',
    descKey: 'rewardBadgeCommissionedDesc',
    descDefault: 'Completed the Mission Journey path.',
  },
] as const;

const BADGE_BY_ID = Object.fromEntries(BADGE_DEFS.map((b) => [b.id, b])) as Record<
  BadgeId,
  BadgeDef
>;

export function badgeDef(id: BadgeId): BadgeDef {
  return BADGE_BY_ID[id];
}

/**
 * Civilian-friendly ranks with light mission flavor.
 * Level N requires xpMin cumulative XP (inclusive).
 */
export const RANKS: readonly RankDef[] = [
  { level: 1, xpMin: 0, titleKey: 'rewardRank1', titleDefault: 'Pathfinder' },
  { level: 2, xpMin: 150, titleKey: 'rewardRank2', titleDefault: 'Regular' },
  { level: 3, xpMin: 250, titleKey: 'rewardRank3', titleDefault: 'Operator' },
  { level: 4, xpMin: 500, titleKey: 'rewardRank4', titleDefault: 'Steady Hand' },
  { level: 5, xpMin: 900, titleKey: 'rewardRank5', titleDefault: 'Path Keeper' },
  { level: 6, xpMin: 1400, titleKey: 'rewardRank6', titleDefault: 'Mission Ready' },
  { level: 7, xpMin: 2100, titleKey: 'rewardRank7', titleDefault: 'Field Guide' },
  { level: 8, xpMin: 3000, titleKey: 'rewardRank8', titleDefault: 'Iron Path' },
  { level: 9, xpMin: 4200, titleKey: 'rewardRank9', titleDefault: 'Long Haul' },
  { level: 10, xpMin: 5800, titleKey: 'rewardRank10', titleDefault: 'Lifelong' },
] as const;

export function levelForXp(xpTotal: number): number {
  let level = 1;
  for (const r of RANKS) {
    if (xpTotal >= r.xpMin) level = r.level;
  }
  // Beyond table: +1 level every 2000 XP past last rank.
  const last = RANKS[RANKS.length - 1]!;
  if (xpTotal >= last.xpMin) {
    const extra = Math.floor((xpTotal - last.xpMin) / 2000);
    return last.level + extra;
  }
  return level;
}

export function rankForLevel(level: number): RankDef {
  if (level <= RANKS.length) {
    return RANKS[Math.max(0, level - 1)]!;
  }
  const last = RANKS[RANKS.length - 1]!;
  return {
    level,
    xpMin: last.xpMin + (level - last.level) * 2000,
    titleKey: 'rewardRankMax',
    titleDefault: 'Lifelong',
  };
}

/** XP progress within the current level → next (0–1). */
export function levelProgress(xpTotal: number): { level: number; into: number; need: number; ratio: number } {
  const level = levelForXp(xpTotal);
  const cur = rankForLevel(level);
  const next = rankForLevel(level + 1);
  const into = Math.max(0, xpTotal - cur.xpMin);
  const need = Math.max(1, next.xpMin - cur.xpMin);
  return { level, into, need, ratio: Math.min(1, into / need) };
}
