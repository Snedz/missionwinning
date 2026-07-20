/**
 * Beta invite redeem — session auth, ≤7-day account, service-role writes.
 * Mirrors /api/referral POST pattern.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, inviteCodeBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('beta/invites/redeem', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`invite-redeem:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(inviteCodeBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ ok: true, status: 'ignored' });
  }
  const code = parsed.data.code;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const createdAt = user.created_at ? new Date(user.created_at).getTime() : Date.now();
  const ageMs = Date.now() - createdAt;
  if (ageMs > 7 * 86400000) {
    return NextResponse.json({ ok: true, status: 'ignored' });
  }

  const { data: me } = await admin
    .from('profiles')
    .select('invited_via')
    .eq('id', user.id)
    .maybeSingle();

  if (me?.invited_via) {
    return NextResponse.json({ ok: true, status: 'already' });
  }

  const { data: invite } = await admin
    .from('beta_invites')
    .select('id, code, signed_up_user_id')
    .eq('code', code)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ ok: true, status: 'ignored' });
  }

  // Already claimed by someone else — still attribute this user if not double-claimed
  if (invite.signed_up_user_id && invite.signed_up_user_id !== user.id) {
    // Allow multiple signups per invite code (founder may reuse link); mark first only
  }

  const { error } = await admin
    .from('profiles')
    .update({ invited_via: code })
    .eq('id', user.id);

  if (error) {
    const { error: upErr } = await admin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        invited_via: code,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (upErr) {
      console.error('invite redeem profile', upErr);
      return NextResponse.json({ ok: true, status: 'ignored' });
    }
  }

  // First signup wins signed_up_user_id
  if (!invite.signed_up_user_id) {
    await admin
      .from('beta_invites')
      .update({ signed_up_user_id: user.id })
      .eq('id', invite.id)
      .is('signed_up_user_id', null);
  }

  return NextResponse.json({ ok: true, status: 'attributed' });
});
