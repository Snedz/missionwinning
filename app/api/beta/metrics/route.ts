/**
 * Beta funnel metrics — admin allowlist only.
 * Auth: session + BETA_ADMIN_EMAILS | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { computeBetaFunnelAggregate, isBetaAdminEmail } from '@/lib/betaMetricsServer';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';

/** Founder beta funnel — all users' journey progress (requires BETA_ADMIN_EMAILS or BETA_ADMIN_SECRET). */
export const GET = withApiLogging('beta/metrics', async(request: NextRequest) => {
  const secret = request.headers.get('x-beta-admin-secret');
  const secretOk = secret && secret === process.env.BETA_ADMIN_SECRET;

  let authorized = secretOk;

  if (!authorized) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = extractSupabaseAccessToken(request.cookies);

    if (url && anon && token) {
      const supabase = createClient(url, anon);
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      authorized = isBetaAdminEmail(user?.email);
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const metrics = await computeBetaFunnelAggregate();
  if (!metrics) {
    return NextResponse.json(
      { error: 'Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }

  return NextResponse.json(metrics);
});
