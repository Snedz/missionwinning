/**
 * Optional coach session for Just Go — dynamic import so cold paths skip the coach engine.
 * Consumers: HomeTodayLean, HomeTodayDashboard, todayPrimaryAction.
 * Sync sibling: peekCoachToday (Today CTA honesty without a flash of "Just Go").
 */
import type { CoachSessionLike } from '@/lib/justGoSession';

export async function loadCoachTodayOptional(): Promise<CoachSessionLike | null> {
  try {
    const { peekCoachToday } = await import('@/lib/coach/peekCoachToday');
    return peekCoachToday();
  } catch {
    return null;
  }
}
