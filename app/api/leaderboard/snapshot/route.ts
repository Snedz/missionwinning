/**
 * Signed-in leaderboard snapshot persist. Service-role upsert only.
 * Auth: session | Rate: 20/min/IP | Schema: leaderboardSnapshotBodySchema
 * Scores are computed from workout_logs / nutrition_logs / fitness_test_results.
 * See: app/api/INDEX.md, docs/API.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, leaderboardSnapshotBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { storeLeaderboardSnapshot } from '@/lib/leaderboardSnapshotServer';

export const POST = withApiLogging('leaderboard/snapshot', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`leaderboard-snapshot:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(leaderboardSnapshotBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = await storeLeaderboardSnapshot(user.id, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: result.status });
  }
  return NextResponse.json({ ok: true, stored: result.stored });
});
