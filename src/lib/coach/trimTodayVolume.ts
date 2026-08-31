/**
 * Readiness volume trim from the stored week — never generateWeek.
 * Train Show all may call this; /active must not mount useCoachPlan.
 */
import type { CompletedWorkoutLog } from '@/types';
import type { CoachPlan } from '@/lib/coach/types';
import { adjustTodaySession } from '@/lib/coach/adjust';
import { readLocalCoachContext } from '@/lib/coach/contextBuilder';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import { loadPlan, savePlan } from '@/lib/coach/storage';
import { scheduleCoachPush } from '@/lib/coachSync';
import { track } from '@/lib/analytics';

export function hasStoredWeekPlan(): boolean {
  const plan = loadPlan();
  return !!plan && plan.weekStart === currentWeekStart();
}

export function trimTodayVolume(history: CompletedWorkoutLog[]): CoachPlan | null {
  const plan = loadPlan();
  const weekStart = currentWeekStart();
  if (!plan || plan.weekStart !== weekStart) return null;
  const next = adjustTodaySession(
    plan,
    readLocalCoachContext(history),
    todayDayOffset(weekStart),
    { type: 'readiness' }
  );
  if (!next) return null;
  savePlan(next);
  scheduleCoachPush();
  track('coach_session_adjusted', { type: 'readiness', why: 'readiness_volume_trim' });
  return next;
}
