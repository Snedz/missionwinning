/**
 * Signed-in Mission Server messages.
 * Auth: session. Rate: 20/min/IP. Body: Zod socialMessageBodySchema.
 * Guests: 401. Missing table: fail open (stored/available false). Opaque error code only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest, getUserScopedClient } from '@/lib/supabaseRequestAuth';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import {
  parseJsonBody,
  parseQuery,
  socialMessageBodySchema,
  socialMessagesQuerySchema,
} from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { isMissingRelation, rowToGarageMessage } from '@/lib/social/cloud';

function opaqueDbError(error: { code?: string; message?: string } | null) {
  if (isMissingRelation(error)) {
    return NextResponse.json({ ok: true, stored: false, available: false, messages: [] });
  }
  console.error('[social/messages] db error %s', error?.code ?? 'unknown');
  return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
}

export const GET = withApiLogging('social/messages', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`social-messages-get:${ip}`, 60, 60_000);
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

  const parsed = parseQuery(socialMessagesQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const scoped = getUserScopedClient(request);
  if (!scoped) {
    return NextResponse.json({ ok: true, available: false, messages: [] });
  }

  const limit = parsed.data.limit ?? 100;
  let query = scoped
    .from('social_messages')
    .select('id, user_id, channel_slug, body, kind, author_call_sign, author_mission_id, created_at')
    .eq('channel_slug', parsed.data.channel)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (parsed.data.since) {
    query = query.gt('created_at', parsed.data.since);
  }

  const { data, error } = await query;
  if (error) return opaqueDbError(error);

  const messages = (data ?? [])
    .map((row) =>
      rowToGarageMessage(row, { mine: (row as { user_id?: string }).user_id === user.id })
    )
    .filter((m) => m !== null);

  return NextResponse.json({ ok: true, available: true, messages });
});

export const POST = withApiLogging('social/messages', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`social-messages:${ip}`, 20, 60_000);
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
  const parsed = parseJsonBody(socialMessageBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const scoped = getUserScopedClient(request);
  if (!scoped) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error } = await scoped.from('social_messages').insert({
    id: parsed.data.id,
    user_id: user.id,
    channel_slug: parsed.data.channelSlug,
    body: parsed.data.body,
    kind: parsed.data.kind ?? 'text',
    author_call_sign: parsed.data.authorCallSign,
    author_mission_id: parsed.data.authorMissionId ?? null,
    created_at: parsed.data.createdAt,
  });

  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true, stored: true });
    return opaqueDbError(error);
  }
  return NextResponse.json({ ok: true, stored: true });
});
