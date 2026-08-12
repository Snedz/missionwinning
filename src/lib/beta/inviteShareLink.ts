/**
 * The invite link the founder copies out of the admin panel.
 *
 * `.262` — lifted out of `betaMetricsServer.ts`, which reaches Supabase before it
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
 * Lands on `/private?invite=…` — the same shape as the shipped beta-invite email
 * and `print-beta-invite.ts`. The old `/?access=…&invite=…` shape dead-ended:
 * when query access worked, the gate set a cookie and redirected back to `/` with
 * the invite still in the query, so the athlete saw marketing instead of the
 * invitee screen (`PrivateTeaserClient` only renders on `/private`).
 *
 * `?access=` is appended only when `PRIVATE_ALLOW_QUERY_ACCESS=true` (preview /
 * local one-click unlock). Production rejects query bypass unless that flag is
 * set, so the access code stays out-of-band — same as the email body.
 *
 * Precedence for the optional access value matches the rest of the app:
 * `PRIVATE_ACCESS_SECRET` first, then the first entry of `PRIVATE_ACCESS_CODES`.
 * `NEXT_PUBLIC_SITE_URL` wins over `NEXT_PUBLIC_APP_URL` here — note that is the
 * **opposite** order to `stripeServer.appOrigin()`, which prefers APP_URL.
 */
export function buildInviteShareLink(
  inviteCode: string,
  /** Injected so the link can be built without mutating the real environment. */
  env: Partial<Record<string, string | undefined>> = process.env
): string {
  const raw =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.missionwinning.com';
  const base = raw.replace(/\/$/, '');
  const params = new URLSearchParams();
  params.set('invite', inviteCode);
  const allowQuery = env.PRIVATE_ALLOW_QUERY_ACCESS === 'true';
  if (allowQuery) {
    const access =
      env.PRIVATE_ACCESS_SECRET?.trim() ||
      env.PRIVATE_ACCESS_CODES?.split(',')[0]?.trim() ||
      '';
    // Omitted entirely when unset — `access=` with an empty value reads as a gated
    // link and opens nothing.
    if (access) params.set('access', access);
  }
  return `${base}/private?${params.toString()}`;
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
