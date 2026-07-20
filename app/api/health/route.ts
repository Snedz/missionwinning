/**
 * Liveness + optional deep readiness for uptime monitors / flip ops.
 * Shallow: public, always 200. Deep: Authorization Bearer CRON_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { validateBuildLabel } from '@/lib/deployReadiness';

export const dynamic = 'force-dynamic';

export const GET = withApiLogging('health', async (request: NextRequest) => {
  const deep = request.nextUrl.searchParams.get('deep') === '1';
  const body: Record<string, unknown> = {
    ok: true,
    build: APP_BUILD_LABEL,
    time: new Date().toISOString(),
  };

  if (!deep) {
    return NextResponse.json(body);
  }

  const cronSecret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get('authorization');
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Env sanity (non-fatal soft notes; hard-fail only when service role missing for deep)
  checks.buildLabel = {
    ok: validateBuildLabel(APP_BUILD_LABEL),
    detail: APP_BUILD_LABEL,
  };
  checks.serviceRole = {
    ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  };
  checks.supabaseUrl = {
    ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
  };

  // Supabase ping
  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      checks.supabase = { ok: false, detail: 'admin client unavailable' };
    } else {
      const { error } = await admin.from('profiles').select('id').limit(1);
      checks.supabase = error
        ? { ok: false, detail: error.message.slice(0, 120) }
        : { ok: true };
    }
  } catch (e) {
    checks.supabase = {
      ok: false,
      detail: e instanceof Error ? e.message.slice(0, 120) : 'ping failed',
    };
  }

  // Redis (optional — ok:true when not configured; fail only when configured but broken)
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!redisUrl || !redisToken) {
    checks.redis = { ok: true, detail: 'not_configured' };
  } else {
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const pong = await redis.ping();
      checks.redis = { ok: pong === 'PONG' || pong === 'pong' || Boolean(pong), detail: String(pong) };
    } catch (e) {
      checks.redis = {
        ok: false,
        detail: e instanceof Error ? e.message.slice(0, 120) : 'ping failed',
      };
    }
  }

  const hardKeys = ['buildLabel', 'serviceRole', 'supabaseUrl', 'supabase'] as const;
  const hardFail = hardKeys.some((k) => checks[k] && !checks[k].ok);
  // Redis hard-fails only when configured
  if (checks.redis && !checks.redis.ok && checks.redis.detail !== 'not_configured') {
    // already counted if we want redis as soft — plan says 503 if any hard-fail
    // treat configured redis failure as hard
  }
  const redisHard =
    checks.redis &&
    !checks.redis.ok &&
    checks.redis.detail !== 'not_configured';

  body.checks = checks;
  body.ok = !hardFail && !redisHard;

  return NextResponse.json(body, { status: body.ok ? 200 : 503 });
});
