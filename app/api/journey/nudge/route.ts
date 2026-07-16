/**
 * Schedule journey email nudge.
 * Auth: session | Rate: 5/min/user-or-IP | Schema: journeyNudgeBodySchema
 * See: app/api/INDEX.md, src/lib/nudgeServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { journeyNudgeBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

/** Optional Resend nudge — emails the user's current journey next step. */
export const POST = withApiLogging('journey/nudge', async(request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`journey-nudge:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Email not configured' }, { status: 503 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: 'Sign in required' }, { status: 401 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user?.email) {
    return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = parseJsonBody(journeyNudgeBodySchema, raw ?? {});
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

  const label = (body.label || 'Continue on Today').slice(0, 120);
  const description = (body.description || 'Open the app for your next clear action.').slice(0, 500);
  const stepLabel = (body.stepLabel || 'Today').slice(0, 80);
  let href = body.href || '/log';
  if (!href.startsWith('/') || href.includes('://')) href = '/log';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.missionwinning.com';
  const link = `${appUrl}${href}`;

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || 'Mission Winning <onboarding@resend.dev>';

  const { error: sendError } = await resend.emails.send({
    from,
    to: user.email,
    subject: `Your next step: ${label}`,
    text: [
      'Mission Winning — your next step',
      '',
      stepLabel,
      label,
      description,
      '',
      `Open in app: ${link}`,
      '',
      'Health for everyone, everywhere.',
    ].join('\n'),
  });

  if (sendError) {
    console.error('journey nudge send', sendError);
    return NextResponse.json({ ok: false, error: sendError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, step: stepLabel, label });
});
