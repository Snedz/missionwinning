import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  applyPrivateGateHeaders,
  hasPrivateAccessCookie,
  hasValidSupabaseSession,
  isPrivateModeEnabled,
  queryGrantsAccess,
} from '@/lib/privateGate';
import { createPrivateAccessToken, PRIVATE_ACCESS_COOKIE } from '@/lib/privateSession';

// Private development mode gate (STRICT).
// EVERY public visitor sees ONLY the minimal /private teaser unless they have the access cookie.
//
// Authorized builder / early access:
//   1. ?access=THE_SECRET   (on any URL — sets 30-day httpOnly cookie)
//   2. Password form on /private
//
// Optional (OFF by default): PRIVATE_ALLOW_AUTH_BYPASS=true + valid Supabase JWT session.
//
// CRITICAL — set in Vercel (Production + Preview) and redeploy:
//   PRIVATE_ACCESS_SECRET=<strong random string>
//   PRIVATE_MODE=true          (default in production; set false to go fully public)
//
// To go fully public later: PRIVATE_MODE=false in Vercel env vars.

export function proxy(request: NextRequest) {
  if (!isPrivateModeEnabled()) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;
  const secret = process.env.PRIVATE_ACCESS_SECRET;

  // Always allow the gate page + system paths + API routes.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/private' ||
    pathname.startsWith('/private/') ||
    pathname === '/welcome' ||
    pathname === '/beta'
  ) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  // Query param bypass: set cookie + proceed (builder convenience).
  if (queryGrantsAccess(searchParams, secret)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('access');
    const response = NextResponse.redirect(url);
    response.cookies.set(PRIVATE_ACCESS_COOKIE, createPrivateAccessToken(secret!), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return applyPrivateGateHeaders(response);
  }

  // Cookie bypass (password form or prior ?access= visit).
  if (hasPrivateAccessCookie(request, secret)) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  // Optional: validated Supabase session only (disabled unless PRIVATE_ALLOW_AUTH_BYPASS=true).
  if (hasValidSupabaseSession(request)) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  // No valid bypass → generic private teaser only.
  const redirectRes = NextResponse.redirect(new URL('/private', request.url));
  return applyPrivateGateHeaders(redirectRes);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
