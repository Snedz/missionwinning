import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export type MacroTargets = {
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: string;
};

const STORAGE_KEY = STORAGE_KEYS.macroTargets;

export const DEFAULT_MACRO_TARGETS: Omit<MacroTargets, 'updatedAt'> = {
  cals: 2200,
  protein: 160,
  carbs: 200,
  fat: 70,
};

export function saveMacroTargets(targets: Omit<MacroTargets, 'updatedAt'>): MacroTargets {
  const saved: MacroTargets = { ...targets, updatedAt: new Date().toISOString() };
  writeJson(STORAGE_KEY, saved);
  return saved;
}

export function loadMacroTargets(): MacroTargets | null {
  return readJson<MacroTargets | null>(STORAGE_KEY, null);
}
