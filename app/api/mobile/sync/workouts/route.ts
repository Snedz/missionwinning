/**
 * Sync v2 — full-fidelity workout batch push + cursor pull.
 * Auth: Bearer required. Legacy POST /api/mobile/workouts kept for one release.
 */
import { NextRequest, NextResponse } from 'next/server';
import { flattenExercises, groupFlatSets, normalizeCloudExercises } from '@/lib/sync/normalizeExercises';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { bearerAccessToken, hasMobileAppAccess } from '@/lib/mobileAccess';
import {
  mobileSyncPushBodySchema,
  parseJsonBody,
} from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

type Supabase = SupabaseClient;

type RequireUserResult =
  | { error: NextResponse }
  | { supabase: Supabase; user: User; token: string };

async function requireUser(request: NextRequest): Promise<RequireUserResult> {
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
  return { supabase, user, token } as const;
}

export const POST = withApiLogging('mobile/sync/workouts', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-push:${ip}`, 30, 60_000);
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
  const parsed = parseJsonBody(mobileSyncPushBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const acks: Array<{
    clientId: string;
    serverId: string;
    revision: number;
    updatedAt: string;
    status: 'ok' | 'claimed' | 'error';
    error?: string;
  }> = [];

  for (const w of parsed.data.workouts) {
    try {
      const ack = await upsertWorkout(supabase, user.id, w);
      acks.push(ack);
    } catch (e) {
      acks.push({
        clientId: w.clientId,
        serverId: '',
        revision: w.revision,
        updatedAt: w.updatedAt ?? new Date().toISOString(),
        status: 'error',
        error: e instanceof Error ? e.message : 'upsert failed',
      });
    }
  }

  return NextResponse.json({ ok: true, acks });
});

export const GET = withApiLogging('mobile/sync/workouts', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-pull:${ip}`, 60, 60_000);
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
    .from('workout_logs')
    .select(
      'id, client_id, workout_name, started_at, completed_at, duration_seconds, exercises, total_volume, revision, updated_at, deleted_at, weight_unit, session_id, set_count',
    )
    .eq('user_id', user.id)
    .gt('updated_at', since)
    .order('updated_at', { ascending: true })
    .limit(limit);

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
  const items = rows.map((row) => rowToSyncItem(row));
  const nextCursor =
    rows.length === limit ? (rows[rows.length - 1]?.updated_at as string | undefined) ?? null : null;

  return NextResponse.json({ items, nextCursor });
});

type Incoming = {
  clientId: string;
  workoutName: string;
  completedAt: string;
  durationSeconds: number;
  setCount: number;
  totalVolume: number;
  sessionId?: string | null;
  weightUnit?: string;
  revision: number;
  updatedAt?: string;
  deletedAt?: string | null;
  sets: unknown[];
};

