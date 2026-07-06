/**
 * Unsubscribe from journey nudge emails.
 * Auth: HMAC token | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { setRemindersOptOut, verifyUnsubscribeToken } from '@/lib/nudgeServer';

export const dynamic = 'force-dynamic';

/** One-click unsubscribe from training reminder emails (HMAC-signed link). */
export async function GET(request: NextRequest) {
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
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0d12;color:#f5f7f4;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;padding:24px">
<div style="max-width:420px;text-align:center">
<p style="font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8a94a3;margin-bottom:16px">Mission Winning</p>
<h1 style="font-size:26px;line-height:1.15;margin:0 0 12px;text-transform:uppercase">Training reminders are off.</h1>
<p style="font-size:14px;line-height:1.6;color:#a8b0bc">No more reminder emails. You can turn them back on anytime from your Profile. The path is there whenever you're ready.</p>
</div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
