/** Rate limiting — Upstash Redis when configured, else in-memory (local dev). */

import { isIP } from 'node:net';

const MAX_MEMORY_BUCKETS = 10_000;

export type RateLimitResult = { ok: boolean; retryAfterSec?: number };

export function trustedClientIp(headers: Headers, env: Record<string, string | undefined>): string {
  const raw = env.VERCEL === '1' ? headers.get('x-vercel-forwarded-for')
    : env.MW_TRUST_PROXY_HEADERS === '1' ? headers.get('x-forwarded-for') ?? headers.get('x-real-ip')
    : null;
  const ip = raw?.split(',')[0]?.trim();
  return ip && isIP(ip) ? ip : 'unknown';
}

export function createMemoryRateLimit(maxBuckets = MAX_MEMORY_BUCKETS, clock = Date.now) {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  let sweepAt = 0;

  return (key: string, limit: number, windowMs: number): RateLimitResult => {
    const now = clock();
    if (now >= sweepAt) {
      for (const [id, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(id);
      }
      sweepAt = now + 1000;
    }
    const bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      if (!bucket && buckets.size >= maxBuckets) return { ok: false, retryAfterSec: 1 };
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true };
    }
    if (bucket.count >= limit) {
      return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
    }
    bucket.count += 1;
    return { ok: true };
  };
}

const memoryRateLimit = createMemoryRateLimit();

/** Async rate limit — Upstash when UPSTASH_REDIS_* env is set. */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url, token });
      const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        analytics: false,
      });
      const result = await limiter.limit(key);
      if (result.success) return { ok: true };
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
      };
    } catch {
      return memoryRateLimit(key, limit, windowMs);
    }
  }
  return memoryRateLimit(key, limit, windowMs);
}
