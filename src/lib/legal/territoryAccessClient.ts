/**
 * Client helper: fetch /api/geo territory block decision.
 */

export type TerritoryAccessClient = {
  country: string | null;
  blocked: boolean;
  reason: string | null;
  message: string | null;
  source: string;
};

const CACHE_KEY = 'mw_territory_access_v1';

export function readCachedTerritoryAccess(): TerritoryAccessClient | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TerritoryAccessClient;
  } catch {
    return null;
  }
}

export function writeCachedTerritoryAccess(v: TerritoryAccessClient): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}

export async function fetchTerritoryAccess(): Promise<TerritoryAccessClient> {
  const cached = readCachedTerritoryAccess();
  if (cached) return cached;

  const res = await fetch('/api/geo', { credentials: 'same-origin' });
  if (!res.ok) {
    return {
      country: null,
      blocked: false,
      reason: null,
      message: null,
      source: 'error',
    };
  }
  const data = (await res.json()) as {
    country?: string | null;
    blocked?: boolean;
    blockReason?: string | null;
    blockMessage?: string | null;
    source?: string;
  };
  const out: TerritoryAccessClient = {
    country: data.country ?? null,
    blocked: Boolean(data.blocked),
    reason: data.blockReason ?? null,
    message: data.blockMessage ?? null,
    source: data.source ?? 'cdn',
  };
  writeCachedTerritoryAccess(out);
  return out;
}
