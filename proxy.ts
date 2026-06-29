import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Private development mode gate (STRICT).
// EVERY public visitor sees ONLY the minimal /private teaser.
// ZERO product, service, or feature details are visible.
// 
// Authorized builder / early access:
//   1. ?access=THE_SECRET   (on any URL — sets 30-day cookie)
//   2. Password form on the teaser page
//   3. Magic link sign-in (Supabase auth cookie bypasses the gate)
// 
// CRITICAL: You MUST set the PRIVATE_ACCESS_SECRET environment variable
// in the Vercel project dashboard for BOTH Production and Preview.
// If it is missing the gate still hides the app, but the password form
// will report "not configured".
// 
// To go fully public later: set PRIVATE_MODE=false or delete this file.

const PRIVATE_MODE = true;

export function proxy(request: NextRequest) {
  if (!PRIVATE_MODE) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Always allow the gate page itself + system paths + API (magic links, leads, private-access)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/private' ||
    pathname.startsWith('/private/')
  ) {
    // Add noindex so search engines don't catalog the private state
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  const secret = process.env.PRIVATE_ACCESS_SECRET;

  const cookieAccess = request.cookies.get('mw_private_access')?.value;
  const queryAccess = searchParams.get('access');

  // Query param bypass: set cookie + proceed (builder convenience)
  if (queryAccess && secret && queryAccess === secret) {
    const response = NextResponse.next();
    response.cookies.set('mw_private_access', secret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  }

  // Cookie bypass
  if (cookieAccess && secret && cookieAccess === secret) {
    return NextResponse.next();
  }

  // Supabase magic-link / signed-in users bypass (for early access people)
  const hasSupabaseAuth = Array.from(request.cookies.getAll()).some(c =>
    c.name.includes('sb-') && (c.name.includes('auth-token') || c.name.includes('access-token'))
  );
  if (hasSupabaseAuth) {
    return NextResponse.next();
  }

  // No valid bypass → send visitor to the completely generic private page.
  // Use redirect so the address bar clearly shows they are on the gated page.
  const redirectRes = NextResponse.redirect(new URL('/private', request.url));
  redirectRes.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return redirectRes;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
