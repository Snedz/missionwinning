/**
 * Sync v2 rails for saved routines (templates).
 * Auth: Bearer required. Cursor pull includes tombstones.
 */
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, readBoundedJson, rejectOversizedBody, withApiLogging } from '../../../../../lib/mobile/http';
import { rateLimitAsync } from '../../../../../lib/mobile/rateLimit';
import { requireMobileUser } from '../../../../../lib/mobile/auth';
import { nextSyncCursor, parseSyncCursor, syncCursorFilter } from '../../../../../lib/mobile/syncCursor';
import { mobileSyncRoutinePushBodySchema, parseJsonBody } from '../../../../../lib/mobile/schemas';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logSyncFailure, logSyncThrown } from '../../../../../lib/mobile/syncFailure';

type Supabase = SupabaseClient;

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

  const auth = await requireMobileUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const bodyRead = await readBoundedJson(request);
  if ('oversized' in bodyRead) return bodyRead.oversized;
  const { raw } = bodyRead;
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
        error: logSyncThrown('mobile/sync/routines', e),
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

  const auth = await requireMobileUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const since = parseSyncCursor(request.nextUrl.searchParams.get('since'));
  if (!since) return NextResponse.json({ error: 'Invalid sync cursor' }, { status: 400 });
  const limitRaw = Number(request.nextUrl.searchParams.get('limit') ?? '100');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, Math.floor(limitRaw)), 100) : 100;

  const pull = supabase
    .from('routines')
    .select(
      'id, client_id, name, exercises, source_workout_client_id, revision, updated_at, deleted_at, created_at',
    )
    .eq('user_id', user.id)
    .order('updated_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit);
  const { data, error } = await (since.id
    ? pull.or(syncCursorFilter({ ...since, id: since.id }))
    : pull.gt('updated_at', since.updatedAt));

  if (error) {
    /*
     * `.211` — an opaque code, not the database's own words.
     *
     * These returned `error.message` from a Supabase failure straight to the
     * client, which leaks table names, column names and constraint identifiers
     * — a free schema map for anyone probing the mobile sync surface. The
     * detail still reaches the server log, where the person debugging it is.
     */
    console.error('[mobile/sync] %s', error.message);
    return NextResponse.json({ error: 'sync_failed' }, { status: 500 });
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
  const nextCursor = nextSyncCursor(rows, limit);

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
  status: 'ok' | 'error';
  error?: string;
}> {
  const now = new Date().toISOString();
  const updatedAt = now;

  const { data: existing } = await supabase
    .from('routines')
    .select('id, revision, deleted_at, updated_at')
    .eq('user_id', userId)
    .eq('client_id', r.clientId)
    .maybeSingle();

  if (existing) {
    const serverRev = (existing.revision as number) ?? 1;
    const incomingDeleted = Boolean(r.deletedAt);
    const serverDeleted = Boolean(existing.deleted_at);
    const shouldApply = r.revision > serverRev
      ? incomingDeleted || !serverDeleted
      : r.revision === serverRev && incomingDeleted && !serverDeleted;
    if (!shouldApply) {
      return {
        clientId: r.clientId,
        serverId: existing.id as string,
        revision: serverRev,
        updatedAt: existing.updated_at,
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
      .eq('revision', serverRev)
      .eq('updated_at', existing.updated_at)
      .select('id, revision, updated_at')
      .single();
    if (error) {
      return {
        clientId: r.clientId,
        serverId: '',
        revision: r.revision,
        updatedAt,
        status: 'error',
        error: logSyncFailure('mobile/sync/routines', error.message),
      };
    }
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
  if (error) {
    return {
      clientId: r.clientId,
      serverId: '',
      revision: r.revision,
      updatedAt,
      status: 'error',
      error: logSyncFailure('mobile/sync/routines', error.message),
    };
  }
  return {
    clientId: r.clientId,
    serverId: (inserted?.id as string) ?? '',
    revision: (inserted?.revision as number) ?? r.revision,
    updatedAt: (inserted?.updated_at as string) ?? updatedAt,
    status: 'ok',
  };
}
