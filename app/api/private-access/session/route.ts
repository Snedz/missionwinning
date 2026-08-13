/**
 * After OAuth / magic-link, mint mw_private_access from a verified Supabase session.
 * Auth: Bearer access_token (getUser) | Rate: 20/min/IP
 * Why: browser Supabase client stores session in localStorage; proxy only sees cookies —
 * without this mint, Google sign-in always lands on /private while PRIVATE_MODE is on.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import {
  createPrivateAccessToken,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { bearerFromAuthorization, sessionMintGate } from '@/lib/privateAccessSessionGate';

export const POST = withApiLogging('private-access/session', async (request: NextRequest) => {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  const bearer = bearerFromAuthorization(request.headers.get('authorization'));
  const gated = sessionMintGate({ secret, bearer, headers: request.headers });
  if (!gated.ok) {
    return NextResponse.json(gated.body, { status: gated.status });
  }
  // sessionMintGate already refused a missing secret; narrow for the cookie mint.
  if (!secret) {
    return NextResponse.json({ error: 'Private access not configured' }, { status: 500 });
  }

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`private-access-session:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(bearer);

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, userId: user.id });
  response.cookies.set(PRIVATE_ACCESS_COOKIE, createPrivateAccessToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return response;
});
