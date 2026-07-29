/**
 * Hourly wind-down sweep — the same-evening note after a session that ran hot.
 *
 * Its own route rather than a branch inside `/api/cron/nudges`, deliberately: that
 * route drives the email pipeline, and running it hourly would re-scan the whole
 * opted-in cohort twenty-four times a day and shift email send times to whenever
 * conditions first flip. This one reads a single indexed table and sends push only.
 *
 * Idempotency is `last_wind_down_at` vs `last_session_at`, evaluated in
 * `lib/windDown.ts` — after a send the marker is newer, so the remaining runs that
 * evening skip, and the next hard session re-arms it with no expiry job.
 *
 * Auth: CRON_SECRET | Rate: cron only | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { collectWindDownCandidates, markWindDownSent } from '@/lib/nudgeServer';
import { isPushConfigured, sendAnonymousPush } from '@/lib/pushServer';

export const GET = withApiLogging('cron/wind-down', async (request: NextRequest) => {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';
  const pushReady = isPushConfigured();

  let result: Awaited<ReturnType<typeof collectWindDownCandidates>> = {
    considered: 0,
    candidates: [],
  };
  try {
    result = await collectWindDownCandidates();
  } catch (e) {
    console.error('wind-down collection', e);
    return NextResponse.json({ ok: false, error: 'Collection failed' }, { status: 500 });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      pushConfigured: pushReady,
      considered: result.considered,
      // `localHour` is included so the founder can check the window maths straight
      // from the response. Never the endpoint — that is the push credential.
      candidates: result.candidates.map((c) => ({
        device: `${c.deviceId.slice(0, 8)}…`,
        tz: c.timeZone,
        localHour: c.localHour,
      })),
    });
  }

  const admin = getSupabaseAdmin();
  if (!pushReady || !admin || result.candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      considered: result.considered,
      sent: 0,
      pushConfigured: pushReady,
    });
  }

  const delivered: string[] = [];
  for (const c of result.candidates) {
    const r = await sendAnonymousPush(admin, c.endpoint, {
      title: c.title,
      body: c.body,
      url: '/log?debrief=last&src=push',
      // Its own tag: a wind-down must never replace an unopened comeback.
      tag: 'mw-wind-down',
    });
    if (r === 'sent') delivered.push(c.endpoint);
  }
  await markWindDownSent(delivered);

  return NextResponse.json({
    ok: true,
    considered: result.considered,
    sent: delivered.length,
  });
});
