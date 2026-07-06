/**
 * Waitlist / lead capture — service-role insert only.
 * Auth: gate | Rate: 5/min/IP | Schema: leadsBodySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { leadsBodySchema, parseJsonBody } from '@/lib/apiSchemas';

/** Coaching / feedback lead capture with IP rate limit (PROTECTION P1). */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const limited = await rateLimitAsync(`leads:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const raw = await req.json().catch(() => null);
  const parsed = parseJsonBody(leadsBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const payload = {
    name: String(parsed.data.name || 'Anonymous').slice(0, 200),
    email: parsed.data.email.trim().slice(0, 320),
    goals: String(parsed.data.goals || '').slice(0, 2000),
    current_training: '',
    package_interest: String(parsed.data.source || 'general').slice(0, 100),
  };

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ ok: true, localOnly: true }, { status: 202 });
  }

  const { error } = await admin.from('leads').insert(payload);
  if (error) {
    console.error('leads insert error:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
