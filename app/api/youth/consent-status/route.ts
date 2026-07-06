/**
 * Youth consent status for signed-in athlete.
 * Auth: session | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchYouthConsent } from '@/lib/youthConsentServer';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** Check whether the signed-in athlete has verified parent consent on the server. */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, verified: false, error: 'not_signed_in' }, { status: 401 });
  }

  const record = await fetchYouthConsent(user.id);
  if (!record) {
    return NextResponse.json({ ok: true, verified: false });
  }

  return NextResponse.json({
    ok: true,
    verified: true,
    parentEmail: record.parentEmail,
    childAge: record.childAge,
    verifiedAt: record.verifiedAt,
  });
}
