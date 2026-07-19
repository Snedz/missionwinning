import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WearableOAuthProviderId } from './types';

function secret(): string {
  return (
    process.env.WEARABLES_OAUTH_STATE_SECRET?.trim() ||
    process.env.PRIVATE_ACCESS_SECRET?.trim() ||
    process.env.NUDGE_SECRET?.trim() ||
    'mw-wearables-dev-state'
  );
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

export function getOAuthRedirectUri(requestOrigin: string, provider: WearableOAuthProviderId): string {
  const base =
    process.env.WEARABLES_OAUTH_REDIRECT_BASE?.trim().replace(/\/$/, '') ||
    requestOrigin.replace(/\/$/, '');
  return `${base}/api/wearables/oauth/${provider}/callback`;
}
