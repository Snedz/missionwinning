/**
 * Today's Fuel targets adjusted from workout history (train + fuel synergy).
 * Uses fuelCoach training-load rules; does not mutate stored base targets.
 */

import { currentWeekStart, todayDayOffset } from '@/lib/coach/splitPlanner';
import { adaptDailyTargets } from '@/lib/fuelCoach/adapt';
import { trainingLoadForDay } from '@/lib/fuelCoach/contextBuilder';
import type { DayMacroTotals, TrainingLoad } from '@/lib/fuelCoach/types';
import type { CompletedWorkoutLog } from '@/types';

export const FUEL_ADAPT_ENABLED_KEY = 'mw_fuel_adapt_enabled';

export type FuelDayAdaptResult = {
  load: TrainingLoad;
  base: DayMacroTotals;
  /** Effective targets for rings/budget (base when adapt off). */
  targets: DayMacroTotals;
  note?: string;
  /** True when adapt is on and targets differ from base. */
  isAdapted: boolean;
  weekStart: string;
  dayOffset: number;
};

export function loadFuelAdaptEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const raw = localStorage.getItem(FUEL_ADAPT_ENABLED_KEY);
    if (raw === null) return true;
    return raw !== '0' && raw !== 'false';
  } catch {
    return true;
  }
}

export function saveFuelAdaptEnabled(on: boolean): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(FUEL_ADAPT_ENABLED_KEY, on ? '1' : '0');
}

function macrosEqual(a: DayMacroTotals, b: DayMacroTotals): boolean {
  return a.cals === b.cals && a.protein === b.protein && a.carbs === b.carbs && a.fat === b.fat;
}

/**
 * Resolve today's effective macro targets from base + local workout history.
 */
export function resolveFuelDayTargets(
  base: DayMacroTotals,
  history: CompletedWorkoutLog[],
  opts?: {
    todayIso?: string;
    weekStart?: string;
    adapt?: boolean;
  }
): FuelDayAdaptResult {
  const weekStart = opts?.weekStart ?? currentWeekStart();
  const dayOffset = todayDayOffset(weekStart, opts?.todayIso);
  const load = trainingLoadForDay(history, weekStart, dayOffset);
  const adapt = opts?.adapt !== false;
  const { targets: adapted, note } = adaptDailyTargets(base, load);

  if (!adapt) {
    return {
      load,
      base,
      targets: base,
      note: undefined,
      isAdapted: false,
      weekStart,
      dayOffset,
    };
  }

  const isAdapted = !macrosEqual(base, adapted);
  return {
    load,
    base,
    targets: adapted,
    note: isAdapted ? note : undefined,
    isAdapted,
    weekStart,
    dayOffset,
  };
}

/** Short label for training load chips. */
export function trainingLoadLabel(load: TrainingLoad): string {
  switch (load) {
    case 'heavy':
      return 'Heavy';
    case 'moderate':
      return 'Training';
    case 'light':
      return 'Recovery';
    case 'rest':
    default:
      return 'Rest';
  }
}

/** Delta line for UI: e.g. +200 kcal · +40g carbs */
export function adaptDeltaSummary(base: DayMacroTotals, targets: DayMacroTotals): string {
  const parts: string[] = [];
  const dCals = targets.cals - base.cals;
  const dP = targets.protein - base.protein;
  const dC = targets.carbs - base.carbs;
  const dF = targets.fat - base.fat;
  if (dCals !== 0) parts.push(`${dCals > 0 ? '+' : ''}${dCals} kcal`);
  if (dP !== 0) parts.push(`${dP > 0 ? '+' : ''}${dP}g P`);
  if (dC !== 0) parts.push(`${dC > 0 ? '+' : ''}${dC}g C`);
  if (dF !== 0) parts.push(`${dF > 0 ? '+' : ''}${dF}g F`);
  return parts.join(' · ');
}
