/**
 * Cron: send scheduled journey nudges.
 * Auth: CRON_SECRET | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { collectNudgeCandidates, markNudged } from '@/lib/nudgeServer';

export const dynamic = 'force-dynamic';

/**
 * Daily retention nudges (Vercel cron — see vercel.json).
 * Auth: `Authorization: Bearer ${CRON_SECRET}` (Vercel sets this automatically
 * when the CRON_SECRET env var exists).
 * `?dryRun=1` lists candidates without sending or updating anything —
 * use it to sanity-check the cohort before the first live run.
 */
export async function GET(request: NextRequest) {
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

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      considered: result.considered,
      candidates: result.candidates.map((c) => ({ kind: c.kind, subject: c.subject })),
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
    }
  }
  await markNudged(sent);

  return NextResponse.json({
    ok: true,
    considered: result.considered,
    sent: sent.length,
    failed: failed.length,
  });
}
