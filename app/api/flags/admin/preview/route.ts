/**
 * Founder preview of one subject against one catalog key.
 * Auth: beta admin email or x-beta-admin-secret | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { resolveBetaAdminActor } from '@/lib/api/betaAdminAuth';
import { parseQuery, flagsAdminPreviewQuerySchema } from '@/lib/apiSchemas';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { previewFlag } from '@/lib/featureFlags/featureFlagsServer';

export const dynamic = 'force-dynamic';

export const GET = withApiLogging('flags/admin/preview', async (request: NextRequest) => {
  if (!(await resolveBetaAdminActor(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const limited = await rateLimitAsync(`flags-preview:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = parseQuery(flagsAdminPreviewQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const result = await previewFlag(parsed.data.key, parsed.data.subject);
  if (!result.ok) {
    if (result.error === 'unknown_key' || result.error === 'invalid_subject') {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    if (result.error === 'query_failed') {
      return NextResponse.json({ error: 'query_failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: false, error: 'flags_unavailable' }, { status: 503 });
  }

  return NextResponse.json({
    on: result.decision.on,
    bucket: result.decision.bucket,
    reason: result.decision.reason,
  });
});
