/** Rate limiting — Upstash Redis when configured, else in-memory (local dev). */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; retryAfterSec?: number };

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

/** Sync rate limit (in-memory only). */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  return memoryRateLimit(key, limit, windowMs);
}

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
