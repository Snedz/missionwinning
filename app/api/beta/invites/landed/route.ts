/**
 * Opaque invite land mark — public while gated, rate-limited, format-gated.
 * Sets first_landed_at once when a valid invite code is first opened.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, inviteCodeBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

export const POST = withApiLogging('beta/invites/landed', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`invite-landed:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(inviteCodeBodySchema, raw);
  // Always opaque 200 — no enumeration
  if (!parsed.ok) {
    return NextResponse.json({ ok: true });
  }
  const code = parsed.data.code;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { data: row } = await admin
      .from('beta_invites')
      .select('id, first_landed_at')
      .eq('code', code)
      .maybeSingle();

    if (row && !row.first_landed_at) {
      await admin
        .from('beta_invites')
        .update({ first_landed_at: new Date().toISOString() })
        .eq('id', row.id)
        .is('first_landed_at', null);
    }
  } catch (e) {
    console.error('invite landed', e);
  }

  return NextResponse.json({ ok: true });
});
