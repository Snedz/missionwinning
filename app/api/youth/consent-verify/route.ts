import { NextRequest, NextResponse } from 'next/server';
import { COPPA_AGE_THRESHOLD } from '@/lib/youthConsent';
import { verifyConsentCode } from '@/lib/youthConsentToken';

/** Verify 6-digit parent consent code (cross-device). */
export async function POST(request: NextRequest) {
  let body: { parentEmail?: string; childAge?: number; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parentEmail = body.parentEmail?.trim() ?? '';
  const childAge = Number(body.childAge);
  const code = body.code?.trim() ?? '';

  if (!parentEmail.includes('@') || !Number.isFinite(childAge) || childAge >= COPPA_AGE_THRESHOLD) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  if (!verifyConsentCode(parentEmail, childAge, code)) {
    return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
