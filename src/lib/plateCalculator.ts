import type { UnitsPref } from '@/hooks/useUnits';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export type PlateCalcResult = {
  perSide: number[];
  barWeight: number;
  targetWeight: number;
  achievedWeight: number;
  remainder: number;
};

/** Live set-row offer. `show: false` invents no plates. */
export type SetRowPlateOffer = {
  show: boolean;
  barWeight: number;
  platesLine: string | null;
};

export type StoredBarWeight = {
  metric: number;
  imperial: number;
};

export const METRIC_BAR_KG = 20;
export const IMPERIAL_BAR_LBS = 45;

export const METRIC_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
export const IMPERIAL_PLATES_LBS = [45, 35, 25, 10, 5, 2.5] as const;

export function defaultBarWeight(units: UnitsPref): number {
  return units === 'imperial' ? IMPERIAL_BAR_LBS : METRIC_BAR_KG;
}

export function defaultStoredBarWeight(): StoredBarWeight {
  return { metric: METRIC_BAR_KG, imperial: IMPERIAL_BAR_LBS };
}

function sanitizeBar(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

/** Missing / invalid / ≤0 → unit default. */
export function parseBarWeightPref(raw: unknown): StoredBarWeight {
  const fallback = defaultStoredBarWeight();
  if (!raw || typeof raw !== 'object') return fallback;
  const row = raw as Partial<StoredBarWeight>;
  return {
    metric: sanitizeBar(row.metric, fallback.metric),
    imperial: sanitizeBar(row.imperial, fallback.imperial),
  };
}

export function resolveBarWeight(units: UnitsPref, barWeight?: number): number {
  return sanitizeBar(barWeight, defaultBarWeight(units));
}

export function readStoredBarWeight(units: UnitsPref): number {
  const pref = parseBarWeightPref(readJson<unknown>(STORAGE_KEYS.barWeight, null));
  return units === 'imperial' ? pref.imperial : pref.metric;
}

export function writeStoredBarWeight(units: UnitsPref, value: number): number {
  const next = resolveBarWeight(units, value);
  const pref = parseBarWeightPref(readJson<unknown>(STORAGE_KEYS.barWeight, null));
  if (units === 'imperial') pref.imperial = next;
  else pref.metric = next;
  writeJson(STORAGE_KEYS.barWeight, pref);
  return next;
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

/**
 * Both-sides plate counts from a per-side stack.
 * One 45 per side → `2×45`. Two 45s per side → `4×45`.
 */
export function formatBothSidesPlateCounts(perSide: number[]): string {
  if (perSide.length === 0) return '';
  const counts = new Map<number, number>();
  const order: number[] = [];
  for (const plate of perSide) {
    if (!counts.has(plate)) order.push(plate);
    counts.set(plate, (counts.get(plate) ?? 0) + 2);
  }
  return order.map((plate) => `${counts.get(plate)}×${plate}`).join(' + ');
}

/** Catalog `equipment` values that load plates on a bar. Closed list — do not guess from names. */
const BAR_LOADED_EQUIPMENT = new Set(['barbell', 'trap bar']);

export function isBarLoadedEquipment(equipment?: string): boolean {
  if (!equipment) return false;
  return BAR_LOADED_EQUIPMENT.has(equipment.trim().toLowerCase());
}

const HIDDEN: Omit<SetRowPlateOffer, 'barWeight'> = { show: false, platesLine: null };

/**
 * Live set-row plate offer. Empty / 0 / skipped / not bar-loaded invent
 * no plates. Both-sides counts (`2×45`), not a per-side list.
 */
export function setRowPlateBreakdown(params: {
  equipment?: string;
  weight: number;
  units: UnitsPref;
  barWeight?: number;
  skipped?: boolean;
}): SetRowPlateOffer {
  const bar = resolveBarWeight(params.units, params.barWeight);
  if (params.skipped) return { ...HIDDEN, barWeight: bar };
  if (!isBarLoadedEquipment(params.equipment)) return { ...HIDDEN, barWeight: bar };
  if (!Number.isFinite(params.weight) || params.weight <= 0) return { ...HIDDEN, barWeight: bar };
  if (params.weight <= bar) return { ...HIDDEN, barWeight: bar };
  const result = calculatePlatesPerSide(params.weight, bar, availablePlates(params.units));
  if (result.perSide.length === 0) return { ...HIDDEN, barWeight: bar };
  return {
    show: true,
    barWeight: bar,
    platesLine: formatBothSidesPlateCounts(result.perSide),
  };
}

/**
 * Compact both-sides line for the live set row (`2×45`), or null when
 * plates do not apply (BW / DB / cable / machine / empty / 0 / skipped).
 */
export function setRowPlateLine(params: {
  equipment?: string;
  weight: number;
  units: UnitsPref;
  barWeight?: number;
  skipped?: boolean;
}): string | null {
  const offer = setRowPlateBreakdown(params);
  return offer.show ? offer.platesLine : null;
}
