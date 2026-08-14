/**
 * Signed-in Garage presence. Auth: session. Rate: 20/min.
 * Never invent other athletes — only rows that exist.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest, getUserScopedClient } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, socialPresenceBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { isMissingRelation, rowToRemotePresence } from '@/lib/social/cloud';

function opaqueDbError(error: { code?: string; message?: string } | null) {
  if (isMissingRelation(error)) {
    return NextResponse.json({ ok: true, stored: false, available: false, people: [] });
  }
  console.error('[social/presence] db error %s', error?.code ?? 'unknown');
  return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
}

export const GET = withApiLogging('social/presence', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`social-presence-get:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scoped = getUserScopedClient(request);
  if (!scoped) return NextResponse.json({ ok: true, available: false, people: [] });

  const { data, error } = await scoped
    .from('social_presence')
    .select('user_id, status, call_sign, last_seen')
    .neq('user_id', user.id);

  if (error) return opaqueDbError(error);

  const people = (data ?? []).map(rowToRemotePresence).filter((p) => p !== null);
  return NextResponse.json({ ok: true, available: true, people });
});

export const POST = withApiLogging('social/presence', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`social-presence:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(socialPresenceBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const scoped = getUserScopedClient(request);
  if (!scoped) return NextResponse.json({ ok: true, stored: false });

  const { error } = await scoped.from('social_presence').upsert(
    {
      user_id: user.id,
      status: parsed.data.status,
      call_sign: parsed.data.callSign,
      last_seen: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) return opaqueDbError(error);
  return NextResponse.json({ ok: true, stored: true });
});
