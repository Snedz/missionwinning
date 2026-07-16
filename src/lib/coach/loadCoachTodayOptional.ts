/**
 * Optional coach session for Just Go — dynamic import so cold paths skip the coach engine.
 * Consumers: HomeTodayLean, HomeTodayDashboard, todayPrimaryAction.
 */
import type { CoachSessionLike } from '@/lib/justGoSession';

export async function loadCoachTodayOptional(): Promise<CoachSessionLike | null> {
  try {
    const [{ loadPlan }, { currentWeekStart, todayDayOffset }] = await Promise.all([
      import('@/lib/coach/storage'),
      import('@/lib/coach/splitPlanner'),
    ]);
    const plan = loadPlan();
    if (!plan) return null;
    const weekStart = currentWeekStart();
    if (plan.weekStart !== weekStart) return null;
    const session = plan.sessions.find((s) => s.dayOffset === todayDayOffset(weekStart));
    if (!session || session.status === 'done') return null;
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
