/**
 * What to do with an auth.users row after hosted signup from a blocked region.
 *
 * The panel can be skipped; Supabase creates the user before our callback.
 * We may reap only a brand-new account with no product data. An existing
 * athlete who later appears from an excluded region is refused a session
 * and is not deleted.
 */

/** Auto-created by `handle_new_user` — not evidence the athlete used the product. */
export const BLOCKED_SIGNUP_OWNED_TABLES = [
  'workout_logs',
  'enrollments',
  'nutrition_logs',
  'journey_events',
  'crypto_payment_intents',
] as const;

export const BLOCKED_SIGNUP_REAP_WINDOW_MS = 15 * 60 * 1000;

export type BlockedSignupDisposition = 'refuse' | 'reap';

export function blockedSignupDisposition(input: {
  createdAt: string | null | undefined;
  hasOwnedRows: boolean;
  unknownOwnedRows?: boolean;
  nowMs?: number;
}): BlockedSignupDisposition {
  if (input.unknownOwnedRows || input.hasOwnedRows) return 'refuse';
  if (!input.createdAt) return 'refuse';
  const created = Date.parse(input.createdAt);
  if (!Number.isFinite(created)) return 'refuse';
  const age = (input.nowMs ?? Date.now()) - created;
  if (age < 0 || age > BLOCKED_SIGNUP_REAP_WINDOW_MS) return 'refuse';
  return 'reap';
}
