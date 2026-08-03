/**
 * Sync peek of today's Mission Coach session for Today CTA honesty.
 * Same rules as loadCoachTodayOptional — no dynamic import (callers already on client).
 */
import type { CoachSessionLike } from '@/lib/justGoSession';
import { loadPlan } from '@/lib/coach/storage';
import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';

export function peekCoachToday(): CoachSessionLike | null {
  if (typeof window === 'undefined') return null;
  try {
    const plan = loadPlan();
    if (!plan) return null;
    const weekStart = currentWeekStart();
    if (plan.weekStart !== weekStart) return null;
    const session = plan.sessions.find((s) => s.dayOffset === todayDayOffset(weekStart));
    if (!session || session.status === 'done') return null;
    if (!session.exercises?.length) return null;
    return {
      name: session.name,
      status: session.status,
      focusGroups: session.focusGroups,
      exercises: session.exercises,
    };
  } catch {
    return null;
  }
}
