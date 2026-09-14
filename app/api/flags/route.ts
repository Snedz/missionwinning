/**
 * Athlete flag evaluate — boolean map for this subject only.
 * Auth: session or optional deviceId | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { parseQuery, flagsEvalQuerySchema } from '@/lib/apiSchemas';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { evaluateFlagsForSubject } from '@/lib/featureFlags/featureFlagsServer';

export const dynamic = 'force-dynamic';

export const GET = withApiLogging('flags/evaluate', async (request: NextRequest) => {
  const limited = await rateLimitAsync(`flags-eval:${clientIp(request)}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = parseQuery(flagsEvalQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  const flags = await evaluateFlagsForSubject({
    userId: user?.id ?? null,
    email: user?.email ?? null,
    deviceId: parsed.data.deviceId ?? null,
  });

  return NextResponse.json({ flags });
});
