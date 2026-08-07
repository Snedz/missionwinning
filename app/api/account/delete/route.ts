/**
 * Account deletion (GDPR Art. 17): email-keyed cleanups, anonymous device
 * rows, then auth.users cascade. Never reports success on a partial delete.
 * Auth: session | Rate: 2/5min/user | Zod: accountDeleteBodySchema
 * See: app/api/INDEX.md, docs/API.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { rateLimitAsync } from '@/lib/rateLimit';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { accountDeleteBodySchema, parseJsonBody } from '@/lib/apiSchemas';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { deleteAccount } from '@/lib/accountDataServer';

export const POST = withApiLogging('account/delete', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

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
  if (authError || !user?.id) {
    return NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
  }

  const limited = await rateLimitAsync(`account-delete:${user.id}`, 2, 5 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 300) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }
  const parsed = parseJsonBody(accountDeleteBodySchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 503 });
  }

  const result = await deleteAccount(admin, user.id, user.email ?? null, parsed.data.deviceId);
  if (!result.ok) {
    // Opaque out; the step name goes to the server log only.
    console.error('account delete failed at step:', result.step);
    return NextResponse.json({ ok: false, error: 'Deletion failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
});
