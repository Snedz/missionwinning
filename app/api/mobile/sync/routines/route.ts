/**
 * Sync v2 rails for saved routines (templates).
 * Auth: Bearer required. Cursor pull includes tombstones.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { bearerAccessToken, hasMobileAppAccess } from '@/lib/mobileAccess';
import { mobileSyncRoutinePushBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { createClient } from '@supabase/supabase-js';

type Supabase = ReturnType<typeof createClient>;

async function requireUser(request: NextRequest) {
  const token = bearerAccessToken(request);
  if (!token || !(await hasMobileAppAccess(request))) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { error: NextResponse.json({ error: 'Unconfigured' }, { status: 503 }) } as const;
  }
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  return { supabase, user } as const;
}

export const POST = withApiLogging('mobile/sync/routines', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-routines-push:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  const auth = await requireUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(mobileSyncRoutinePushBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const acks: Array<{
    clientId: string;
    serverId: string;
    revision: number;
    updatedAt: string;
    status: 'ok' | 'error';
    error?: string;
  }> = [];

  for (const r of parsed.data.routines) {
    try {
      acks.push(await upsertRoutine(supabase, user.id, r));
    } catch (e) {
      acks.push({
        clientId: r.clientId,
        serverId: '',
        revision: r.revision,
        updatedAt: r.updatedAt ?? new Date().toISOString(),
        status: 'error',
        error: e instanceof Error ? e.message : 'upsert failed',
      });
    }
  }

  return NextResponse.json({ ok: true, acks });
});

export const GET = withApiLogging('mobile/sync/routines', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-routines-pull:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  const auth = await requireUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const since = request.nextUrl.searchParams.get('since') ?? '1970-01-01T00:00:00.000Z';
  const limitRaw = Number(request.nextUrl.searchParams.get('limit') ?? '100');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, Math.floor(limitRaw)), 100) : 100;

  const { data, error } = await supabase
    .from('routines')
    .select(
      'id, client_id, name, exercises, source_workout_client_id, revision, updated_at, deleted_at, created_at',
    )
    .eq('user_id', user.id)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const items = rows.map((row) => ({
    clientId: row.client_id as string,
    serverId: row.id as string,
    name: row.name as string,
    createdAt: (row.created_at as string) ?? undefined,
    sourceWorkoutId: (row.source_workout_client_id as string | null) ?? null,
    exercises: Array.isArray(row.exercises) ? row.exercises : [],
    revision: (row.revision as number) ?? 1,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string | null) ?? null,
  }));
  const nextCursor =
    rows.length === limit ? (rows[rows.length - 1]?.updated_at as string | undefined) ?? null : null;

  return NextResponse.json({ items, nextCursor });
});

type Incoming = {
  clientId: string;
  name: string;
  createdAt?: string;
  sourceWorkoutId?: string | null;
  exercises: unknown[];
  revision: number;
  updatedAt?: string;
  deletedAt?: string | null;
};

async function upsertRoutine(
  supabase: Supabase,
  userId: string,
  r: Incoming,
): Promise<{
  clientId: string;
  serverId: string;
  revision: number;
  updatedAt: string;
  status: 'ok';
}> {
  const now = new Date().toISOString();
  const updatedAt = r.updatedAt && r.updatedAt > now ? r.updatedAt : now;

  const { data: existing } = await supabase
    .from('routines')
    .select('id, revision, deleted_at')
    .eq('user_id', userId)
    .eq('client_id', r.clientId)
    .maybeSingle();

  if (existing) {
    const serverRev = (existing.revision as number) ?? 1;
    const incomingDeleted = Boolean(r.deletedAt);
    const serverDeleted = Boolean(existing.deleted_at);
    const shouldApply = incomingDeleted || (!serverDeleted && r.revision >= serverRev);
    if (!shouldApply) {
      return {
        clientId: r.clientId,
        serverId: existing.id as string,
        revision: serverRev,
        updatedAt,
        status: 'ok',
      };
    }
    const nextRev = Math.max(serverRev, r.revision);
    const { data: updated, error } = await supabase
      .from('routines')
      .update({
        name: r.name,
        exercises: r.exercises ?? [],
        source_workout_client_id: r.sourceWorkoutId ?? null,
        revision: nextRev,
        updated_at: updatedAt,
        deleted_at: r.deletedAt ?? null,
      })
      .eq('id', existing.id)
      .select('id, revision, updated_at')
      .single();
    if (error) throw new Error(error.message);
    return {
      clientId: r.clientId,
      serverId: (updated?.id as string) ?? (existing.id as string),
      revision: (updated?.revision as number) ?? nextRev,
      updatedAt: (updated?.updated_at as string) ?? updatedAt,
      status: 'ok',
    };
  }

  const { data: inserted, error } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      client_id: r.clientId,
      name: r.name,
      exercises: r.exercises ?? [],
      source_workout_client_id: r.sourceWorkoutId ?? null,
      revision: r.revision,
      updated_at: updatedAt,
      deleted_at: r.deletedAt ?? null,
      created_at: r.createdAt ?? now,
    })
    .select('id, revision, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return {
    clientId: r.clientId,
    serverId: (inserted?.id as string) ?? '',
    revision: (inserted?.revision as number) ?? r.revision,
    updatedAt: (inserted?.updated_at as string) ?? updatedAt,
    status: 'ok',
  };
}
