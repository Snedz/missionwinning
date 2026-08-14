import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WearableOAuthProviderId } from './types';

export class WearablesOAuthMisconfiguredError extends Error {
  constructor(message = 'WEARABLES_OAUTH_STATE_SECRET is required in production') {
    super(message);
    this.name = 'WearablesOAuthMisconfiguredError';
  }
}

function secret(): string {
  const dedicated = process.env.WEARABLES_OAUTH_STATE_SECRET?.trim();
  if (dedicated) return dedicated;
  if (process.env.NODE_ENV === 'production') {
    throw new WearablesOAuthMisconfiguredError();
  }
  const dev = process.env.PRIVATE_ACCESS_SECRET?.trim();
  if (dev) return dev;
  throw new WearablesOAuthMisconfiguredError('WEARABLES_OAUTH_STATE_SECRET is required');
}

export function signOAuthState(payload: {
  userId: string;
  provider: WearableOAuthProviderId;
  exp: number;
}): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyOAuthState(
  state: string
): { ok: true; userId: string; provider: WearableOAuthProviderId } | { ok: false; error: string } {
  const [body, sig] = state.split('.');
  if (!body || !sig) return { ok: false, error: 'invalid_state' };
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: 'invalid_state' };
    }
  } catch {
    return { ok: false, error: 'invalid_state' };
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      userId?: string;
      provider?: WearableOAuthProviderId;
      exp?: number;
    };
    if (!parsed.userId || !parsed.provider || !parsed.exp) {
      return { ok: false, error: 'invalid_state' };
    }
    if (Date.now() > parsed.exp) return { ok: false, error: 'state_expired' };
    return { ok: true, userId: parsed.userId, provider: parsed.provider };
  } catch {
    return { ok: false, error: 'invalid_state' };
  }
}

function siteOrigin(): string {
  const raw =
    process.env.WEARABLES_OAUTH_REDIRECT_BASE?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    '';
  if (!raw) {
    throw new WearablesOAuthMisconfiguredError(
      'WEARABLES_OAUTH_REDIRECT_BASE or NEXT_PUBLIC_APP_URL is required'
    );
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new WearablesOAuthMisconfiguredError('OAuth redirect base is not an absolute URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new WearablesOAuthMisconfiguredError('OAuth redirect base must be http(s)');
  }
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new WearablesOAuthMisconfiguredError('OAuth redirect base must be https in production');
  }
  return url.origin;
}

/** Callback URL bound to configured origin — never the request Host. */
export function getOAuthRedirectUri(provider: WearableOAuthProviderId): string {
  return `${siteOrigin()}/api/wearables/oauth/${provider}/callback`;
}
