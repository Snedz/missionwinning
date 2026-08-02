/**
 * The invite link the founder copies out of the admin panel.
 *
 * `.226` — lifted out of `betaMetricsServer.ts`, which reaches Supabase before it
 * gets here, so this had never been executed by a test. It matters more than its
 * fifteen lines suggest: **it puts `PRIVATE_ACCESS_SECRET` into a URL**. That is
 * the whole point (the row's own comment: *"access from env, never stored in
 * DB"*), and it is also why the empty case has to be right — a link carrying
 * `access=` with nothing after it is a link that does not open the gate, handed to
 * a tester as though it does.
 *
 * Dependency-free so the shape can be asserted without a service-role client.
 */

/**
 * Build the share link for one invite code.
 *
 * Precedence matches the rest of the app: `PRIVATE_ACCESS_SECRET` first, then the
 * first entry of `PRIVATE_ACCESS_CODES`. `NEXT_PUBLIC_SITE_URL` wins over
 * `NEXT_PUBLIC_APP_URL` here — note that is the **opposite** order to
 * `stripeServer.appOrigin()`, which prefers APP_URL. Left as-is rather than
 * quietly unified: these two answer different questions (where a human is sent vs
 * where Stripe returns to), and changing which host an invite points at is a
 * founder decision, not a tidy-up.
 */
export function buildInviteShareLink(
  inviteCode: string,
  /** Injected so the link can be built without mutating the real environment. */
  env: Partial<Record<string, string | undefined>> = process.env
): string {
  const access =
    env.PRIVATE_ACCESS_SECRET?.trim() || env.PRIVATE_ACCESS_CODES?.split(',')[0]?.trim() || '';
  const raw =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.missionwinning.com';
  const base = raw.replace(/\/$/, '');
  const params = new URLSearchParams();
  // Omitted entirely when unset — `access=` with an empty value reads as a gated
  // link and opens nothing.
  if (access) params.set('access', access);
  params.set('invite', inviteCode);
  return `${base}/?${params.toString()}`;
}

export type InviteJourney = { iDayDone: boolean; btSessions: number; firstWorkout: boolean };

/**
 * Totals under the Invites card.
 *
 * Each stage is counted independently rather than as a funnel, because they are
 * not strictly nested: `first_landed_at` is written by the landing route and
 * `signed_up_user_id` by redemption, and `.218` found those arriving out of order
 * (or not at all) often enough that assuming `signedUp ⊆ landed` would understate
 * the thing the beta gate reads.
 */
export function inviteTotals(
  rows: Array<{
    first_landed_at?: string | null;
    signed_up_user_id?: string | null;
    iDayDone?: boolean;
    firstWorkout?: boolean;
  }>,
  target = 10
) {
  return {
    issued: rows.length,
    landed: rows.filter((r) => r.first_landed_at).length,
    signedUp: rows.filter((r) => r.signed_up_user_id).length,
    iDayDone: rows.filter((r) => r.iDayDone).length,
    withWorkout: rows.filter((r) => r.firstWorkout).length,
    target,
  };
}
