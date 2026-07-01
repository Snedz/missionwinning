import type { UnitsPref } from '@/hooks/useUnits';

export type PlateCalcResult = {
  perSide: number[];
  barWeight: number;
  targetWeight: number;
  achievedWeight: number;
  remainder: number;
};

export const METRIC_BAR_KG = 20;
export const IMPERIAL_BAR_LBS = 45;

export const METRIC_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const IMPERIAL_PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;

export function defaultBarWeight(units: UnitsPref): number {
  return units === 'imperial' ? IMPERIAL_BAR_LBS : METRIC_BAR_KG;
}

export function availablePlates(units: UnitsPref): readonly number[] {
  return units === 'imperial' ? IMPERIAL_PLATES_LBS : METRIC_PLATES_KG;
}

/** Greedy plate loading — returns plates per side (largest first). */
export function calculatePlatesPerSide(
  targetWeight: number,
  barWeight: number,
  plates: readonly number[]
): PlateCalcResult {
  if (targetWeight <= 0 || targetWeight < barWeight) {
    return {
      perSide: [],
      barWeight,
      targetWeight,
      achievedWeight: barWeight,
      remainder: Math.max(0, targetWeight - barWeight),
    };
  }

  let remaining = (targetWeight - barWeight) / 2;
  const perSide: number[] = [];

  for (const plate of plates) {
    while (remaining + 1e-9 >= plate) {
      perSide.push(plate);
      remaining -= plate;
    }
  }

  const loadedSide = perSide.reduce((s, p) => s + p, 0);
  const achievedWeight = barWeight + loadedSide * 2;
  const remainder = Math.round((targetWeight - achievedWeight) * 100) / 100;

  return {
    perSide,
    barWeight,
    targetWeight,
    achievedWeight,
    remainder,
  };
}

export function formatPlateList(plates: number[], unit: string): string {
  if (plates.length === 0) return '—';
  return plates.map((p) => `${p}${unit}`).join(' + ');
}
