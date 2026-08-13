/**
 * Cloud data export (GDPR Art. 20) — every table the account owns, as JSON.
 * Auth: session | Rate: 3/5min/user
 * See: app/api/INDEX.md, docs/API.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { rateLimitAsync } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { exportAccountData } from '@/lib/accountDataServer';
import { accountUserIdFromSession } from '@/lib/identity/accountUserId';

export const GET = withApiLogging('account/export', async (request: NextRequest) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Auth not configured' }, { status: 503 });
  }

  const accessToken = extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: 'Sign in required' }, { status: 401 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  const userId = accountUserIdFromSession(user);
  if (authError || !user || !userId) {
    return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
  }

  // Per-user, not per-IP: an export is heavy and personal.
  const limited = await rateLimitAsync(`account-export:${userId}`, 3, 5 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 300) } }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 503 });
  }

  try {
    const data = await exportAccountData(admin, userId, user.email ?? null);
    // No date in the server filename: the client names its download with the
    // athlete's local date; a UTC date here would disagree east of UTC (.212).
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="mission-winning-cloud-export.json"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // Opaque out, detail to the server log — never a Postgres message.
    console.error('account export failed:', err);
    return NextResponse.json({ ok: false, error: 'Export failed' }, { status: 502 });
  }
});
