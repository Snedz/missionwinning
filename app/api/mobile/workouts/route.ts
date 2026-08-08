/**
 * Mobile workout log — optional cloud insert when Bearer present.
 * Auth: optional (local-first); cloud sync requires mobile access
 * Rate: 40/min/IP
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { bearerAccessToken, hasMobileAppAccess } from '@/lib/mobileAccess';
import { mobileWorkoutLogBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { createClient } from '@supabase/supabase-js';

export const POST = withApiLogging('mobile/workouts', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-workouts:${ip}`, 40, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(mobileWorkoutLogBodySchema, raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const body = parsed.data;
  const completedAt = body.completedAt ?? new Date().toISOString();
  const started = new Date(new Date(completedAt).getTime() - body.durationSeconds * 1000);

  const localAck = {
    ok: true as const,
    synced: false as boolean,
    id: `local-${Date.now()}`,
    workoutName: body.workoutName,
    completedAt,
  };

  const token = bearerAccessToken(request);
  if (!token || !(await hasMobileAppAccess(request))) {
    return NextResponse.json(localAck);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json(localAck);

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json(localAck);

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      workout_name: body.workoutName,
      started_at: started.toISOString(),
      completed_at: completedAt,
      duration_seconds: body.durationSeconds,
      total_volume: body.totalVolume,
      exercises: [
        {
          exerciseId: body.sessionId ?? 'native-session',
          sets: Array.from({ length: Math.max(1, body.setCount) }, () => ({
            reps: 10,
            weight: 0,
          })),
        },
      ],
    })
    .select('id')
    .single();

  if (error) {
    /*
     * Opaque code out, detail to the log (CLAUDE.md §5). This returned
     * `error.message` verbatim — a Postgres message names tables, columns and
     * constraints, so the failure path handed anyone who could reach the
     * endpoint a free schema map. It went out at the default **200** under the
     * key `syncError`, which is also why `outboxResilience`'s guard missed it:
     * that check matched `error:` plus `status: 500`, and this was neither.
     *
     * The client's contract is unchanged — it only needs to know the cloud
     * write did not land, which `synced: false` in `localAck` already says.
     */
    console.error('mobile/workouts insert', error);
    return NextResponse.json({ ...localAck, syncError: 'sync_failed' });
  }

  return NextResponse.json({
    ok: true,
    synced: true,
    id: data?.id ?? localAck.id,
    workoutName: body.workoutName,
    completedAt,
  });
});
