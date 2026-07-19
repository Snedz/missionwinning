/**
 * Cron: send scheduled journey nudges (email + optional web push).
 * Auth: CRON_SECRET | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { Resend } from 'resend';
import { collectNudgeCandidates, markNudged } from '@/lib/nudgeServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isPushConfigured, sendNudgePush } from '@/lib/pushServer';

export const dynamic = 'force-dynamic';

/**
 * Daily retention nudges (Vercel cron — see vercel.json).
 * Auth: `Authorization: Bearer ${CRON_SECRET}`
 * `?dryRun=1` lists candidates without sending or updating anything.
 * Email always runs when Resend is configured; push is additional when VAPID + subscription.
 */
export const GET = withApiLogging('cron/nudges', async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  let result;
  try {
    result = await collectNudgeCandidates();
  } catch (e) {
    console.error('nudge cron', e);
    return NextResponse.json({ ok: false, error: 'candidate collection failed' }, { status: 500 });
  }

  const pushReady = isPushConfigured();
  let pushSubscribed = 0;
  if (pushReady) {
    try {
      const admin = getSupabaseAdmin();
      const userIds = [...new Set(result.candidates.map((c) => c.userId))];
      if (userIds.length && admin) {
        const { count } = await admin
          .from('push_subscriptions')
          .select('id', { count: 'exact', head: true })
          .in('user_id', userIds);
        pushSubscribed = count ?? 0;
      }
    } catch {
      pushSubscribed = 0;
    }
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      considered: result.considered,
      candidates: result.candidates.map((c) => ({ kind: c.kind, subject: c.subject })),
      pushConfigured: pushReady,
      pushSubscribed,
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Email not configured' }, { status: 503 });
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || 'Mission Winning <onboarding@resend.dev>';

  const sent: string[] = [];
  const failed: string[] = [];
  let pushed = 0;
  const admin = pushReady ? getSupabaseAdmin() : null;

  for (const c of result.candidates) {
    const { error } = await resend.emails.send({
      from,
      to: c.email,
      subject: c.subject,
      text: c.body,
    });
    if (error) {
      console.error('nudge send failed', c.kind, error.message);
      failed.push(c.userId);
    } else {
      sent.push(c.userId);
      if (admin) {
        const firstLine = c.body.split('\n').find((l) => l.trim()) || c.subject;
        const pr = await sendNudgePush(admin, c.userId, {
          title: c.subject,
          body: firstLine.slice(0, 140),
          url: '/log?src=push',
        });
        if (pr === 'sent') pushed += 1;
      }
    }
  }
  await markNudged(sent);

  return NextResponse.json({
    ok: true,
    considered: result.considered,
    sent: sent.length,
    failed: failed.length,
    pushed,
  });
});
