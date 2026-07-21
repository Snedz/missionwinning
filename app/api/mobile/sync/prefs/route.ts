/**
 * Sync minimal mobile prefs (units, rest, equipment, bar weights).
 * Auth: Bearer required.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { bearerAccessToken, hasMobileAppAccess } from '@/lib/mobileAccess';
import { mobileSyncPrefsPushBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { createClient } from '@supabase/supabase-js';

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

  const auth = await requireUser(request);
  if ('error' in auth) return auth.error;
  const { supabase, user } = auth;

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(mobileSyncPrefsPushBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const p = parsed.data.prefs;
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from('mobile_user_prefs')
    .select('revision')
    .eq('user_id', user.id)
    .maybeSingle();

  const serverRev = (existing?.revision as number | undefined) ?? 0;
  if (p.revision < serverRev) {
    return NextResponse.json({ ok: true, skipped: true, revision: serverRev });
  }

  const { error } = await supabase.from('mobile_user_prefs').upsert({
    user_id: user.id,
    weight_unit: p.weightUnit,
    default_rest_seconds: p.defaultRestSeconds,
    equipment: p.equipment,
    bar_weight_kg: p.barWeightKg,
    bar_weight_lb: p.barWeightLb,
    revision: p.revision,
    updated_at: p.updatedAt ?? now,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const auth = await requireUser(request);
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
