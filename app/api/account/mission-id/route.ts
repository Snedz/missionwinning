/**
 * Mission ID — sequential integer for the signed-in account.
 * Auth: session | Rate: 30/min/user | GET only (no client mint)
 * See: app/api/INDEX.md, docs/API.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { claimMissionIdForUser } from '@/lib/missionIdServer';

export const GET = withApiLogging('account/mission-id', async (request: NextRequest) => {
  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: 'Sign in required' }, { status: 401 });
  }

  const limited = await rateLimitAsync(`account-mission-id:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 503 });
  }

  try {
    const missionId = await claimMissionIdForUser(admin, user);
    return NextResponse.json(
      { ok: true, missionId },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('mission id claim failed:', err);
    return NextResponse.json({ ok: false, error: 'Claim failed' }, { status: 502 });
  }
});
