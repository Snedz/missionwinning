/**
 * Side-effecting apply helpers — load → pure engine → save → remember awards.
 */

import { loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { getChallengeProgress } from '@/lib/challenges';
import { applyRewardEvent, applyRewardEvents } from '@/lib/rewards/engine';
import {
  loadRewardState,
  rememberLastAwards,
  saveRewardState,
} from '@/lib/rewards/storage';
import type { ApplyResult, RewardEventKind } from '@/lib/rewards/types';
import type { CompletedWorkoutLog } from '@/types';
import { localDateKeyFromIso, localWeekKey } from '@/lib/time/localDate';

function persist(result: ApplyResult): ApplyResult {
  saveRewardState(result.state);
  rememberLastAwards(result);
  return result;
}

export function applyRewardEventsLive(events: RewardEventKind[]): ApplyResult {
  if (typeof window === 'undefined') {
    return {
      state: loadRewardState(),
      xpAwards: [],
      badgeAwards: [],
      levelBefore: 1,
      levelAfter: 1,
      xpGained: 0,
    };
  }
  const state = loadRewardState();
  return persist(applyRewardEvents(state, events));
}

/**
 * After a finished workout: XP + first/iron badges + weekly goal + completed challenges.
 */
export function applyWorkoutRewards(
  log: CompletedWorkoutLog,
  workoutHistoryAfter: CompletedWorkoutLog[]
): ApplyResult {
  if (typeof window === 'undefined') {
    return {
      state: loadRewardState(),
      xpAwards: [],
      badgeAwards: [],
      levelBefore: 1,
      levelAfter: 1,
      xpGained: 0,
    };
  }

  const events: RewardEventKind[] = [
    {
      type: 'workout_finish',
      workoutId: log.id,
      finishedAt: log.completedAt,
      totalWorkoutsAfter: workoutHistoryAfter.length,
    },
  ];

  if (workoutHistoryAfter.length === 1) {
    events.push({ type: 'journey_first_workout' });
  }

  const weekStart = localWeekKey();
  const sessionsThisWeek = workoutHistoryAfter.filter(
    (w) => localDateKeyFromIso(w.completedAt) >= weekStart
  ).length;
  const goal = loadDaysPerWeek();
  events.push({
    type: 'weekly_train_goal',
    weekStart,
    sessionsThisWeek,
    goal,
  });

  // Challenges already updated by recordWorkoutCompleted — read progress and claim completes.
  for (const c of getChallengeProgress()) {
    if (c.current >= c.target) {
      events.push({
        type: 'challenge_complete',
        challengeId: c.id,
        weekStart,
      });
    }
  }

  return applyRewardEventsLive(events);
}

export function applyFuelDayReward(dateKey: string): ApplyResult {
  return applyRewardEventsLive([{ type: 'fuel_day', dateKey }]);
}

export function applyPillarWinReward(
  winId: string,
  pillar: 'move' | 'mind' | 'track' | 'learn'
): ApplyResult {
  const events: RewardEventKind[] = [{ type: 'pillar_win', winId, pillar }];
  const weekStart = localWeekKey();
  for (const c of getChallengeProgress()) {
    if (c.current >= c.target) {
      events.push({ type: 'challenge_complete', challengeId: c.id, weekStart });
    }
  }
  return applyRewardEventsLive(events);
}

export function applyJourneyCommissionedReward(): ApplyResult {
  return applyRewardEventsLive([{ type: 'journey_commissioned' }]);
}

/** Single event helper for tests / founder tools. */
export function applyOneRewardEvent(event: RewardEventKind): ApplyResult {
  if (typeof window === 'undefined') {
    return {
      state: loadRewardState(),
      xpAwards: [],
      badgeAwards: [],
      levelBefore: 1,
      levelAfter: 1,
      xpGained: 0,
    };
  }
  return persist(applyRewardEvent(loadRewardState(), event));
}
