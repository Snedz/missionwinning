/**
 * Post-unlock destination for the private gate — shared by proxy read sites,
 * PrivateTeaserClient, and app/private/page.tsx.
 */
import { sanitizeNextPath } from '@/lib/safeRedirect';

/** Resolve `?next=` after unlock; rejects open redirects. */
export function privateGateReturnPath(
  next: string | null | undefined,
  fallback = '/'
): string {
  return sanitizeNextPath(next, fallback);
}
