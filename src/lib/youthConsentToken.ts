import { createHmac, timingSafeEqual } from 'node:crypto';

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type ConsentTokenPayload = {
  email: string;
  age: number;
  exp: number;
};

function consentSecret(): string {
  return (
    process.env.YOUTH_CONSENT_SECRET ||
    process.env.PRIVATE_ACCESS_SECRET ||
    'dev-youth-consent-change-me'
  );
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64url');
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export function createConsentVerifyToken(email: string, age: number, ttlMs = DEFAULT_TTL_MS): string {
  const payload: ConsentTokenPayload = {
    email: email.trim().toLowerCase(),
    age,
    exp: Date.now() + ttlMs,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', consentSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyConsentToken(token: string): ConsentTokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = createHmac('sha256', consentSecret()).update(body).digest('base64url');
  try {
    const a = fromB64url(sig);
    const b = fromB64url(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as ConsentTokenPayload;
    if (!payload.email || !Number.isFinite(payload.age) || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function consentConfirmUrl(token: string, baseUrl?: string): string {
  const origin = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://www.missionwinning.com';
  return `${origin.replace(/\/$/, '')}/youth/consent/confirm?token=${encodeURIComponent(token)}`;
}

/** Six-digit code parent reads from email — works cross-device when parent tells the athlete. */
export function generateConsentCode(email: string, age: number): string {
  const h = createHmac('sha256', consentSecret())
    .update(`${email.trim().toLowerCase()}:${age}:code`)
    .digest();
  const num = (h.readUInt32BE(0) % 900000) + 100000;
  return String(num);
}

export function verifyConsentCode(email: string, age: number, code: string): boolean {
  const normalized = code.trim().replace(/\D/g, '');
  if (normalized.length !== 6) return false;
  return generateConsentCode(email, age) === normalized;
}
