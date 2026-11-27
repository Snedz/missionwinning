/**
 * Sync minimal mobile prefs (units, rest, equipment, bar weights).
 * Auth: Bearer required.
 */
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, readBoundedJson, rejectOversizedBody, withApiLogging } from '../../../../../lib/mobile/http';
import { rateLimitAsync } from '../../../../../lib/mobile/rateLimit';
import { requireMobileUser } from '../../../../../lib/mobile/auth';
import { mobileSyncPrefsPushBodySchema, parseJsonBody } from '../../../../../lib/mobile/schemas';

export const POST = withApiLogging('mobile/sync/prefs', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-prefs-push:${ip}`, 30, 60_000);
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
  const parsed = parseJsonBody(mobileSyncPrefsPushBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const p = parsed.data.prefs;
  const now = new Date().toISOString();
  const { data: existing, error: readError } = await supabase
    .from('mobile_user_prefs')
    .select('revision, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (readError) return NextResponse.json({ error: 'sync_failed' }, { status: 500 });
  const serverRev = existing?.revision ?? 0;
  if (p.revision <= serverRev) {
    return NextResponse.json({ ok: true, skipped: true, revision: serverRev });
  }

  const row = {
    user_id: user.id,
    weight_unit: p.weightUnit,
    default_rest_seconds: p.defaultRestSeconds,
    equipment: p.equipment,
    bar_weight_kg: p.barWeightKg,
    bar_weight_lb: p.barWeightLb,
    revision: p.revision,
    updated_at: now,
  };
  const table = supabase.from('mobile_user_prefs');
  const { data, error } = await (existing
    ? table.update(row).eq('user_id', user.id).eq('revision', serverRev).eq('updated_at', existing.updated_at)
    : table.insert(row)).select('user_id').maybeSingle();
  if (error || !data) {
    /*
     * `.211` — an opaque code, not the database's own words.
     *
     * These returned `error.message` from a Supabase failure straight to the
     * client, which leaks table names, column names and constraint identifiers
     * — a free schema map for anyone probing the mobile sync surface. The
     * detail still reaches the server log, where the person debugging it is.
     */
    console.error('[mobile/sync] %s', error?.code ?? 'concurrent update');
    return NextResponse.json({ error: 'sync_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, revision: p.revision });
});

export const GET = withApiLogging('mobile/sync/prefs', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-sync-prefs-pull:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  const auth = await requireMobileUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from('mobile_user_prefs')
    .select(
      'weight_unit, default_rest_seconds, equipment, bar_weight_kg, bar_weight_lb, revision, updated_at',
    )
    .eq('user_id', user.id)
    .maybeSingle();

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
  if (!data) {
    return NextResponse.json({ prefs: null });
  }
  return NextResponse.json({
    prefs: {
      weightUnit: data.weight_unit,
      defaultRestSeconds: data.default_rest_seconds,
      equipment: data.equipment,
      barWeightKg: data.bar_weight_kg,
      barWeightLb: data.bar_weight_lb,
      revision: data.revision,
      updatedAt: data.updated_at,
    },
  });
});
