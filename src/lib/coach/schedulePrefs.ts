/** Schedule preferences for Mission Coach — days per week and preferred weekdays. */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage/safeStorage';

const DAYS_KEY = STORAGE_KEYS.daysPerWeek;
const PREFERRED_KEY = STORAGE_KEYS.preferredDays;

export function defaultDaysPerWeek(experience: string): number {
  if (experience === 'advanced') return 5;
  if (experience === 'intermediate') return 4;
  return 3;
}

export function loadDaysPerWeek(experience?: string): number {
  const raw = readRaw(DAYS_KEY);
  const n = raw ? parseInt(raw, 10) : NaN;
  if (n >= 2 && n <= 6) return n;
  return defaultDaysPerWeek(experience ?? readRaw(STORAGE_KEYS.experience) ?? 'beginner');
}

export function saveDaysPerWeek(days: number): void {
  const clamped = Math.max(2, Math.min(6, days));
  writeRaw(DAYS_KEY, String(clamped));
}

export function loadPreferredDays(): number[] {
  const parsed = readJson<unknown>(PREFERRED_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((d): d is number => typeof d === 'number' && d >= 0 && d <= 6);
}

export function savePreferredDays(days: number[]): void {
  writeJson(
    PREFERRED_KEY,
    days.filter((d) => d >= 0 && d <= 6)
  );
}
