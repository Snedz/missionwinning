/**
 * Local pillar wins. Cloud sync is dynamic so getPillarWins stays free of supabase-js
 * (missionJourney / lean Today cold path).
 */

export type PillarType = 'move' | 'mind' | 'track' | 'learn';

export interface PillarWin {
  id: string;
  pillar: PillarType;
  title: string;
  completedAt: string;
  meta?: Record<string, string | number>;
}

const WINS_KEY = 'mw_pillar_wins';

export function getPillarWins(limit = 20): PillarWin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(WINS_KEY) || '[]') as PillarWin[];
    return raw.slice(0, limit);
  } catch {
    return [];
  }
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
  localStorage.setItem(WINS_KEY, JSON.stringify([win, ...existing].slice(0, 100)));

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
