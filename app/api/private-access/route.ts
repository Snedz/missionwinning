import { NextRequest, NextResponse } from 'next/server';
import {
  createPrivateAccessToken,
  timingSafeSecretMatch,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
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

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit(`private-access:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const { password } = await request.json().catch(() => ({}));
  if (typeof password !== 'string' || !timingSafeSecretMatch(password, secret)) {
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
}
