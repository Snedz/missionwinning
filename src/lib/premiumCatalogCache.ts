/**
 * Session-scoped in-memory cache for static-ish premium catalog GETs.
 * Avoids re-downloading recipes/mobility/guidebook on every pillar visit.
 */

const TTL_MS = 5 * 60_000;

type Entry = { data: unknown; fetchedAt: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export async function fetchPremiumCatalogJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const cached = store.get(path);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data as T;
  }

  const existing = inflight.get(path);
  if (existing) return existing as Promise<T>;

  const promise = fetch(path, { credentials: 'include', ...init })
    .then(async (r) => {
      if (!r.ok) throw new Error(`premium catalog ${path} → ${r.status}`);
      return r.json() as Promise<T>;
    })
    .then((data) => {
      store.set(path, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(path);
    });

  inflight.set(path, promise);
  return promise;
}

export function clearPremiumCatalogCache(path?: string) {
  if (path) store.delete(path);
  else store.clear();
}
