/**
 * Private beta gate password form — sets signed httpOnly cookie.
 * Auth: public | Rate: 8/min/IP | Schema: privateAccessBodySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import {
  createPrivateAccessToken,
  timingSafeSecretMatch,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { rateLimit } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { privateAccessBodySchema, parseJsonBody } from '@/lib/apiSchemas';

export const POST = withApiLogging('private-access', async(request: NextRequest) => {
  const secret = process.env.PRIVATE_ACCESS_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        error:
          'Private access not configured. Add PRIVATE_ACCESS_SECRET in Vercel dashboard (Production + Preview) and redeploy.',
      },
      { status: 500 }
    );
  }

  const ip = clientIp(request);
  const limited = rateLimit(`private-access:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = parseJsonBody(privateAccessBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!timingSafeSecretMatch(parsed.data.password, secret)) {
    return NextResponse.json({ error: 'Incorrect access code' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(PRIVATE_ACCESS_COOKIE, createPrivateAccessToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
});
