/**
 * Mission Rewards — progression from real training behavior.
 *
 * XP / ranks / badges decorate the habit loop. They never gate the free logger.
 * Daily streak punishment is intentionally *not* the boss signal — weekly train
 * goal is. See `.hermes/plans/2026-08-05_163500-full-launch-everything.md`.
 */

export type RewardActionId =
  | 'workout_finish'
  | 'weekly_train_goal'
  | 'fuel_day'
  | 'pillar_move'
  | 'pillar_mind'
  | 'pillar_track'
  | 'pillar_learn'
  | 'challenge_complete'
  | 'journey_first_workout'
  | 'journey_commissioned'
  | 'perfect_week_bonus';

export type BadgeId =
  | 'first_blood'
  | 'week_one'
  | 'consistent'
  | 'iron_25'
  | 'iron_100'
  | 'fuel_steady'
  | 'mobility_kept'
  | 'still_mind'
  | 'student'
  | 'challenge_cleared'
  | 'full_spectrum'
  | 'comeback'
  | 'commissioned';

export type BadgeRarity = 'common' | 'honor';

export type RewardEventKind =
  | { type: 'workout_finish'; workoutId: string; finishedAt: string; totalWorkoutsAfter: number }
  | { type: 'fuel_day'; dateKey: string }
  | { type: 'pillar_win'; winId: string; pillar: 'move' | 'mind' | 'track' | 'learn' }
  | { type: 'challenge_complete'; challengeId: string; weekStart: string }
  | { type: 'journey_first_workout' }
  | { type: 'journey_commissioned' }
  | { type: 'weekly_train_goal'; weekStart: string; sessionsThisWeek: number; goal: number }
  | { type: 'perfect_week'; weekStart: string };

export interface ChallengeMedal {
  challengeId: string;
  weekStart: string;
  earnedAt: string;
}

export interface RewardState {
  xpTotal: number;
  /** ISO week-start (local Monday) currently accumulating weekXp. */
  weekStart: string;
  weekXp: number;
  badges: BadgeId[];
  /** Idempotency keys — oldest dropped past CLAIMED_EVENT_CAP. */
  claimedEventIds: string[];
  challengeMedals: ChallengeMedal[];
  /** Local YYYY-MM-DD of last training day that earned workout XP (for comeback). */
  lastTrainDateKey?: string;
  /** How many distinct ISO weeks the weekly train goal was hit. */
  weeklyGoalWeeksHit: number;
}

export interface XpAward {
  action: RewardActionId;
  xp: number;
  capped: boolean;
}

export interface BadgeAward {
  id: BadgeId;
  rarity: BadgeRarity;
}

export interface ApplyResult {
  state: RewardState;
  xpAwards: XpAward[];
  badgeAwards: BadgeAward[];
  levelBefore: number;
  levelAfter: number;
  /** Total XP granted this apply (after caps). */
  xpGained: number;
}

export interface RankDef {
  level: number;
  /** Cumulative XP required to *reach* this level (level 1 = 0). */
  xpMin: number;
  titleKey: string;
  titleDefault: string;
}
