/**
 * Count distinct days with ≥150g protein from local nutrition log.
 * Pure helper for Today Win Score (no React).
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson } from '@/lib/storage/safeStorage';

const DEFAULT_THRESHOLD = 150;

export function countHighProteinDaysFromNutritionLog(threshold = DEFAULT_THRESHOLD): number {
  const logs = readJson<{ date?: string; protein?: number }[]>(STORAGE_KEYS.nutritionLog, []);
  if (!Array.isArray(logs)) return 0;
  const byDate: Record<string, number> = {};
  for (const l of logs) {
    const d = l.date || new Date().toISOString().split('T')[0];
    byDate[d] = (byDate[d] || 0) + (l.protein || 0);
  }
  return Object.values(byDate).filter((p) => p >= threshold).length;
}
