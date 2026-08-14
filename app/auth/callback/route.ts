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
import { disposeBlockedTerritorySignup } from '@/lib/legal/blockedSignupServer';
import { attachPrivateAccessCookie } from '@/lib/privateSession';
import { formatOAuthError } from '@/lib/oauthConfig';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { inviteRedeemed, sessionMintEligible } from '@/lib/privateAccessSessionGate';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { bindInviteToUser, loadInvitedVia } from '@/lib/inviteBoundServer';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const bounceTo = shouldBounceAuthCallbackToCanonical(url.hostname);
  if (bounceTo) {
    const dest = new URL('/auth/callback', bounceTo);
    dest.search = url.search;
    return NextResponse.redirect(dest);
  }

  const siteOrigin = configuredSiteOrigin() || url.origin;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = getSupabaseAdmin();

  // Identify first (Supabase already created the user). Do not persist
  // session or gate cookies when hosted signup is unavailable here.
  const territory = hostedServiceAccessFromHeaders(request.headers);
  if (!territory.allowed) {
    const dest = NextResponse.redirect(new URL('/regions', siteOrigin));
    for (const { name, options } of pendingCookies) {
      dest.cookies.set(name, '', { ...options, maxAge: 0 });
    }
    if (user && admin) {
      await disposeBlockedTerritorySignup(admin, user);
    }
    return dest;
  }

  let redeemed = false;
  if (user && admin) {
    redeemed = inviteRedeemed(await loadInvitedVia(admin, user.id));
    const inviteParam = url.searchParams.get('invite');
    if (!redeemed && inviteParam) {
      const bound = await bindInviteToUser(admin, user, inviteParam);
      redeemed = bound.ok;
    }
  }

  const response = NextResponse.redirect(new URL(nextPath, siteOrigin));
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }

  const secret = process.env.PRIVATE_ACCESS_SECRET;
  if (
    secret &&
    sessionMintEligible({
      privateModeEnabled: isPrivateModeEnabled(),
      inviteRedeemed: redeemed,
    })
  ) {
    attachPrivateAccessCookie(response.cookies, secret);
  }

  return response;
}
