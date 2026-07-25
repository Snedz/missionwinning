/**
 * Saved meal presets for Fuel (Forge-style one-tap re-log).
 * Device storage only — free forever.
 */

import type { NutritionLogRow } from '@/lib/nutritionQuickLog';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export type SavedMealPreset = {
  id: string;
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  savedAt: string;
};

const STORAGE_KEY = STORAGE_KEYS.savedMeals;
const MAX_PRESETS = 12;

export function listMealPresets(): SavedMealPreset[] {
  const parsed = readJson<SavedMealPreset[]>(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed.slice(0, MAX_PRESETS) : [];
}

export function saveMealPreset(entry: {
  name: string;
  protein: number;
  cals: number;
  carbs?: number;
  fat?: number;
}): SavedMealPreset[] {
  const name = entry.name.trim();
  if (!name) return listMealPresets();
  const next: SavedMealPreset = {
    id: `meal-${Date.now()}`,
    name,
    protein: entry.protein,
    cals: entry.cals,
    carbs: entry.carbs ?? 0,
    fat: entry.fat ?? 0,
    savedAt: new Date().toISOString(),
  };
  const prev = listMealPresets().filter((p) => p.name.toLowerCase() !== name.toLowerCase());
  const all = [next, ...prev].slice(0, MAX_PRESETS);
  writeJson(STORAGE_KEY, all);
  return all;
}

export function removeMealPreset(id: string): SavedMealPreset[] {
  const all = listMealPresets().filter((p) => p.id !== id);
  writeJson(STORAGE_KEY, all);
  return all;
}

export function presetFromLogRow(row: NutritionLogRow): Parameters<typeof saveMealPreset>[0] {
  return {
    name: row.name,
    protein: row.protein,
    cals: row.cals,
    carbs: row.carbs,
    fat: row.fat,
  };
}
