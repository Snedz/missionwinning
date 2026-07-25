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
        name: `${pillar} win: ${title}`.slice(0, 80),
        protein: 0,
        cals: 0,
      });
    }
  } catch {
    // offline / demo mode
  }
}
