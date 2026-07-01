import { NextRequest, NextResponse } from 'next/server';
import { verifyConsentToken } from '@/lib/youthConsentToken';

/** Verify parent email link token (same or shared device). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }

  const payload = verifyConsentToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Invalid or expired token' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email: payload.email,
    age: payload.age,
  });
}
