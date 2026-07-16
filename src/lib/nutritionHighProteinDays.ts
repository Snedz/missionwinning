/**
 * Count distinct days with ≥150g protein from local nutrition log.
 * Pure helper for Today Win Score (no React).
 */

const DEFAULT_THRESHOLD = 150;

export function countHighProteinDaysFromNutritionLog(
  threshold = DEFAULT_THRESHOLD
): number {
  if (typeof window === 'undefined') return 0;
  try {
    const logs = JSON.parse(localStorage.getItem('mw_nutrition_log') || '[]') as {
      date?: string;
      protein?: number;
    }[];
    const byDate: Record<string, number> = {};
    for (const l of logs) {
      const d = l.date || new Date().toISOString().split('T')[0];
      byDate[d] = (byDate[d] || 0) + (l.protein || 0);
    }
    return Object.values(byDate).filter((p) => p >= threshold).length;
  } catch {
    return 0;
  }
}
