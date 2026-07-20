/**
 * Upstash memo for premium enrollment checks (Cache Ladder v1 — Redis ~50ms layer).
 * Without UPSTASH_REDIS_* env, all helpers no-op and callers hit Postgres every time.
 * Import only from server modules (`premiumServer.ts`). See: docs/CACHE_LADDER.md
 */
export const ENROLLMENT_CACHE_TTL_SEC = 90;

export type EnrollmentCacheStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
  del(key: string): Promise<void>;
};

let testStore: EnrollmentCacheStore | null = null;

/** Test-only injectable store (in-memory). */
export function __setEnrollmentCacheStoreForTests(store: EnrollmentCacheStore | null): void {
  testStore = store;
}

export function enrollmentCacheKeyForUser(userId: string): string {
  return `premium:user:${userId}`;
}

export function enrollmentCacheKeyForEmail(email: string): string {
  return `premium:email:${email.trim().toLowerCase()}`;
}

async function resolveStore(): Promise<EnrollmentCacheStore | null> {
  if (testStore) return testStore;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url, token });
    return {
      get: async (key) => {
        const v = await redis.get<string>(key);
        if (v === null || v === undefined) return null;
        return String(v);
      },
      set: async (key, value, ttlSec) => {
        await redis.set(key, value, { ex: ttlSec });
      },
      del: async (key) => {
        await redis.del(key);
      },
    };
  } catch {
    return null;
  }
}

/** Read cached premium flag: true / false / null (miss or Redis unset). */
export async function getCachedPremiumFlag(
  userId: string | null | undefined,
  email: string | null | undefined
): Promise<boolean | null> {
  const store = await resolveStore();
  if (!store) return null;

  if (userId) {
    const hit = await store.get(enrollmentCacheKeyForUser(userId));
    if (hit === '1') return true;
    if (hit === '0') return false;
  }
  if (email) {
    const hit = await store.get(enrollmentCacheKeyForEmail(email));
    if (hit === '1') return true;
    if (hit === '0') return false;
  }
  return null;
}

/** Write premium flag for whichever identifiers we have. */
export async function setCachedPremiumFlag(
  userId: string | null | undefined,
  email: string | null | undefined,
  premium: boolean
): Promise<void> {
  const store = await resolveStore();
  if (!store) return;

  const value = premium ? '1' : '0';
  const ttl = ENROLLMENT_CACHE_TTL_SEC;
  try {
    if (userId) await store.set(enrollmentCacheKeyForUser(userId), value, ttl);
    if (email) await store.set(enrollmentCacheKeyForEmail(email), value, ttl);
  } catch {
    /* best-effort */
  }
}

/** Drop keys after webhook grant so the next read hits Postgres. */
export async function invalidatePremiumEnrollmentCache(
  userId: string | null | undefined,
  email: string | null | undefined
): Promise<void> {
  const store = await resolveStore();
  if (!store) return;

  try {
    if (userId) await store.del(enrollmentCacheKeyForUser(userId));
    if (email) await store.del(enrollmentCacheKeyForEmail(email));
  } catch {
    /* best-effort */
  }
}
