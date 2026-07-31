/**
 * Beta funnel metrics — admin allowlist only.
 * Auth: session + BETA_ADMIN_EMAILS | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { computeBetaFunnelAggregate } from '@/lib/betaMetricsServer';
import { authorizeBetaAdmin } from '@/lib/api/betaAdminAuth';

/** Founder beta funnel — all users' journey progress (requires BETA_ADMIN_EMAILS or BETA_ADMIN_SECRET). */
export const GET = withApiLogging('beta/metrics', async(request: NextRequest) => {
  // `.214` — one definition of the founder check; see `api/betaAdminAuth.ts`.
  const authorized = await authorizeBetaAdmin(request);

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
