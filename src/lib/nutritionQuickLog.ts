import { localDateKey } from '@/lib/time/localDate';

export type NutritionLogRow = {
  name: string;
  protein: number;
  cals: number;
  carbs?: number;
  fat?: number;
  date?: string;
  time?: string;
  meal?: string;
};

export type QuickFoodTuple = readonly [string, number, number, number, number];

const DEFAULT_QUICK: QuickFoodTuple[] = [
  ['Chicken breast 150g', 45, 165, 0, 3],
  ['Oats 80g dry', 10, 300, 54, 5],
  ['Eggs 3 large', 18, 210, 1, 15],
  ['Rice 200g cooked', 8, 260, 56, 0],
  ['Banana 1 med', 1, 105, 27, 0],
  ['Greek yogurt 200g', 20, 130, 8, 0],
];

export function parseNutritionLog(raw: string | null): NutritionLogRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as NutritionLogRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Keep local nutrition log bounded (Today already filters to today). */
export function pruneNutritionLogToDays(
  rows: NutritionLogRow[],
  days = 90,
  now = new Date()
): NutritionLogRow[] {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return rows.filter((row) => {
    if (!row.date) return true;
    return row.date >= cutoffStr;
  });
}

export function getFrequentQuickFoods(
  logs: NutritionLogRow[],
  defaults: readonly QuickFoodTuple[] = DEFAULT_QUICK,
  limit = 6
): QuickFoodTuple[] {
  const counts = new Map<string, { count: number; row: NutritionLogRow }>();
  for (const row of logs) {
    const key = row.name.trim().toLowerCase();
    if (!key) continue;
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { count: 1, row });
  }

  const fromLog: QuickFoodTuple[] = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([, { row }]) => [
      row.name,
      row.protein,
      row.cals,
      row.carbs ?? 0,
      row.fat ?? 0,
    ] as QuickFoodTuple);

  const seen = new Set(fromLog.map((f) => f[0].toLowerCase()));
  for (const d of defaults) {
    if (fromLog.length >= limit) break;
    if (!seen.has(d[0].toLowerCase())) {
      fromLog.push(d);
      seen.add(d[0].toLowerCase());
    }
  }
  return fromLog;
}

export function getYesterdayEntries(logs: NutritionLogRow[], todayIso: string): NutritionLogRow[] {
  const today = new Date(`${todayIso}T12:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = localDateKey(yesterday);
  return logs.filter((l) => l.date === yKey);
}

/**
 * Most recently logged unique foods (today + yesterday first by reverse log order).
 * MacroFactor/MFP-style recents for one-tap re-log.
 */
export function getRecentFoods(
  logs: NutritionLogRow[],
  todayIso: string,
  limit = 6
): QuickFoodTuple[] {
  const today = new Date(`${todayIso}T12:00:00`);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = localDateKey(yesterday);
  const window = logs.filter((l) => l.date === todayIso || l.date === yKey);
  // Reverse chronological: later entries in array ≈ more recent when appended
  const seen = new Set<string>();
  const out: QuickFoodTuple[] = [];
  for (let i = window.length - 1; i >= 0; i--) {
    const row = window[i];
    const key = row.name.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push([
      row.name,
      row.protein,
      row.cals,
      row.carbs ?? 0,
      row.fat ?? 0,
    ]);
    if (out.length >= limit) break;
  }
  return out;
}

/** Scale draft macros by serving multiplier (½, 1, 2, …). */
export function scaleMealMacros(
  base: { protein: number; cals: number; carbs: number; fat: number },
  servings: number
): { protein: number; cals: number; carbs: number; fat: number } {
  const s = Number.isFinite(servings) && servings > 0 ? servings : 1;
  return {
    protein: Math.round(base.protein * s),
    cals: Math.round(base.cals * s),
    carbs: Math.round(base.carbs * s),
    fat: Math.round(base.fat * s),
  };
}

export type NutritionDaySummary = {
  date: string;
  entries: number;
  protein: number;
  cals: number;
};

/** Last `days` calendar days including today (oldest → newest). */
export function summarizeNutritionDays(
  logs: NutritionLogRow[],
  todayIso: string,
  days = 7
): NutritionDaySummary[] {
  const out: NutritionDaySummary[] = [];
  const base = new Date(`${todayIso}T12:00:00`);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    const rows = logs.filter((l) => l.date === key);
    out.push({
      date: key,
      entries: rows.length,
      protein: rows.reduce((s, r) => s + (r.protein || 0), 0),
      cals: rows.reduce((s, r) => s + (r.cals || 0), 0),
    });
  }
  return out;
}

export { DEFAULT_QUICK as DEFAULT_QUICK_FOODS };
