/**
 * Referral code get/redeem — service-role writes only.
 * GET: session, lazy-gen MW-XXXXX. POST: redeem ?ref= code for new accounts ≤7d.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, referralRedeemBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { generateReferralCode } from '@/lib/referralCode';

export const GET = withApiLogging('referral/get', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`referral-get:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .maybeSingle();

  let code = profile?.referral_code as string | null | undefined;

  if (!code) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = generateReferralCode();
      const { error } = await admin
        .from('profiles')
        .update({ referral_code: candidate })
        .eq('id', user.id);
      if (!error) {
        code = candidate;
        break;
      }
      // unique violation — retry
      if (error.code !== '23505') {
        // Profile row may not exist yet — upsert minimal row
        const { error: upErr } = await admin.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            referral_code: candidate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (!upErr) {
          code = candidate;
          break;
        }
        if (upErr.code === '23505') continue;
        console.error('referral assign', upErr);
        return NextResponse.json({ error: 'Could not assign code' }, { status: 500 });
      }
    }
  }

  if (!code) {
    return NextResponse.json({ error: 'Could not assign code' }, { status: 500 });
  }

  const { count } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', code);

  return NextResponse.json({ code, recruitCount: count ?? 0 });
});

export const POST = withApiLogging('referral/redeem', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`referral-post:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(referralRedeemBodySchema, raw);
  if (!parsed.ok) {
    // Opaque — do not leak validation detail beyond format
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
    .select('referred_by, referral_code')
    .eq('id', user.id)
    .maybeSingle();

  if (me?.referred_by) {
    return NextResponse.json({ ok: true, status: 'already' });
  }
  if (me?.referral_code === code) {
    return NextResponse.json({ ok: true, status: 'ignored' });
  }

  // Ensure referrer exists (opaque if not)
  const { data: referrer } = await admin
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle();

  if (!referrer || referrer.id === user.id) {
    return NextResponse.json({ ok: true, status: 'ignored' });
  }

  const { error } = await admin
    .from('profiles')
    .update({ referred_by: code })
    .eq('id', user.id);

  if (error) {
    // Try upsert if no row
    const { error: upErr } = await admin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        referred_by: code,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (upErr) {
      console.error('referral redeem', upErr);
      return NextResponse.json({ ok: true, status: 'ignored' });
    }
  }

  return NextResponse.json({ ok: true, status: 'attributed' });
});
