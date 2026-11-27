/**
 * POST /api/mobile/premium/play-purchase
 * Validate the existing purchase request; payments are off.
 * Bearer required. Logger never depends on this.
 */
import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rejectOversizedBody, withApiLogging } from '../../../../../lib/mobile/http';
import { createClient } from '@supabase/supabase-js';
import { extractSupabaseAccessToken } from '../../../../../lib/mobile/cookies';
import { bearerAccessToken } from '../../../../../lib/mobile/auth';
import { rateLimitAsync } from '../../../../../lib/mobile/rateLimit';
import { z } from 'zod';

const bodySchema = z.object({
  productId: z.string().min(1).max(120),
  purchaseToken: z.string().min(8).max(2000),
  packageName: z.string().min(1).max(200).optional(),
  orderId: z.string().max(200).optional().nullable(),
});

export const POST = withApiLogging('mobile/premium/play-purchase', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`mobile-play-purchase:${ip}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } },
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'Unconfigured' }, { status: 503 });
  }

  const accessToken =
    bearerAccessToken(request) ?? extractSupabaseAccessToken(request.cookies);
  if (!accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(url, anon);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message || 'Invalid body' },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { ok: false, error: 'Payments are off', premium: false },
    { status: 410 },
  );
});
