import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  applyPrivateGateHeaders,
  hasPrivateAccessCookie,
  hasValidSupabaseSession,
  isPrivateModeEnabled,
  isPublicApiPathWhileGated,
  isPublicPathWhileGated,
  queryGrantsAccess,
} from '@/lib/privateGate';
import { createPrivateAccessToken, PRIVATE_ACCESS_COOKIE } from '@/lib/privateSession';
import { isPathEnabled } from '@/lib/surface';

export async function proxy(request: NextRequest) {
  // Parked surfaces are unreachable before anything else runs, so a parked API is
  // not an attack surface and parking does not depend on the private gate.
  //
  // Enforced here rather than with `notFound()` in each route: the `(app)` layout
  // streams, so a page component's notFound() throws after the 200 shell has
  // already flushed and the status can no longer change. This is also one place
  // instead of one per route, and covers pages and APIs with the same check.
  if (!isPathEnabled(request.nextUrl.pathname)) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Serves the app's styled not-found page with a real 404 status.
    return NextResponse.rewrite(new URL('/_not-found', request.url));
  }

  if (!isPrivateModeEnabled()) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;
  const secret = process.env.PRIVATE_ACCESS_SECRET;

  if (isPublicPathWhileGated(pathname)) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/api')) {
    if (isPublicApiPathWhileGated(pathname)) {
      return applyPrivateGateHeaders(NextResponse.next());
    }
    if (hasPrivateAccessCookie(request, secret)) {
      return applyPrivateGateHeaders(NextResponse.next());
    }
    if (await hasValidSupabaseSession(request)) {
      return applyPrivateGateHeaders(NextResponse.next());
    }
    return applyPrivateGateHeaders(
      NextResponse.json({ error: 'Private development gate' }, { status: 403 })
    );
  }

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

  if (hasPrivateAccessCookie(request, secret)) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  if (await hasValidSupabaseSession(request)) {
    return applyPrivateGateHeaders(NextResponse.next());
  }

  const redirectRes = NextResponse.redirect(new URL('/private', request.url));
  return applyPrivateGateHeaders(redirectRes);
}

export const config = {
  // Images + magazine PDFs skip the matcher; /magazine + /locales also allowlisted in publicRoutes.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)',
  ],
};
