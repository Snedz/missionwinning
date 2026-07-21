/**
 * Founder alerts for Stripe charge disputes (chargebacks).
 * Uses FOUNDER_DIGEST_EMAIL when set; no-ops gracefully without Resend.
 */
import 'server-only';

import { sendTransactionalEmail, siteUrl } from '@/lib/emailServer';

export type StripeDisputeObject = {
  id?: string;
  amount?: number;
  currency?: string;
  reason?: string;
  status?: string;
  charge?: string;
  payment_intent?: string;
  evidence_details?: { due_by?: number | null };
};

function founderAlertEmail(): string | null {
  return process.env.FOUNDER_DIGEST_EMAIL?.trim() || null;
}

function formatMoney(amountCents: number | undefined, currency: string | undefined): string {
  if (amountCents == null || Number.isNaN(amountCents)) return 'unknown amount';
  const cur = (currency || 'usd').toUpperCase();
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur.length === 3 ? cur : 'USD',
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${cur}`;
  }
}

function dueByLine(dispute: StripeDisputeObject): string {
  const due = dispute.evidence_details?.due_by;
  if (!due) return 'Check Stripe Dashboard for evidence deadline (days, not weeks).';
  return `Evidence due by: ${new Date(due * 1000).toISOString()} (UTC)`;
}

/**
 * Notify founder of a dispute lifecycle event. Never auto-fights the dispute.
 */
export async function notifyFounderOfStripeDispute(input: {
  eventType: string;
  dispute: StripeDisputeObject;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const to = founderAlertEmail();
  if (!to) {
    console.warn(
      '[stripe-dispute] FOUNDER_DIGEST_EMAIL unset — dispute event logged only:',
      input.eventType,
      input.dispute.id
    );
    return { ok: true, skipped: true };
  }

  const d = input.dispute;
  const id = d.id || 'unknown';
  const dash = `https://dashboard.stripe.com/disputes/${id}`;
  const base = siteUrl();
  const text = [
    `Stripe dispute alert: ${input.eventType}`,
    '',
    `Dispute: ${id}`,
    `Status: ${d.status || 'n/a'}`,
    `Reason: ${d.reason || 'n/a'}`,
    `Amount: ${formatMoney(d.amount, d.currency)}`,
    `Charge: ${d.charge || 'n/a'}`,
    `PaymentIntent: ${d.payment_intent || 'n/a'}`,
    dueByLine(d),
    '',
    `Dashboard: ${dash}`,
    `Refunds policy: ${base}/refunds`,
    `Terms: ${base}/terms`,
    '',
    'Do NOT ignore this. Respond with evidence in days — see docs/STRIPE_DISPUTE_OPS.md',
    'and docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md in the repo.',
    '',
    'This email does not submit a response to Stripe. Human action required.',
  ].join('\n');

  return sendTransactionalEmail({
    to,
    subject: `[MW] Stripe dispute ${input.eventType}: ${id}`,
    text,
    tags: [
      { name: 'category', value: 'stripe_dispute' },
      { name: 'dispute_id', value: id.slice(0, 40) },
    ],
  });
}
