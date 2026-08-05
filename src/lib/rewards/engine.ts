import {
  BADGE_DEFS,
  CLAIMED_EVENT_CAP,
  DAILY_ACTION_CAPS,
  DAILY_XP_SOFT_CAP,
  XP_BY_ACTION,
  badgeDef,
  levelForXp,
} from '@/lib/rewards/catalog';
import type {
  ApplyResult,
  BadgeAward,
  BadgeId,
  RewardActionId,
  RewardEventKind,
  RewardState,
  XpAward,
} from '@/lib/rewards/types';
import { localDateKey, localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

export function emptyRewardState(now = new Date()): RewardState {
  return {
    xpTotal: 0,
    weekStart: localWeekKey(now),
    weekXp: 0,
    badges: [],
    claimedEventIds: [],
    challengeMedals: [],
    weeklyGoalWeeksHit: 0,
    pillarWins: {},
  };
}

/** Roll weekXp when the calendar week advances. */
export function rollWeekIfNeeded(state: RewardState, now = new Date()): RewardState {
  const weekStart = localWeekKey(now);
  if (state.weekStart === weekStart) return state;
  return { ...state, weekStart, weekXp: 0 };
}

function eventId(event: RewardEventKind): string {
  switch (event.type) {
    case 'workout_finish':
      return `workout:${event.workoutId}`;
    case 'fuel_day':
      return `fuel:${event.dateKey}`;
    case 'pillar_win':
      return `pillar:${event.winId}`;
    case 'challenge_complete':
      return `challenge:${event.weekStart}:${event.challengeId}`;
    case 'journey_first_workout':
      return 'journey:first_workout';
    case 'journey_commissioned':
      return 'journey:commissioned';
    case 'weekly_train_goal':
      return `weekly_goal:${event.weekStart}`;
    case 'perfect_week':
      return `perfect_week:${event.weekStart}`;
    default: {
      const _exhaustive: never = event;
      return String(_exhaustive);
    }
  }
}

function actionForEvent(event: RewardEventKind): RewardActionId {
  switch (event.type) {
    case 'workout_finish':
      return 'workout_finish';
    case 'fuel_day':
      return 'fuel_day';
    case 'pillar_win':
      if (event.pillar === 'move') return 'pillar_move';
      if (event.pillar === 'mind') return 'pillar_mind';
      if (event.pillar === 'track') return 'pillar_track';
      return 'pillar_learn';
    case 'challenge_complete':
      return 'challenge_complete';
    case 'journey_first_workout':
      return 'journey_first_workout';
    case 'journey_commissioned':
      return 'journey_commissioned';
    case 'weekly_train_goal':
      return 'weekly_train_goal';
    case 'perfect_week':
      return 'perfect_week_bonus';
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

function dayKeyForEvent(event: RewardEventKind): string {
  switch (event.type) {
    case 'workout_finish':
      return localDateKeyFromIso(event.finishedAt);
    case 'fuel_day':
      return event.dateKey;
    case 'pillar_win':
    case 'journey_first_workout':
    case 'journey_commissioned':
    case 'challenge_complete':
    case 'weekly_train_goal':
    case 'perfect_week':
      return localDateKey();
    default: {
      const _exhaustive: never = event;
      return String(_exhaustive);
    }
  }
}

/**
 * Count how many times `action` already earned XP today from claimed ids.
 * Claimed ids for capped actions use suffix `@YYYY-MM-DD` when stored via grantXp.
 */
function countActionOnDay(claimed: string[], action: RewardActionId, day: string): number {
  const prefix = `xp:${action}@${day}`;
  return claimed.filter((id) => id === prefix || id.startsWith(`${prefix}#`)).length;
}

function pushClaimed(claimed: string[], id: string): string[] {
  const next = claimed.includes(id) ? claimed : [...claimed, id];
  if (next.length <= CLAIMED_EVENT_CAP) return next;
  return next.slice(next.length - CLAIMED_EVENT_CAP);
}

function grantXp(
  state: RewardState,
  action: RewardActionId,
  day: string,
  xpAwards: XpAward[]
): RewardState {
  const base = XP_BY_ACTION[action];
  const dayCap = DAILY_ACTION_CAPS[action];
  let xp = base;
  let capped = false;

  if (dayCap != null) {
    const used = countActionOnDay(state.claimedEventIds, action, day);
    if (used >= dayCap) {
      xpAwards.push({ action, xp: 0, capped: true });
      return state;
    }
  }

  // Soft daily total from weekXp is week-scoped; track day soft cap via claimed markers.
  const daySoftUsed = state.claimedEventIds
    .filter((id) => id.startsWith('dayxp:'))
    .map((id) => {
      const m = /^dayxp:(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(id);
      if (!m || m[1] !== day) return 0;
      return parseInt(m[2]!, 10) || 0;
    })
    .reduce((a, b) => a + b, 0);

  if (daySoftUsed >= DAILY_XP_SOFT_CAP) {
    xpAwards.push({ action, xp: 0, capped: true });
    return state;
  }
  if (daySoftUsed + xp > DAILY_XP_SOFT_CAP) {
    xp = DAILY_XP_SOFT_CAP - daySoftUsed;
    capped = true;
  }

  const usedBefore = countActionOnDay(state.claimedEventIds, action, day);
  const xpClaimId = `xp:${action}@${day}#${usedBefore}`;
  const softId = `dayxp:${day}:${daySoftUsed + xp}`;

  xpAwards.push({ action, xp, capped });
  return {
    ...state,
    xpTotal: state.xpTotal + xp,
    weekXp: state.weekXp + xp,
    claimedEventIds: pushClaimed(pushClaimed(state.claimedEventIds, xpClaimId), softId),
  };
}

function grantBadge(state: RewardState, id: BadgeId, badgeAwards: BadgeAward[]): RewardState {
  if (state.badges.includes(id)) return state;
  const def = badgeDef(id);
  badgeAwards.push({ id, rarity: def.rarity });
  return { ...state, badges: [...state.badges, id] };
}

function countClaimedFuelDays(claimed: string[]): number {
  return claimed.filter((id) => /^fuel:\d{4}-\d{2}-\d{2}$/.test(id)).length;
}

/** After fuel/pillar XP — grant lifetime milestone badges. */
function grantMilestoneBadges(
  state: RewardState,
  badgeAwards: BadgeAward[],
  opts: { afterFuel?: boolean; afterPillar?: 'move' | 'mind' | 'track' | 'learn' }
): RewardState {
  let next = state;
  if (opts.afterFuel && countClaimedFuelDays(next.claimedEventIds) >= 7) {
    next = grantBadge(next, 'fuel_steady', badgeAwards);
  }
  if (opts.afterPillar) {
    const counts = { ...next.pillarWins };
    counts[opts.afterPillar] = (counts[opts.afterPillar] ?? 0) + 1;
    next = { ...next, pillarWins: counts };
    if ((counts.move ?? 0) >= 8) next = grantBadge(next, 'mobility_kept', badgeAwards);
    if ((counts.mind ?? 0) >= 8) next = grantBadge(next, 'still_mind', badgeAwards);
    if ((counts.learn ?? 0) >= 10) next = grantBadge(next, 'student', badgeAwards);
  }
  return next;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const aDate = Date.UTC(ay!, am! - 1, ad!);
  const bDate = Date.UTC(by!, bm! - 1, bd!);
  return Math.round((bDate - aDate) / 86_400_000);
}

/**
 * Apply one reward event. Pure — no I/O.
 * Idempotent on event id: re-applying the same workout/challenge is a no-op.
 */
export function applyRewardEvent(stateIn: RewardState, event: RewardEventKind, now = new Date()): ApplyResult {
  let state = rollWeekIfNeeded(stateIn, now);
  const levelBefore = levelForXp(state.xpTotal);
  const xpAwards: XpAward[] = [];
  const badgeAwards: BadgeAward[] = [];
  const id = eventId(event);

  if (state.claimedEventIds.includes(id)) {
    return {
      state,
      xpAwards: [],
      badgeAwards: [],
      levelBefore,
      levelAfter: levelBefore,
      xpGained: 0,
    };
  }

  const action = actionForEvent(event);
  const day = dayKeyForEvent(event);

  // Weekly goal only awards when met — do not claim the id while under goal
  // so a later session in the same week can still unlock it.
  if (event.type === 'weekly_train_goal') {
    if (event.sessionsThisWeek < event.goal) {
      return {
        state,
        xpAwards: [],
        badgeAwards: [],
        levelBefore,
        levelAfter: levelBefore,
        xpGained: 0,
      };
    }
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = { ...state, weeklyGoalWeeksHit: state.weeklyGoalWeeksHit + 1 };
    if (state.weeklyGoalWeeksHit >= 4) {
      state = grantBadge(state, 'consistent', badgeAwards);
    }
  } else if (event.type === 'challenge_complete') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = {
      ...state,
      challengeMedals: [
        { challengeId: event.challengeId, weekStart: event.weekStart, earnedAt: now.toISOString() },
        ...state.challengeMedals,
      ].slice(0, 40),
    };
    state = grantBadge(state, 'challenge_cleared', badgeAwards);
  } else if (event.type === 'workout_finish') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    // Comeback before updating lastTrainDateKey.
    if (state.lastTrainDateKey) {
      const gap = daysBetween(state.lastTrainDateKey, day);
      if (gap >= 7) {
        state = grantBadge(state, 'comeback', badgeAwards);
      }
    }
    state = grantXp(state, action, day, xpAwards);
    state = { ...state, lastTrainDateKey: day };

    if (event.totalWorkoutsAfter === 1) {
      state = grantBadge(state, 'first_blood', badgeAwards);
    }
    if (event.totalWorkoutsAfter >= 3 && !state.badges.includes('week_one')) {
      // Caller may also send journey_first; week_one is lifetime session count ≥3.
      state = grantBadge(state, 'week_one', badgeAwards);
    }
    if (event.totalWorkoutsAfter >= 25) {
      state = grantBadge(state, 'iron_25', badgeAwards);
    }
    if (event.totalWorkoutsAfter >= 100) {
      state = grantBadge(state, 'iron_100', badgeAwards);
    }
  } else if (event.type === 'journey_commissioned') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = grantBadge(state, 'commissioned', badgeAwards);
  } else if (event.type === 'journey_first_workout') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = grantBadge(state, 'first_blood', badgeAwards);
  } else if (event.type === 'fuel_day') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = grantMilestoneBadges(state, badgeAwards, { afterFuel: true });
  } else if (event.type === 'pillar_win') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = grantMilestoneBadges(state, badgeAwards, { afterPillar: event.pillar });
  } else if (event.type === 'perfect_week') {
    state = { ...state, claimedEventIds: pushClaimed(state.claimedEventIds, id) };
    state = grantXp(state, action, day, xpAwards);
    state = grantBadge(state, 'full_spectrum', badgeAwards);
  }

  const xpGained = xpAwards.reduce((s, a) => s + a.xp, 0);
  const levelAfter = levelForXp(state.xpTotal);

  // Silence unused import if tree-shaken oddly — keep BADGE_DEFS referenced for exhaustiveness in tests.
  void BADGE_DEFS.length;

  return { state, xpAwards, badgeAwards, levelBefore, levelAfter, xpGained };
}

/** Apply a sequence; useful for workout finish + derived challenge clears. */
export function applyRewardEvents(
  stateIn: RewardState,
  events: RewardEventKind[],
  now = new Date()
): ApplyResult {
  let state = stateIn;
  const xpAwards: XpAward[] = [];
  const badgeAwards: BadgeAward[] = [];
  const levelBefore = levelForXp(rollWeekIfNeeded(state, now).xpTotal);
  let xpGained = 0;

  for (const event of events) {
    const r = applyRewardEvent(state, event, now);
    state = r.state;
    xpAwards.push(...r.xpAwards);
    badgeAwards.push(...r.badgeAwards);
    xpGained += r.xpGained;
  }

  return {
    state,
    xpAwards,
    badgeAwards,
    levelBefore,
    levelAfter: levelForXp(state.xpTotal),
    xpGained,
  };
}
