/**
 * Sync custom exercises (user-defined moves).
 * Auth: Bearer required. Cursor pull includes tombstones.
 */
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, readBoundedJson, rejectOversizedBody, withApiLogging } from '../../../../../lib/mobile/http';
import { rateLimitAsync } from '../../../../../lib/mobile/rateLimit';
import { requireMobileUser } from '../../../../../lib/mobile/auth';
import { nextSyncCursor, parseSyncCursor, syncCursorFilter } from '../../../../../lib/mobile/syncCursor';
import { mobileSyncCustomPushBodySchema, parseJsonBody } from '../../../../../lib/mobile/schemas';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logSyncFailure, logSyncThrown } from '../../../../../lib/mobile/syncFailure';

type Supabase = SupabaseClient;

export const POST = withApiLogging('mobile/sync/customs', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-customs-push:${ip}`, 30, 60_000);
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
  const parsed = parseJsonBody(mobileSyncCustomPushBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const acks: Array<{
    clientId: string;
    serverId: string;
    revision: number;
    updatedAt: string;
    status: 'ok' | 'error';
    error?: string;
  }> = [];

  for (const ex of parsed.data.exercises) {
    try {
      acks.push(await upsertCustom(supabase, user.id, ex));
    } catch (e) {
      acks.push({
        clientId: ex.clientId,
        serverId: '',
        revision: ex.revision,
        updatedAt: ex.updatedAt ?? new Date().toISOString(),
        status: 'error',
        error: logSyncThrown('mobile/sync/customs', e),
      });
    }
  }

  return NextResponse.json({ ok: true, acks });
});

export const GET = withApiLogging('mobile/sync/customs', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-customs-pull:${ip}`, 60, 60_000);
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
    .from('custom_exercises')
    .select(
      'id, client_id, name, equipment, muscle_groups, revision, updated_at, deleted_at, created_at',
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
    equipment: (row.equipment as string) ?? 'any',
    muscleGroups: (row.muscle_groups as string) ?? '',
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
  equipment?: string;
  muscleGroups?: string;
  revision: number;
  updatedAt?: string;
  deletedAt?: string | null;
};

async function upsertCustom(
  supabase: Supabase,
  userId: string,
  ex: Incoming,
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
    .from('custom_exercises')
    .select('id, revision, deleted_at, updated_at')
    .eq('user_id', userId)
    .eq('client_id', ex.clientId)
    .maybeSingle();

  if (existing) {
    const serverRev = (existing.revision as number) ?? 1;
    const incomingDeleted = Boolean(ex.deletedAt);
    const serverDeleted = Boolean(existing.deleted_at);
    const shouldApply = ex.revision > serverRev
      ? incomingDeleted || !serverDeleted
      : ex.revision === serverRev && incomingDeleted && !serverDeleted;
    if (!shouldApply) {
      return {
        clientId: ex.clientId,
        serverId: existing.id as string,
        revision: serverRev,
        updatedAt: existing.updated_at,
        status: 'ok',
      };
    }
    const nextRev = Math.max(serverRev, ex.revision);
    const { data: updated, error } = await supabase
      .from('custom_exercises')
      .update({
        name: ex.name,
        equipment: ex.equipment ?? 'any',
        muscle_groups: ex.muscleGroups ?? '',
        revision: nextRev,
        updated_at: updatedAt,
        deleted_at: ex.deletedAt ?? null,
      })
      .eq('id', existing.id)
      .eq('revision', serverRev)
      .eq('updated_at', existing.updated_at)
      .select('id, revision, updated_at')
      .single();
    if (error) {
      return {
        clientId: ex.clientId,
        serverId: '',
        revision: ex.revision,
        updatedAt,
        status: 'error',
        error: logSyncFailure('mobile/sync/customs', error.message),
      };
    }
    return {
      clientId: ex.clientId,
      serverId: (updated?.id as string) ?? (existing.id as string),
      revision: (updated?.revision as number) ?? nextRev,
      updatedAt: (updated?.updated_at as string) ?? updatedAt,
      status: 'ok',
    };
  }

  const { data: inserted, error } = await supabase
    .from('custom_exercises')
    .insert({
      user_id: userId,
      client_id: ex.clientId,
      name: ex.name,
      equipment: ex.equipment ?? 'any',
      muscle_groups: ex.muscleGroups ?? '',
      revision: ex.revision,
      updated_at: updatedAt,
      deleted_at: ex.deletedAt ?? null,
      created_at: ex.createdAt ?? now,
    })
    .select('id, revision, updated_at')
    .single();
  if (error) {
    return {
      clientId: ex.clientId,
      serverId: '',
      revision: ex.revision,
      updatedAt,
      status: 'error',
      error: logSyncFailure('mobile/sync/customs', error.message),
    };
  }
  return {
    clientId: ex.clientId,
    serverId: (inserted?.id as string) ?? '',
    revision: (inserted?.revision as number) ?? ex.revision,
    updatedAt: (inserted?.updated_at as string) ?? updatedAt,
    status: 'ok',
  };
}
