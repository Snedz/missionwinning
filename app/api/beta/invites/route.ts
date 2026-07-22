/**
 * Beta invite issue + list — same auth as /api/beta/metrics.
 * GET: funnel rows. POST: issue code + full invite link.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { createClient } from '@supabase/supabase-js';
import {
  computeInviteFunnel,
  isBetaAdminEmail,
} from '@/lib/betaMetricsServer';
import { extractSupabaseAccessToken } from '@/lib/supabaseAuthCookies';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { generateInviteCode } from '@/lib/inviteCode';
import { parseJsonBody, inviteCreateBodySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { siteUrl } from '@/lib/emailServer';

async function authorizeBetaAdmin(request: NextRequest): Promise<boolean> {
  const secret = request.headers.get('x-beta-admin-secret');
  if (secret && secret === process.env.BETA_ADMIN_SECRET) return true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = extractSupabaseAccessToken(request.cookies);
  if (!url || !anon || !token) return false;

  const supabase = createClient(url, anon);
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  return isBetaAdminEmail(user?.email);
}

/**
 * Prod blocks `?access=` unless PRIVATE_ALLOW_QUERY_ACCESS=true.
 * Default link lands on /private with invite attribution only — share the
 * gate code out-of-band (or enable query access deliberately).
 */
function buildInviteLink(inviteCode: string): string {
  const base = siteUrl();
  const params = new URLSearchParams();
  params.set('invite', inviteCode);
  const access =
    process.env.PRIVATE_ACCESS_SECRET?.trim() ||
    process.env.PRIVATE_ACCESS_CODES?.split(',')[0]?.trim() ||
    '';
  if (process.env.PRIVATE_ALLOW_QUERY_ACCESS === 'true' && access) {
    params.set('access', access);
  }
  return `${base}/private?${params.toString()}`;
}

export const GET = withApiLogging('beta/invites/list', async (request: NextRequest) => {
  if (!(await authorizeBetaAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const funnel = await computeInviteFunnel();
  if (!funnel) {
    return NextResponse.json(
      { error: 'Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }
  return NextResponse.json(funnel);
});

export const POST = withApiLogging('beta/invites/create', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  if (!(await authorizeBetaAdmin(request))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`invite-create:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(inviteCreateBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const label = parsed.data.label;
  const email =
    parsed.data.email && parsed.data.email.length > 0
      ? parsed.data.email.trim().toLowerCase()
      : null;
  const notes = parsed.data.notes?.trim() || null;

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  let code: string | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = generateInviteCode();
    const { data, error } = await admin
      .from('beta_invites')
      .insert({
        code: candidate,
        label,
        email,
        notes,
      })
      .select('id, code, label, email, created_at')
      .single();

    if (!error && data) {
      code = data.code as string;
      const link = buildInviteLink(code);
      return NextResponse.json({
        id: data.id,
        code,
        label: data.label,
        email: data.email,
        created_at: data.created_at,
        link,
      });
    }
    if (error?.code === '23505') continue;
    console.error('invite create', error);
    return NextResponse.json({ error: 'Could not create invite' }, { status: 500 });
  }

  return NextResponse.json({ error: 'Could not assign unique code' }, { status: 500 });
});
