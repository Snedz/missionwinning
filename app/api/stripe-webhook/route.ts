import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { grantEnrollmentFromWebhook } from '@/lib/premiumServer';

/**
 * Stripe webhook — requires signature verification before granting premium.
 * Set STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY in production.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 401 });
  }

  const raw = await req.text();
  if (!verifyStripeSignature(raw, sig, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object ?? {};
    const email =
      (session.customer_details as { email?: string } | undefined)?.email ??
      (session.customer_email as string | undefined) ??
      null;
    const sessionId = String(session.id ?? '');

    if (email && sessionId) {
      try {
        await grantEnrollmentFromWebhook({
          user_email: email,
          product_id: 'super-bundle',
          provider: 'stripe',
          external_id: sessionId,
        });
      } catch (e) {
        console.error('Stripe webhook enrollment error:', e);
        return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}

/** Verify Stripe webhook signature (v1 scheme) without adding stripe npm dependency. */
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts = header.split(',').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc.t = v;
      if (k === 'v1') acc.v1.push(v);
      return acc;
    },
    { t: '', v1: [] as string[] }
  );

  if (!parts.t || parts.v1.length === 0) return false;

  const signed = `${parts.t}.${payload}`;
  const expected = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');

  for (const sig of parts.v1) {
    try {
      const a = Buffer.from(sig, 'hex');
      const b = Buffer.from(expected, 'hex');
      if (a.length === b.length && timingSafeEqual(a, b)) {
        const age = Math.abs(Date.now() / 1000 - Number(parts.t));
        if (age <= 300) return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}
