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

/** One plate on each side counts as one pair. */
export type PlateStock = {
  weight: number;
  pairs: number;
};

/** A lifter can edit the rack. Twelve pairs of one size is the ceiling. */
export const MAX_PLATE_PAIRS = 12;

/**
 * Pairs per side for a normal rack.
 * Metric: several 25s and one pair of each change plate.
 * Imperial: several 45s, one pair of 35s and 25s, and change plates.
 */
const DEFAULT_METRIC_STOCK: readonly PlateStock[] = [
  { weight: 25, pairs: 4 },
  { weight: 20, pairs: 1 },
  { weight: 15, pairs: 1 },
  { weight: 10, pairs: 1 },
  { weight: 5, pairs: 1 },
  { weight: 2.5, pairs: 1 },
  { weight: 1.25, pairs: 1 },
];

const DEFAULT_IMPERIAL_STOCK: readonly PlateStock[] = [
  { weight: 45, pairs: 6 },
  { weight: 35, pairs: 1 },
  { weight: 25, pairs: 1 },
  { weight: 10, pairs: 2 },
  { weight: 5, pairs: 2 },
  { weight: 2.5, pairs: 1 },
];

export type NearestBarLoad = {
  /** Plates on one side, heaviest first. */
  perSide: number[];
  barWeight: number;
  targetWeight: number;
  /** Closest total the bar and the inventory can make. */
  achievedWeight: number;
  /** achieved − target. Negative means under the target. */
  delta: number;
  exact: boolean;
};

export function defaultPlateInventory(units: UnitsPref): PlateStock[] {
  const source = units === 'imperial' ? DEFAULT_IMPERIAL_STOCK : DEFAULT_METRIC_STOCK;
  return source.map((row) => ({ weight: row.weight, pairs: row.pairs }));
}

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

function clampPairs(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(MAX_PLATE_PAIRS, Math.max(0, Math.floor(value)));
}

/** Overlay saved pair counts onto the default denominations. Unknown sizes are dropped. */
function mergeStock(defaults: readonly PlateStock[], raw: unknown): PlateStock[] {
  if (!Array.isArray(raw)) return defaults.map((row) => ({ ...row }));
  const byWeight = new Map<number, number>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const weight = (item as PlateStock).weight;
    const pairs = clampPairs((item as PlateStock).pairs);
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) continue;
    if (pairs == null) continue;
    byWeight.set(weight, pairs);
  }
  return defaults.map((row) => ({
    weight: row.weight,
    pairs: byWeight.has(row.weight) ? (byWeight.get(row.weight) as number) : row.pairs,
  }));
}

export function parsePlateInventory(raw: unknown): { metric: PlateStock[]; imperial: PlateStock[] } {
  const metric = defaultPlateInventory('metric');
  const imperial = defaultPlateInventory('imperial');
  if (!raw || typeof raw !== 'object') return { metric, imperial };
  const row = raw as { metric?: unknown; imperial?: unknown };
  return {
    metric: mergeStock(metric, row.metric),
    imperial: mergeStock(imperial, row.imperial),
  };
}

export function readStoredPlateInventory(units: UnitsPref): PlateStock[] {
  const pref = parsePlateInventory(readJson<unknown>(STORAGE_KEYS.plateInventory, null));
  return units === 'imperial' ? pref.imperial : pref.metric;
}

export function writeStoredPlateInventory(
  units: UnitsPref,
  stock: readonly PlateStock[]
): PlateStock[] {
  const pref = parsePlateInventory(readJson<unknown>(STORAGE_KEYS.plateInventory, null));
  const next = mergeStock(defaultPlateInventory(units), stock);
  if (units === 'imperial') pref.imperial = next;
  else pref.metric = next;
  writeJson(STORAGE_KEYS.plateInventory, pref);
  return next;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function normalizeInventory(inventory: readonly PlateStock[]): PlateStock[] {
  const byWeight = new Map<number, number>();
  for (const row of inventory) {
    if (!row || typeof row.weight !== 'number' || typeof row.pairs !== 'number') continue;
    if (!Number.isFinite(row.weight) || row.weight <= 0) continue;
    const pairs = clampPairs(row.pairs);
    if (pairs == null || pairs <= 0) continue;
    const prev = byWeight.get(row.weight) ?? 0;
    byWeight.set(row.weight, Math.min(MAX_PLATE_PAIRS, prev + pairs));
  }
  return [...byWeight.entries()]
    .map(([weight, pairs]) => ({ weight, pairs }))
    .sort((a, b) => b.weight - a.weight);
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

/**
 * Closest total a bar and a finite rack can make.
 * `pairs` is how many of that plate go on each side.
 * When two totals are the same distance from the target, the lighter one wins.
 * A target under the bar, or past the plates on hand, is not exact — the
 * nearest loadable total is the empty bar or the fullest rack.
 */
export function nearestBarLoad(
  targetWeight: number,
  barWeight: number,
  inventory: readonly PlateStock[]
): NearestBarLoad {
  const bar = Number.isFinite(barWeight) && barWeight > 0 ? barWeight : 0;
  const target = Number.isFinite(targetWeight) ? targetWeight : bar;
  const barCents = toCents(bar);
  const targetCents = toCents(target);

  let reachable = new Map<number, number[]>([[0, []]]);
  for (const stock of normalizeInventory(inventory)) {
    const plateCents = toCents(stock.weight);
    if (plateCents <= 0) continue;
    const next = new Map(reachable);
    for (const [cents, plates] of reachable) {
      for (let n = 1; n <= stock.pairs; n++) {
        const sideCents = cents + plateCents * n;
        const list = plates.concat(Array.from({ length: n }, () => stock.weight));
        const prev = next.get(sideCents);
        if (!prev || list.length < prev.length) next.set(sideCents, list);
      }
    }
    reachable = next;
  }

  let bestSide = 0;
  let bestPlates: number[] = [];
  let bestRank = Number.POSITIVE_INFINITY;
  for (const [sideCents, plates] of reachable) {
    const totalCents = barCents + sideCents * 2;
    const deltaCents = totalCents - targetCents;
    const abs = Math.abs(deltaCents);
    const heavier = deltaCents > 0 ? 1 : 0;
    const rank = abs * 1000 + heavier * 100 + plates.length;
    if (rank < bestRank) {
      bestRank = rank;
      bestSide = sideCents;
      bestPlates = plates;
    }
  }

  const achievedCents = barCents + bestSide * 2;
  const deltaCents = achievedCents - targetCents;
  return {
    perSide: bestPlates,
    barWeight: bar,
    targetWeight: target,
    achievedWeight: achievedCents / 100,
    delta: deltaCents / 100,
    exact: deltaCents === 0,
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
