/**
 * The `week_logged` row an upsert should write, and who is allowed to write one.
 *
 * This is a separate pure module for the reason `pushSubscriptionRow.ts` is: the rule it
 * encodes is the kind that gets silently un-done. The route used to 401 every guest, so
 * the boss metric could only ever move for people who created an account — which is the
 * opposite of who the product is for. Relaxing that guard is correct; relaxing it
 * *carelessly* is how an unauthenticated endpoint ends up as a free write API.
 *
 * The contract:
 *   * **Signed in** → owner is `user_id`. `device_id` is stored alongside when the client
 *     sends one, because a row carrying BOTH columns is what lets
 *     `mw_week4_retention_weekly()` collapse the guest weeks an athlete logged before
 *     they signed up onto their account cohort. Without it they become two cohorts and
 *     the denominator double-counts them.
 *   * **Accountless** → owner is `device_id`, and only for a device that has actually
 *     opted into the return channel. `hasPushConsent` is that consent, checked server-side
 *     against `push_subscriptions`; it is not a client assertion, because a client
 *     assertion is just the ability to claim consent.
 *   * **Neither** → no row. Returning null rather than guessing keeps the route honest.
 */

export interface WeekLoggedOwnerInput {
  /** Supabase user id when a session cookie resolved, else null. */
  userId: string | null;
  /** Client device UUID from the body; required for an accountless write. */
  deviceId?: string | undefined;
  /** Server-side lookup: does this device hold a push subscription? */
  hasPushConsent?: boolean | undefined;
}

export type WeekLoggedOwner =
  | { ok: true; owner: 'account'; userId: string; deviceId: string | null }
  | { ok: true; owner: 'device'; userId: null; deviceId: string }
  /**
   * Both refusal reasons are `403`, not `401`. A caller with no session is not
   * "unauthenticated" — they are the modal athlete — and answering 401 would invite a
   * client to treat a refusal as a retryable auth problem or a reason to sign up.
   */
  | { ok: false; reason: 'device_id_required' | 'consent_required' };

export type WeekLoggedRow = {
  user_id: string | null;
  device_id: string | null;
  iso_week: string;
};

/** Device ids are client-generated UUIDs; anything wildly off-shape is a probe. */
export function isPlausibleDeviceId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64;
}

/**
 * Decide the owner for one `week_logged` write.
 *
 * Note the ordering: an accountless caller without consent is refused *before* we look
 * at anything else, and a signed-in caller never needs consent because an account is
 * itself the identity. Making consent a precondition only for the anonymous path is what
 * keeps the privacy decision from accidentally applying to signed-in athletes who never
 * wanted reminders.
 */
export function resolveWeekLoggedOwner(input: WeekLoggedOwnerInput): WeekLoggedOwner {
  const { userId, deviceId, hasPushConsent } = input;

  if (userId) {
    return {
      ok: true,
      owner: 'account',
      userId,
      deviceId: isPlausibleDeviceId(deviceId) ? deviceId : null,
    };
  }

  if (!isPlausibleDeviceId(deviceId)) {
    return { ok: false, reason: 'device_id_required' };
  }

  if (!hasPushConsent) {
    return { ok: false, reason: 'consent_required' };
  }

  return { ok: true, owner: 'device', userId: null, deviceId };
}

export function buildWeekLoggedRow(
  owner: Extract<WeekLoggedOwner, { ok: true }>,
  isoWeek: string
): WeekLoggedRow {
  return {
    user_id: owner.userId,
    device_id: owner.deviceId,
    iso_week: isoWeek,
  };
}