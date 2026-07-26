/**
 * Unsubscribe from journey nudge emails.
 * Auth: HMAC token | Rate: 20/min/IP | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { setRemindersOptOut, verifyUnsubscribeToken } from '@/lib/nudgeServer';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/** One-click unsubscribe from training reminder emails (HMAC-signed link). */
export const GET = withApiLogging('nudges/unsubscribe', async(request: NextRequest) => {
  const limited = await rateLimitAsync(`nudge-unsub:${clientIp(request)}`, 20, 60_000);
  if (!limited.ok) {
    return new NextResponse('Too many requests. Try again shortly.', {
      status: 429,
      headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
    });
  }

  const userId = request.nextUrl.searchParams.get('u') ?? '';
  const token = request.nextUrl.searchParams.get('t') ?? '';

  if (!userId || !verifyUnsubscribeToken(userId, token)) {
    return new NextResponse('Invalid or expired unsubscribe link.', { status: 400 });
  }

  const ok = await setRemindersOptOut(userId);
  if (!ok) {
    return new NextResponse('Could not update your preference — email support@missionwinning.com.', {
      status: 500,
    });
  }

  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reminders off · Mission Winning</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f2f2;color:#201e1d;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;padding:24px">
<div style="max-width:420px;text-align:left">
<p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#ae1800;margin-bottom:16px">Mission Winning</p>
<h1 style="font-size:26px;line-height:1.15;margin:0 0 12px;font-weight:800">Training reminders are off.</h1>
<p style="font-size:14px;line-height:1.6;color:#5f5e5d">No more reminder emails. You can turn them back on anytime from your Profile. The path is there whenever you're ready.</p>
</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
});
