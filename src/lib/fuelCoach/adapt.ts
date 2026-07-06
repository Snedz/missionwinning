import type { DayMacroTotals, TrainingLoad } from '@/lib/fuelCoach/types';

/** Adjust daily macro budget from training load — train + fuel synergy. */
export function adaptDailyTargets(
  base: DayMacroTotals,
  load: TrainingLoad
): { targets: DayMacroTotals; note?: string } {
  switch (load) {
    case 'heavy':
      return {
        targets: {
          ...base,
          cals: base.cals + 200,
          carbs: base.carbs + 40,
          protein: base.protein + 10,
        },
        note: 'Heavy training day — extra carbs and calories for recovery.',
      };
    case 'moderate':
      return {
        targets: {
          ...base,
          cals: base.cals + 100,
          carbs: base.carbs + 20,
        },
        note: 'Training day — modest carb bump.',
      };
    case 'light':
      return {
        targets: {
          ...base,
          cals: base.cals + 50,
          carbs: base.carbs + 10,
        },
        note: 'Post-heavy-day recovery fuel.',
      };
    case 'rest':
    default:
      return {
        targets: {
          ...base,
          cals: Math.max(1200, base.cals - 75),
          carbs: Math.max(50, base.carbs - 25),
        },
        note: 'Rest day — slightly lower carbs.',
      };
  }
}

export function synergyCarbBump(load: TrainingLoad): number {
  if (load === 'heavy') return 40;
  if (load === 'moderate') return 20;
  if (load === 'light') return 10;
  return 0;
}
