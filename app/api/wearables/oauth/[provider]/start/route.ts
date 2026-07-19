/**
 * Start OAuth for a wearable provider.
 * Auth: session | Rate: 10/min | Query: provider via path
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getOAuthCredentials, isWearablesEnabled } from '@/lib/wearables/flags';
import { getOAuthAdapter, isOAuthProviderId } from '@/lib/wearables/oauthProviders';
import { getOAuthRedirectUri, signOAuthState } from '@/lib/wearables/oauthState';

type Ctx = { params: Promise<{ provider: string }> };

export const GET = withApiLogging('wearables/oauth/start', async (req: NextRequest, ctx: Ctx) => {
  const limited = await rateLimitAsync(`wearables-oauth-start:${clientIp(req)}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!isWearablesEnabled()) {
    return NextResponse.json({ error: 'Wearables disabled', code: 'disabled' }, { status: 404 });
  }

  const { provider: raw } = await ctx.params;
  if (!isOAuthProviderId(raw)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });
  }

  const user = await getUserFromRequest(req);
  if (!user?.id) {
    return NextResponse.json({ error: 'Sign in required', code: 'auth_required' }, { status: 401 });
  }

  const creds = getOAuthCredentials(raw);
  if (!creds) {
    return NextResponse.json({ error: 'Provider not configured', code: 'not_configured' }, { status: 503 });
  }

  const origin = req.nextUrl.origin;
  const redirectUri = getOAuthRedirectUri(origin, raw);
  const state = signOAuthState({
    userId: user.id,
    provider: raw,
    exp: Date.now() + 15 * 60 * 1000,
  });
  const adapter = getOAuthAdapter(raw);
  const url = adapter.buildAuthorizeUrl({
    clientId: creds.clientId,
    redirectUri,
    state,
  });

  return NextResponse.redirect(url);
});
