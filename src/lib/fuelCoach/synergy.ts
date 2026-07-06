import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import { synergyCarbBump } from '@/lib/fuelCoach/adapt';
import { loadFuelPlan } from '@/lib/fuelCoach/storage';

export function hasFuelPlanThisWeek(): boolean {
  const plan = loadFuelPlan();
  return !!plan && plan.weekStart === currentWeekStart();
}

export function todayFuelSynergyBump(): number {
  if (typeof window === 'undefined') return 0;
  const plan = loadFuelPlan();
  if (!plan || plan.weekStart !== currentWeekStart()) return 0;
  const offset = todayDayOffset(plan.weekStart);
  const day = plan.days.find((d) => d.dayOffset === offset);
  if (!day) return 0;
  return synergyCarbBump(day.trainingLoad);
}
