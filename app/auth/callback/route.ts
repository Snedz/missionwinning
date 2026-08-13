/**
 * OAuth / magic-link callback — exchanges PKCE code using cookie verifier.
 * Replaces the client-only AuthCallbackPage flow (localStorage verifier broke
 * when Supabase Site URL / host mismatched).
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { shouldBounceAuthCallbackToCanonical, configuredSiteOrigin } from '@/lib/authRedirect';
import { sanitizeNextPath } from '@/lib/safeRedirect';
import { hostedServiceAccessFromHeaders } from '@/lib/legal/supportedRegions';
import {
  createPrivateAccessToken,
  PRIVATE_ACCESS_COOKIE,
} from '@/lib/privateSession';
import { formatOAuthError } from '@/lib/oauthConfig';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const bounceTo = shouldBounceAuthCallbackToCanonical(url.hostname);
  if (bounceTo) {
    const dest = new URL('/auth/callback', bounceTo);
    dest.search = url.search;
    return NextResponse.redirect(dest);
  }

  const siteOrigin = configuredSiteOrigin() || url.origin;
  const territory = hostedServiceAccessFromHeaders(request.headers);
  if (!territory.allowed) {
    // Do not exchange the code — hosted signup is unavailable in this region.
    return NextResponse.redirect(new URL('/regions', siteOrigin));
  }

  const code = url.searchParams.get('code');
  const errorDesc = url.searchParams.get('error_description');
  const nextPath = sanitizeNextPath(url.searchParams.get('next'));

  const errorRedirect = (message: string) => {
    const dest = new URL('/profile', siteOrigin);
    dest.searchParams.set('authError', message.slice(0, 240));
    return NextResponse.redirect(dest);
  };

  if (errorDesc) {
    return errorRedirect(formatOAuthError(decodeURIComponent(errorDesc)));
  }

  if (!code) {
    return errorRedirect('No sign-in code returned. Try again from Profile.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anon) {
    return errorRedirect('Cloud sign-in is not configured.');
  }

  // Collect Set-Cookie from exchange onto the final redirect response.
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(supabaseUrl, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options: options as Record<string, unknown> });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return errorRedirect(formatOAuthError(error.message));
  }

  const response = NextResponse.redirect(new URL(nextPath, siteOrigin));
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }

  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (secret) {
    response.cookies.set(PRIVATE_ACCESS_COOKIE, createPrivateAccessToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }

  return response;
}
