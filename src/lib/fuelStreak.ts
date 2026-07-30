/** Consecutive-day fuel logging streak. */
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';

export function getFuelLogStreak(): number {
  return parseInt(readRaw(STORAGE_KEYS.fuelStreak) || '0', 10) || 0;
}

export function bumpFuelLogStreak(): number {
  const today = localDateKey();
  const last = readRaw(STORAGE_KEYS.fuelLastLogDate);
  let count = getFuelLogStreak();

  if (last === today) return count;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = localDateKey(yesterday);

  if (last === yesterdayStr) count += 1;
  else count = 1;

  writeRaw(STORAGE_KEYS.fuelStreak, String(count));
  writeRaw(STORAGE_KEYS.fuelLastLogDate, today);
  return count;
}
