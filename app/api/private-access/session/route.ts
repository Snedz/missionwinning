/**
 * After OAuth / magic-link, mint mw_private_access from a verified Supabase session
 * that is invite-bound (or when PRIVATE_MODE is off).
 * Auth: Bearer access_token (getUser) | Rate: 20/min/IP
 * Why: browser Supabase client stores session in localStorage; proxy only sees cookies —
 * without this mint, Google sign-in always lands on /private while PRIVATE_MODE is on.
 * A JWT alone is not an invite (P1-1).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { attachPrivateAccessCookie } from '@/lib/privateSession';
import {
  bearerFromAuthorization,
  inviteRedeemed,
  sessionMintEligible,
  sessionMintGate,
} from '@/lib/privateAccessSessionGate';
import { isPrivateModeEnabled } from '@/lib/privateGate';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { bindInviteToUser, loadInvitedVia } from '@/lib/inviteBoundServer';
import { parseJsonBody, inviteCodeBodySchema } from '@/lib/apiSchemas';

export const POST = withApiLogging('private-access/session', async (request: NextRequest) => {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  const bearer = bearerFromAuthorization(request.headers.get('authorization'));
  const gated = sessionMintGate({ secret, bearer, headers: request.headers });
  if (!gated.ok) {
    return NextResponse.json(gated.body, { status: gated.status });
  }
  // sessionMintGate already refused a missing secret; narrow for the cookie mint.
  if (!secret) {
    return NextResponse.json({ error: 'Private access not configured' }, { status: 500 });
  }

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`private-access-session:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(bearer);

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  let redeemed = false;
  const admin = getSupabaseAdmin();
  if (admin) {
    redeemed = inviteRedeemed(await loadInvitedVia(admin, user.id));
    if (!redeemed) {
      const raw = await request.json().catch(() => null);
      const parsed = parseJsonBody(inviteCodeBodySchema, raw);
      if (parsed.ok) {
        const bound = await bindInviteToUser(admin, user, parsed.data.code);
        redeemed = bound.ok;
      }
    }
  }

  if (!sessionMintEligible({ privateModeEnabled: isPrivateModeEnabled(), inviteRedeemed: redeemed })) {
    return NextResponse.json(
      { error: 'Invite required', code: 'invite_required' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true, userId: user.id });
  attachPrivateAccessCookie(response.cookies, secret);
  return response;
});