async function upsertWorkout(
  supabase: Supabase,
  userId: string,
  w: Incoming,
): Promise<{
  clientId: string;
  serverId: string;
  revision: number;
  updatedAt: string;
  status: 'ok' | 'claimed';
}> {
  const now = new Date().toISOString();
  const updatedAt = w.updatedAt && w.updatedAt > now ? w.updatedAt : now;
  const completedAt = w.completedAt;
  const started = new Date(new Date(completedAt).getTime() - w.durationSeconds * 1000).toISOString();
  // Store the canonical nested shape so web engines can read what Android logged.
  const exercises = groupFlatSets(w.sets ?? []);
  const weightUnit = w.weightUnit === 'lb' ? 'lb' : 'kg';

  // Existing by client_id
  const { data: byClient } = await supabase
    .from('workout_logs')
    .select('id, revision, deleted_at')
    .eq('user_id', userId)
    .eq('client_id', w.clientId)
    .maybeSingle();

  if (byClient) {
    const serverRev = (byClient.revision as number) ?? 1;
    // Tombstone always wins; else highest revision wins (equal → accept incoming)
    const incomingDeleted = Boolean(w.deletedAt);
    const serverDeleted = Boolean(byClient.deleted_at);
    const shouldApply =
      incomingDeleted ||
      (!serverDeleted && w.revision >= serverRev);

    if (!shouldApply) {
      return {
        clientId: w.clientId,
        serverId: byClient.id as string,
        revision: serverRev,
        updatedAt,
        status: 'ok',
      };
    }

    const nextRev = Math.max(serverRev, w.revision);
    const { data: updated, error } = await supabase
      .from('workout_logs')
      .update({
        workout_name: w.workoutName,
        started_at: started,
        completed_at: completedAt,
        duration_seconds: w.durationSeconds,
        exercises,
        total_volume: w.totalVolume,
        revision: nextRev,
        updated_at: updatedAt,
        deleted_at: w.deletedAt ?? null,
        weight_unit: weightUnit,
        session_id: w.sessionId ?? null,
        set_count: w.setCount,
      })
      .eq('id', byClient.id)
      .select('id, revision, updated_at')
      .single();

    if (error) throw new Error(error.message);
    return {
      clientId: w.clientId,
      serverId: (updated?.id as string) ?? (byClient.id as string),
      revision: (updated?.revision as number) ?? nextRev,
      updatedAt: (updated?.updated_at as string) ?? updatedAt,
      status: 'ok',
    };
  }

  // Legacy-claim: match fabricated rows without client_id
  const { data: legacy } = await supabase
    .from('workout_logs')
    .select('id, revision')
    .eq('user_id', userId)
    .is('client_id', null)
    .eq('workout_name', w.workoutName)
    .eq('completed_at', completedAt)
    .limit(1)
    .maybeSingle();

  if (legacy) {
    const nextRev = Math.max((legacy.revision as number) ?? 1, w.revision);
    const { data: claimed, error } = await supabase
      .from('workout_logs')
      .update({
        client_id: w.clientId,
        workout_name: w.workoutName,
        started_at: started,
        completed_at: completedAt,
        duration_seconds: w.durationSeconds,
        exercises,
        total_volume: w.totalVolume,
        revision: nextRev,
        updated_at: updatedAt,
        deleted_at: w.deletedAt ?? null,
        weight_unit: weightUnit,
        session_id: w.sessionId ?? null,
        set_count: w.setCount,
      })
      .eq('id', legacy.id)
      .select('id, revision, updated_at')
      .single();

    if (error) throw new Error(error.message);
    return {
      clientId: w.clientId,
      serverId: (claimed?.id as string) ?? (legacy.id as string),
      revision: (claimed?.revision as number) ?? nextRev,
      updatedAt: (claimed?.updated_at as string) ?? updatedAt,
      status: 'claimed',
    };
  }

  const { data: inserted, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      client_id: w.clientId,
      workout_name: w.workoutName,
      started_at: started,
      completed_at: completedAt,
      duration_seconds: w.durationSeconds,
      exercises,
      total_volume: w.totalVolume,
      revision: w.revision,
      updated_at: updatedAt,
      deleted_at: w.deletedAt ?? null,
      weight_unit: weightUnit,
      session_id: w.sessionId ?? null,
      set_count: w.setCount,
    })
    .select('id, revision, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return {
    clientId: w.clientId,
    serverId: (inserted?.id as string) ?? '',
    revision: (inserted?.revision as number) ?? w.revision,
    updatedAt: (inserted?.updated_at as string) ?? updatedAt,
    status: 'ok',
  };
}

function rowToSyncItem(row: Record<string, unknown>) {
  // Android's installed builds expect a flat set array. Rows are stored nested, so
  // flatten on the way out — this keeps old app versions working with no release.
  const nested = normalizeCloudExercises(row.exercises);
  const sets = flattenExercises(
    (row.client_id as string | null) ?? (row.id as string),
    row.completed_at as string,
    nested
  );
  return {
    clientId: (row.client_id as string | null) ?? null,
    serverId: row.id as string,
    workoutName: row.workout_name as string,
    completedAt: row.completed_at as string,
    durationSeconds: (row.duration_seconds as number) ?? 0,
    setCount: (row.set_count as number) ?? (Array.isArray(sets) ? sets.length : 0),
    totalVolume: Number(row.total_volume ?? 0),
    sessionId: (row.session_id as string | null) ?? null,
    weightUnit: (row.weight_unit as string) ?? 'kg',
    revision: (row.revision as number) ?? 1,
    updatedAt: (row.updated_at as string) ?? (row.completed_at as string),
    deletedAt: (row.deleted_at as string | null) ?? null,
    sets,
  };
}
