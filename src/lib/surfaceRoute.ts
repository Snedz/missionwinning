import type { Metadata } from 'next';
import { isSurfaceEnabled, type Surface } from '@/lib/surface';

/**
 * Metadata helper for a parkable route.
 *
 * Reachability itself is enforced in `proxy.ts` (middleware), not here: the `(app)`
 * layout streams, so by the time a page component could call `notFound()` the 200
 * shell has already flushed and the status can no longer change. The middleware
 * rewrites to `/_not-found` before any of that, which is also one place instead of
 * one per route — and it covers API routes with the same check.
 *
 * This only keeps a parked route out of search results if something links to it.
 */
export function surfaceMetadata(surface: Surface, base: Metadata = {}): Metadata {
  if (isSurfaceEnabled(surface)) return base;
  return { ...base, robots: { index: false, follow: false } };
}
