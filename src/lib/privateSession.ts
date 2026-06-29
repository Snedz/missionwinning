import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'mw_private_access';
const TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Issue an opaque signed access token (never store raw PRIVATE_ACCESS_SECRET in cookies). */
export function createPrivateAccessToken(secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), 'utf8').toString('base64url');
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export function verifyPrivateAccessToken(token: string | undefined, secret: string | undefined): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = signPayload(payload, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    if (!data.exp || data.exp * 1000 <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function timingSafeSecretMatch(provided: string, secret: string): boolean {
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export { COOKIE_NAME as PRIVATE_ACCESS_COOKIE };
