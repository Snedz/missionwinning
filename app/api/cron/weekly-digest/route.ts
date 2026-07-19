/**
 * Monday founder digest email.
 * Auth: CRON_SECRET | dryRun=1 returns composed body without send.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import {
  collectFounderDigestData,
  composeFounderDigest,
} from '@/lib/founderDigestServer';
import { sendTransactionalEmail } from '@/lib/emailServer';

export const dynamic = 'force-dynamic';

export const GET = withApiLogging('cron/weekly-digest', async (request: NextRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
  const data = await collectFounderDigestData();
  const composed = composeFounderDigest(data);

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, ...composed, data });
  }

  const to = process.env.FOUNDER_DIGEST_EMAIL?.trim();
  if (!to) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'FOUNDER_DIGEST_EMAIL unset' });
  }

  const result = await sendTransactionalEmail({
    to,
    subject: composed.subject,
    text: composed.text,
    tags: [{ name: 'category', value: 'founder_digest' }],
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || 'send failed' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    sent: !result.skipped,
    skipped: result.skipped ?? false,
  });
});
