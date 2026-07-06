/**
 * Verify parent consent 6-digit code.
 * Auth: gate | Rate: 5/min/IP | Schema: youthConsentVerifySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { COPPA_AGE_THRESHOLD } from '@/lib/youthConsent';
import { persistYouthConsent } from '@/lib/youthConsentServer';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { verifyConsentCode, YouthConsentMisconfiguredError } from '@/lib/youthConsentToken';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { createHash } from 'node:crypto';
import { parseJsonBody, youthConsentVerifySchema } from '@/lib/apiSchemas';

/** Verify 6-digit parent consent code (cross-device). Persists when athlete is signed in. */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseJsonBody(youthConsentVerifySchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const { parentEmail, childAge, code } = parsed.data;

  const emailKey = createHash('sha256').update(parentEmail.toLowerCase()).digest('hex').slice(0, 16);
  const limited = await rateLimitAsync(`youth-consent:${ip}:${emailKey}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: 'Too many attempts' }, { status: 429 });
  }

  if (childAge >= COPPA_AGE_THRESHOLD) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  try {
    if (!verifyConsentCode(parentEmail, childAge, code)) {
      return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 403 });
    }
  } catch (e) {
    if (e instanceof YouthConsentMisconfiguredError) {
      return NextResponse.json({ ok: false, error: 'Consent service unavailable' }, { status: 503 });
    }
    throw e;
  }

  const user = await getUserFromRequest(request);
  if (user) {
    const saved = await persistYouthConsent(user.id, parentEmail, childAge);
    if (!saved.ok) {
      return NextResponse.json({ ok: false, error: saved.error }, { status: 503 });
    }
  }

  return NextResponse.json({ ok: true, persisted: Boolean(user) });
}
