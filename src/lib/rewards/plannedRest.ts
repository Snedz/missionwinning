/**
 * Planned rest. Bridges a consecutive-day streak. Never a train session.
 * Weekly train goal stays the boss.
 */
import { previousLocalDateKey } from '@/lib/time/localDate';

export function isPlannedRest(dateKey: string, restDays: readonly string[]): boolean {
  return Boolean(dateKey) && restDays.includes(dateKey);
}

/**
 * Consecutive workout days, walking across planned rest without counting them.
 * Rest-only calendars are 0. A gap that is not rest is 0.
 */
export function streakFromDatesAllowingRest(
  workoutDates: readonly string[],
  restDays: readonly string[],
  todayKey: string
): number {
  const workouts = new Set(workoutDates.filter(Boolean));
  const rest = new Set(restDays.filter(Boolean));
  if (workouts.size === 0 || !todayKey) return 0;

  let cursor = todayKey;
  if (!workouts.has(cursor) && !rest.has(cursor)) {
    cursor = previousLocalDateKey(todayKey);
    if (!workouts.has(cursor) && !rest.has(cursor)) return 0;
  }

  let streak = 0;
  let sawWorkout = false;
  for (let i = 0; i < 400; i += 1) {
    if (workouts.has(cursor)) {
      streak += 1;
      sawWorkout = true;
    } else if (rest.has(cursor)) {
      /* bridge — rest is not a session */
    } else {
      break;
    }
    cursor = previousLocalDateKey(cursor);
  }
  return sawWorkout ? streak : 0;
}
