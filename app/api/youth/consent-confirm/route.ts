import { NextRequest, NextResponse } from 'next/server';
import { persistYouthConsent } from '@/lib/youthConsentServer';
import { verifyConsentToken } from '@/lib/youthConsentToken';

/** Verify parent email link token. Persists to athlete account when token includes uid. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }

  const payload = verifyConsentToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Invalid or expired token' }, { status: 400 });
  }

  let persisted = false;
  if (payload.uid) {
    const saved = await persistYouthConsent(payload.uid, payload.email, payload.age);
    persisted = saved.ok;
  }

  return NextResponse.json({
    ok: true,
    email: payload.email,
    age: payload.age,
    persisted,
  });
}
