import { createHash } from 'node:crypto';

/** Opaque short id for API responses (not reversible for guessing). */
export function redactUserId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 12);
}
