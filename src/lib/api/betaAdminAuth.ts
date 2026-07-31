import 'server-only';

/**
 * One definition of "is this the founder".
 *
 * `.214` — this check was written inline in `app/api/beta/invites/route.ts` and
 * again in `app/api/beta/metrics/route.ts`, and `.214` needed a third route.
 * Three copies of an authorization predicate is how one of them ends up subtly
 * more permissive than the others, and `.178`'s rule exists for exactly this:
 * one concept, one home.
 *
 * Two ways in, both deliberate:
 *
 *   - `x-beta-admin-secret` matching `BETA_ADMIN_SECRET` — for curl and scripts,
 *     where there is no session to read.
 *   - a Supabase session cookie whose email is listed in `BETA_ADMIN_EMAILS` —
 *     for the founder using the app on their own phone, which is how
 *     `BetaAdminPanel` reaches it.
 *
 * **Fails closed on missing configuration.** With neither env var set this
 * returns `false` for everyone, including the founder — which is correct: an
 * unconfigured admin check that defaulted to open would expose every beta
 * tester's feedback to anonymous traffic the moment it deployed.
 */

import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isBetaAdminEmail } from '@/lib/betaMetricsServer';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';

export async function authorizeBetaAdmin(request: NextRequest): Promise<boolean> {
  const secret = request.headers.get('x-beta-admin-secret');
  if (secret && secret === process.env.BETA_ADMIN_SECRET) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractSupabaseAccessToken(request.cookies);
  if (!url || !anon || !token) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  return isBetaAdminEmail(user?.email);
}
