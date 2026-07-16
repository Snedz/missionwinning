/**
 * One-time welcome email after first successful profile sync.
 * Auth: session | Rate: 5/min/user-or-IP
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendTransactionalEmail, siteUrl } from '@/lib/emailServer';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const POST = withApiLogging('journey/welcome', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`journey-welcome:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
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

  if (authError || !user?.email || !user.id) {
    return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
  }

  const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
  if (createdAt && Date.now() - createdAt > MAX_AGE_MS) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'account_too_old' });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no_admin' });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('welcome_email_sent_at')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.welcome_email_sent_at) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_sent' });
  }

  const app = siteUrl();
  const result = await sendTransactionalEmail({
    to: user.email,
    subject: 'Welcome to Mission Winning',
    text: [
      'Welcome to Mission Winning.',
      '',
      'Your free workout tracker works offline — no paywall on the basics.',
      '',
      `Start I-Day (about two minutes): ${app}/welcome`,
      `Open Today: ${app}/log`,
      '',
      'Log one set. Watch Win Score tick. That’s the loop.',
      '',
      '— Mission Winning',
    ].join('\n'),
    tags: [{ name: 'kind', value: 'welcome' }],
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || 'send failed' }, { status: 502 });
  }

  if (!result.skipped) {
    const { error: stampErr } = await admin
      .from('profiles')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', user.id);
    if (stampErr) {
      // Column may not exist until migration — log and continue.
      console.error('welcome_email_sent_at stamp failed:', stampErr);
    }
  }

  return NextResponse.json({ ok: true, skipped: Boolean(result.skipped) });
});
