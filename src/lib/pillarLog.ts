/**
 * Local pillar wins. Cloud sync is dynamic so getPillarWins stays free of supabase-js
 * (missionJourney / lean Today cold path).
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';

export type PillarType = 'move' | 'mind' | 'track' | 'learn';

export interface PillarWin {
  id: string;
  pillar: PillarType;
  title: string;
  completedAt: string;
  meta?: Record<string, string | number>;
}

export function getPillarWins(limit = 20): PillarWin[] {
  return readJson<PillarWin[]>(STORAGE_KEYS.pillarWins, []).slice(0, limit);
}

/** The one place the cloud row name is built. Readers match it via `isNonFoodEntryName`. */
export function pillarWinEntryName(pillar: PillarType, title: string): string {
  return `${pillar} win: ${title}`.slice(0, 80);
}

/**
 * `nutrition_entries` is doing double duty as a generic "win" table — pillar wins are
 * written here, and `AssessmentsPage` records assessments the same way with a comment
 * admitting it is a stopgap ("or extend table later").
 *
 * They all arrive with `protein: 0, cals: 0`, and the Fuel diary used to render every
 * cloud row, so a signed-in athlete who logged a GPS run saw
 * `track win: GPS 5.20 km — 0g P · 0 kcal` sitting in their food log.
 *
 * The predicate lives beside the writer on purpose: a format defined in one file and
 * matched by a regex in another is exactly how these two drift apart.
 */
const NON_FOOD_ENTRY = /^(?:move|mind|track|learn) win: |^Assessment[: ]/i;

export function isNonFoodEntryName(name: string): boolean {
  return NON_FOOD_ENTRY.test(name.trim());
}

export async function logPillarWin(
  pillar: PillarType,
  title: string,
  meta?: Record<string, string | number>
): Promise<void> {
  if (typeof window === 'undefined') return;

  const win: PillarWin = {
    id: `win-${Date.now()}`,
    pillar,
    title,
    completedAt: new Date().toISOString(),
    meta,
  };

  const existing = getPillarWins(100);
  writeJson(STORAGE_KEYS.pillarWins, [win, ...existing].slice(0, 100));

  try {
    const { getUser, saveNutritionEntry } = await import('@/lib/supabase');
    const u = await getUser();
    if (u) {
      const today = new Date().toISOString().split('T')[0];
      await saveNutritionEntry({
        date: today,
        name: pillarWinEntryName(pillar, title),
        protein: 0,
        cals: 0,
      });
    }
  } catch {
    // offline / demo mode
  }
}
