/**
 * The row a paid webhook writes to `enrollments` — the moment a payment becomes
 * an entitlement.
 *
 * `.225` — lifted out of `premiumServer.grantEnrollmentFromWebhook`, which reaches
 * Supabase on its first line, so every decision in here was only reachable through
 * a service-role client and none of it had ever been executed by a test. Nothing
 * about the shape changed; it is the same object, in a file that can be called.
 *
 * Two of these decisions are load-bearing and neither is obvious from the call
 * site:
 *
 * - **`user_id` is dropped unless it looks like an `auth.users` id.** Stripe
 *   Payment Links and hand-made test events put arbitrary strings in
 *   `metadata.user_id`, and `enrollments.user_id` is a foreign key — so an
 *   unchecked value fails the insert that grants somebody what they just paid
 *   for. The predicate lives in `authUserId.ts` because it existed twice.
 * - **The email is the identity.** It is lowercased and trimmed here because it
 *   is what `isPremiumForUser` later matches on; a capitalised address inserted
 *   raw is an enrollment the owner cannot see.
 */

import { asAuthUserId } from '@/lib/authUserId';

export type EnrollmentWebhookPayload = {
  user_email: string;
  user_id?: string | null;
  product_id?: string;
  provider: string;
  external_id: string;
};

/**
 * The insert row. `user_id` is present only when it may legally be written.
 *
 * The caller retries without `user_id` on a foreign-key error — a UUID that is
 * well-formed but belongs to no auth user is still possible, and losing the
 * enrollment over it would be worse than an email-only row.
 */
export function buildEnrollmentRow(
  payload: EnrollmentWebhookPayload
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    user_email: payload.user_email.trim().toLowerCase(),
    product_id: payload.product_id ?? 'super-bundle',
    plan: 'bundle',
    status: 'active',
    premium_granted: true,
    provider: payload.provider,
    external_id: payload.external_id,
  };

  const uid = asAuthUserId(payload.user_id);
  if (uid) row.user_id = uid;

  return row;
}

/**
 * Does this Postgres error mean "that user_id is not in auth.users"?
 *
 * `23503` is foreign_key_violation; the message match catches drivers that
 * report the constraint without the code. Used to decide whether retrying
 * without `user_id` is worth it — any other error is a real failure and must
 * surface rather than be retried into a silently degraded row.
 */
export function isAuthUserForeignKeyError(
  error: { code?: string | null; message?: string | null } | null | undefined
): boolean {
  if (!error) return false;
  return error.code === '23503' || /foreign key|auth\.users/i.test(error.message || '');
}
