/**
 * Saved meal presets for Fuel (Forge-style one-tap re-log).
 * localStorage only — free forever.
 */

import type { NutritionLogRow } from '@/lib/nutritionQuickLog';

export type SavedMealPreset = {
  id: string;
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  savedAt: string;
};

const STORAGE_KEY = 'mw_saved_meals';
const MAX_PRESETS = 12;

export function listMealPresets(): SavedMealPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedMealPreset[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_PRESETS) : [];
  } catch {
    return [];
  }
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

export function removeMealPreset(id: string): SavedMealPreset[] {
  const all = listMealPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
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
