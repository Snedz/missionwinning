/**
 * Count distinct days with ≥150g protein from local nutrition log.
 * Pure helper for Today Mission Score (no React).
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';

const DEFAULT_THRESHOLD = 150;

export function countHighProteinDaysFromNutritionLog(threshold = DEFAULT_THRESHOLD): number {
  const logs = readJson<{ date?: string; protein?: number }[]>(STORAGE_KEYS.nutritionLog, []);
  if (!Array.isArray(logs)) return 0;
  const byDate: Record<string, number> = {};
  for (const l of logs) {
    const d = l.date || localDateKey();
    byDate[d] = (byDate[d] || 0) + (l.protein || 0);
  }
  return Object.values(byDate).filter((p) => p >= threshold).length;
}
