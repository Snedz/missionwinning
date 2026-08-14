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

/**
 * Strip BOM / wrapping quotes that the Vercel env UI and `.env` paste often add.
 * Preview-only copies of `PRIVATE_ACCESS_CODES` are the usual casualty — Production
 * was typed in the dashboard (`Done`), Preview was pasted as `"Done"` and 401'd.
 */
export function normalizePrivateAccessCode(raw: string | undefined | null): string {
  if (!raw) return '';
  let s = raw.replace(/^\uFEFF/, '').trim();
  if (s.length >= 2) {
    const first = s[0];
    const last = s[s.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      s = s.slice(1, -1).trim();
    }
  }
  return s;
}

/**
 * Primary HMAC secret + optional comma-separated codes from PRIVATE_ACCESS_CODES.
 * Cookies are always signed with PRIVATE_ACCESS_SECRET; extras are password-only.
 */
export function getPrivateAccessPasswords(
  primary = process.env.PRIVATE_ACCESS_SECRET,
  extras = process.env.PRIVATE_ACCESS_CODES
): string[] {
  const codes = [primary, ...(extras ?? '').split(',')]
    .map((s) => normalizePrivateAccessCode(s))
    .filter(Boolean);
  return [...new Set(codes)];
}

/** True if provided matches the primary secret or any PRIVATE_ACCESS_CODES entry. */
export function matchesPrivateAccessPassword(
  provided: string,
  primary = process.env.PRIVATE_ACCESS_SECRET,
  extras = process.env.PRIVATE_ACCESS_CODES
): boolean {
  const needle = normalizePrivateAccessCode(provided);
  if (!needle) return false;
  let matched = false;
  for (const secret of getPrivateAccessPasswords(primary, extras)) {
    if (timingSafeSecretMatch(needle, secret)) matched = true;
  }
  return matched;
}

export type PrivateAccessCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  maxAge: number;
  path: '/';
};

/**
 * Host-only gate cookie. Never set `domain` — `vercel.app` is on the public
 * suffix list, so a Domain attribute would be rejected on Preview and the
 * Done code would 200 then bounce straight back to `/private`.
 */
export function privateAccessCookieOptions(): PrivateAccessCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
    sameSite: 'lax',
    maxAge: TOKEN_TTL_SEC,
    path: '/',
  };
}

export function attachPrivateAccessCookie(
  cookies: {
    set: (name: string, value: string, options: PrivateAccessCookieOptions) => unknown;
  },
  secret: string
): void {
  cookies.set(COOKIE_NAME, createPrivateAccessToken(secret), privateAccessCookieOptions());
}

export { COOKIE_NAME as PRIVATE_ACCESS_COOKIE };
