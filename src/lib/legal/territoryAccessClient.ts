/**
 * Client helper: fetch /api/geo territory block decision.
 *
 * Signup / checkout UI must fail closed when geo is unavailable. A missing
 * country allow (local / non-prod) is returned once and is not cached, so a
 * later platform header can still block the same tab.
 */
import { TERRITORY_BLOCK_MESSAGES } from './supportedRegions';

export type TerritoryAccessClient = {
  country: string | null;
  blocked: boolean;
  reason: string | null;
  message: string | null;
  source: string;
};

export const TERRITORY_ACCESS_CACHE_KEY = 'mw_territory_access_v1';

export function unavailableTerritoryAccess(): TerritoryAccessClient {
  return {
    country: null,
    blocked: true,
    reason: 'unknown_edge',
    message: TERRITORY_BLOCK_MESSAGES.unknown_edge,
    source: 'error',
  };
}

/** Cache blocks, and CDN allows with a country. Never cache errors or inferred allows. */
export function canCacheTerritoryAccess(v: TerritoryAccessClient): boolean {
  if (v.source === 'error') return false;
  if (v.blocked) return true;
  if (!v.country) return false;
  return v.source === 'cdn';
}

function sessionStore(): Storage | null {
  try {
    const store = (globalThis as { sessionStorage?: Storage }).sessionStorage;
    return store ?? null;
  } catch {
    return null;
  }
}

export function readCachedTerritoryAccess(): TerritoryAccessClient | null {
  const store = sessionStore();
  if (!store) return null;
  try {
    const raw = store.getItem(TERRITORY_ACCESS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TerritoryAccessClient;
    if (!canCacheTerritoryAccess(parsed)) {
      store.removeItem(TERRITORY_ACCESS_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedTerritoryAccess(v: TerritoryAccessClient): void {
  const store = sessionStore();
  if (!store || !canCacheTerritoryAccess(v)) return;
  try {
    store.setItem(TERRITORY_ACCESS_CACHE_KEY, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}

export async function fetchTerritoryAccess(): Promise<TerritoryAccessClient> {
  const cached = readCachedTerritoryAccess();
  if (cached) return cached;

  try {
    const res = await fetch('/api/geo', { credentials: 'same-origin' });
    if (!res.ok) return unavailableTerritoryAccess();
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
  } catch {
    return unavailableTerritoryAccess();
  }
}
