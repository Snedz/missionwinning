export type MacroTargets = {
  cals: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: string;
};

const STORAGE_KEY = 'mw_macro_targets';

export const DEFAULT_MACRO_TARGETS: Omit<MacroTargets, 'updatedAt'> = {
  cals: 2200,
  protein: 160,
  carbs: 200,
  fat: 70,
};

export function saveMacroTargets(targets: Omit<MacroTargets, 'updatedAt'>): MacroTargets {
  const saved: MacroTargets = { ...targets, updatedAt: new Date().toISOString() };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  return saved;
}

export function loadMacroTargets(): MacroTargets | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MacroTargets;
  } catch {
    return null;
  }
}
