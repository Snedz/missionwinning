/**
 * What counts as a user id we may write to a column that references `auth.users`.
 *
 * `.260` — this rule existed **twice**, byte-identical, on the revenue path:
 * [`stripeWebhook.ts`](stripeWebhook.ts) used it to decide which id to take off a
 * Checkout Session, and `premiumServer.grantEnrollmentFromWebhook` had its own
 * inline copy deciding whether to put that id in the `INSERT`. `.178`'s defect on
 * the two files that turn a payment into an entitlement — and the failure mode of
 * a drift here is quiet in the expensive direction: loosen one copy and the insert
 * takes an id the other rejected, which is a foreign-key error on the row that
 * grants somebody the thing they just paid for.
 *
 * Deliberately dependency-free, the `journey/basicComplete.ts` shape: both callers
 * are `server-only` modules, and importing either one to reach a five-line
 * predicate would drag a Stripe client or a Supabase admin into anything that
 * needs it.
 *
 * The pattern is RFC 4122 with the version nibble bounded to 1–8 and the variant
 * to 8/9/a/b, which is what Postgres `uuid` accepts *and* what excludes the two
 * strings most likely to arrive from a hand-made test event: the all-zero nil
 * UUID and a v0.
 */

export const AUTH_USER_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The trimmed id when it may be written to an `auth.users` FK, else null. */
export function asAuthUserId(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v || !AUTH_USER_ID_RE.test(v)) return null;
  return v;
}
