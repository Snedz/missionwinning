/**
 * Schedule journey email nudge.
 * Auth: session | See: app/api/INDEX.md, src/lib/nudgeServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';

/** Optional Resend nudge — emails the user's current journey next step. */
export async function POST(request: NextRequest) {
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

  let body: { label?: string; description?: string; href?: string; stepLabel?: string } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  const label = String(body.label || 'Continue on Today').slice(0, 120);
  const description = String(body.description || 'Open the app for your next clear action.').slice(0, 500);
  const stepLabel = String(body.stepLabel || 'Today').slice(0, 80);
  let href = String(body.href || '/log');
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
}
