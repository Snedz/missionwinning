import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_GOALS = 2000;
const MAX_TRAINING = 500;
const MAX_PACKAGE = 100;

/** Coaching / feedback lead capture with IP rate limit (PROTECTION P1). */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const limited = rateLimit(`leads:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.email !== 'string' || !body.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const payload = {
    name: String(body.name || 'Anonymous').slice(0, MAX_NAME),
    email: body.email.trim().slice(0, MAX_EMAIL),
    goals: String(body.goals || body.message || '').slice(0, MAX_GOALS),
    current_training: String(body.current_training || '').slice(0, MAX_TRAINING),
    package_interest: String(body.package_interest || body.source || 'general').slice(0, MAX_PACKAGE),
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
