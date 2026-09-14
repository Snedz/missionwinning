/**
 * Founder flags console — catalog + overrides + audit.
 * Auth: beta admin email or x-beta-admin-secret | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { resolveBetaAdminActor } from '@/lib/api/betaAdminAuth';
import { parseJsonBody, flagsAdminPatchSchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { loadAdminFlags, patchFlag } from '@/lib/featureFlags/featureFlagsServer';

export const dynamic = 'force-dynamic';

function unavailable(): NextResponse {
  return NextResponse.json({ ok: false, error: 'flags_unavailable' }, { status: 503 });
}

export const GET = withApiLogging('flags/admin', async (request: NextRequest) => {
  if (!(await resolveBetaAdminActor(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await loadAdminFlags();
  if (!result.ok) {
    if (result.error === 'query_failed') {
      return NextResponse.json({ error: 'query_failed' }, { status: 500 });
    }
    return unavailable();
  }

  return NextResponse.json({ ok: true, flags: result.flags, events: result.events });
});

export const PATCH = withApiLogging('flags/admin/patch', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  const actor = await resolveBetaAdminActor(request);
  if (!actor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limited = await rateLimitAsync(`flags-admin:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(flagsAdminPatchSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const written = await patchFlag({
    key: parsed.data.key,
    percent: parsed.data.percent,
    killed: parsed.data.killed,
    allowlist: parsed.data.allowlist,
    actor,
  });

  if (!written.ok) {
    if (written.error === 'unknown_key' || written.error === 'invalid_allowlist' || written.error === 'nothing_to_update') {
      return NextResponse.json({ error: written.error }, { status: 400 });
    }
    if (written.error === 'query_failed') {
      return NextResponse.json({ error: 'query_failed' }, { status: 500 });
    }
    return unavailable();
  }

  return NextResponse.json({ ok: true, flag: written.flag });
});
