/**
 * Hourly day-review sweep — the evening doorbell at the athlete's chosen hour.
 *
 * Its own route rather than a branch inside `/api/cron/wind-down`, following the
 * same reasoning that separated wind-down from `/api/cron/nudges`: separate
 * kinds get separate markers, separate tags and separate failure modes, so one
 * can be disabled or debugged without touching the other.
 *
 * Idempotency is `last_day_review_at` compared against the athlete's local day,
 * evaluated in `lib/dayReviewNudge.ts` — after a send the remaining runs that
 * evening skip, with no expiry job anywhere. That module also carries the
 * one-push-per-evening precedence: if wind-down already spoke tonight, no
 * review goes out.
 *
 * **The push carries no numbers.** The row it is sent from holds no behavior
 * data by contract; the review itself is composed on the device when the
 * athlete opens the app.
 *
 * Scheduled from `.github/workflows/cron-day-review.yml`, not `vercel.json`:
 * hourly entries there fail deployment on Vercel's Hobby plan.
 *
 * Auth: CRON_SECRET | Rate: cron only | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { collectDayReviewCandidates, markDayReviewSent } from '@/lib/nudgeServer';
import { isPushConfigured, sendAnonymousPush } from '@/lib/pushServer';

export const GET = withApiLogging('cron/day-review', async (request: NextRequest) => {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';
  const pushReady = isPushConfigured();

  let result: Awaited<ReturnType<typeof collectDayReviewCandidates>> = {
    considered: 0,
    candidates: [],
  };
  try {
    result = await collectDayReviewCandidates();
  } catch (e) {
    console.error('day-review collection', e);
    return NextResponse.json({ ok: false, error: 'Collection failed' }, { status: 500 });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      pushConfigured: pushReady,
      considered: result.considered,
      // Never the endpoint — that is the push credential.
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
      url: '/log?src=day-review',
      // Its own tag: a shared one would replace an unopened wind-down.
      tag: 'mw-day-review',
    });
    if (r === 'sent') delivered.push(c.endpoint);
  }
  await markDayReviewSent(delivered);

  return NextResponse.json({
    ok: true,
    considered: result.considered,
    sent: delivered.length,
  });
});
