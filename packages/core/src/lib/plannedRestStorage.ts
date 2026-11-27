/**
 * Device-local planned rest days. YYYY-MM-DD list.
 */
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';
import { isPlannedRest } from '@/lib/plannedRest';

export function loadPlannedRestDays(): string[] {
  const raw = readJson<string[]>(STORAGE_KEYS.plannedRestDays, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d));
}

export function savePlannedRestDays(days: readonly string[]): void {
  const unique = [...new Set(days.filter(Boolean))].sort();
  writeJson(STORAGE_KEYS.plannedRestDays, unique);
}

export function isTodayPlannedRest(today = localDateKey()): boolean {
  return isPlannedRest(today, loadPlannedRestDays());
}

export function setTodayPlannedRest(on: boolean, today = localDateKey()): string[] {
  const next = new Set(loadPlannedRestDays());
  if (on) next.add(today);
  else next.delete(today);
  const list = [...next];
  savePlannedRestDays(list);
  return list;
}
