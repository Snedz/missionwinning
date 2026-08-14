/**
 * OAuth callback for wearable providers — exchanges code and stores tokens.
 * Auth: signed state | Rate: 20/min
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { upsertOAuthConnection } from '@/lib/wearables/connections';
import { getOAuthCredentials, isWearablesEnabled } from '@/lib/wearables/flags';
import { getOAuthAdapter, isOAuthProviderId } from '@/lib/wearables/oauthProviders';
import {
  getOAuthRedirectUri,
  verifyOAuthState,
  WearablesOAuthMisconfiguredError,
} from '@/lib/wearables/oauthState';

type Ctx = { params: Promise<{ provider: string }> };

export const GET = withApiLogging('wearables/oauth/callback', async (req: NextRequest, ctx: Ctx) => {
  const limited = await rateLimitAsync(`wearables-oauth-cb:${clientIp(req)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.redirect(new URL('/profile?wearables=rate_limited', req.url));
  }

  if (!isWearablesEnabled()) {
    return NextResponse.redirect(new URL('/profile?wearables=disabled', req.url));
  }

  const { provider: raw } = await ctx.params;
  if (!isOAuthProviderId(raw)) {
    return NextResponse.redirect(new URL('/profile?wearables=unknown_provider', req.url));
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const err = req.nextUrl.searchParams.get('error');
  if (err || !code || !state) {
    return NextResponse.redirect(new URL('/profile?wearables=denied', req.url));
  }

  let verified: ReturnType<typeof verifyOAuthState>;
  try {
    verified = verifyOAuthState(state);
  } catch (e) {
    if (e instanceof WearablesOAuthMisconfiguredError) {
      return NextResponse.redirect(new URL('/profile?wearables=not_configured', req.url));
    }
    throw e;
  }
  if (!verified.ok || verified.provider !== raw) {
    return NextResponse.redirect(new URL('/profile?wearables=bad_state', req.url));
  }

  const creds = getOAuthCredentials(raw);
  if (!creds) {
    return NextResponse.redirect(new URL('/profile?wearables=not_configured', req.url));
  }

  let redirectUri: string;
  try {
    redirectUri = getOAuthRedirectUri(raw);
  } catch (e) {
    if (e instanceof WearablesOAuthMisconfiguredError) {
      return NextResponse.redirect(new URL('/profile?wearables=not_configured', req.url));
    }
    throw e;
  }
  const adapter = getOAuthAdapter(raw);

  try {
    const tokens = await adapter.exchangeCode({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      code,
      redirectUri,
    });
    const saved = await upsertOAuthConnection({
      userId: verified.userId,
      provider: raw,
      tokens,
    });
    if (!saved.ok) {
      return NextResponse.redirect(new URL('/profile?wearables=save_failed', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/profile?wearables=token_failed', req.url));
  }

  return NextResponse.redirect(new URL(`/profile?wearables=connected&provider=${raw}`, req.url));
});
