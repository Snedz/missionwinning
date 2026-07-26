import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';

/**
 * Shared transactional email helpers (Resend).
 * Graceful no-op when RESEND_API_KEY is unset — product flows stay 200.
 */

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'https://www.missionwinning.com';
  return raw.replace(/\/$/, '');
}

export function resendFrom(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    'Mission Winning <onboarding@resend.dev>'
  );
}

/** True when From still uses Resend's test domain (not production-ready). */
export function isTestSender(from = resendFrom()): boolean {
  return /@resend\.dev\b/i.test(from) || /onboarding@resend\.dev/i.test(from);
}

function leadUnsubSecret(): string {
  const dedicated = process.env.NUDGE_SECRET?.trim();
  if (dedicated) return dedicated;
  if (process.env.NODE_ENV === 'production') return '';
  return process.env.PRIVATE_ACCESS_SECRET || '';
}

/** HMAC token for lead-list unsubscribe (email-based, not user id). */
export function leadUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHmac('sha256', leadUnsubSecret())
    .update(`lead-unsub:${normalized}`)
    .digest('hex');
}

export function verifyLeadUnsubscribeToken(email: string, token: string): boolean {
  if (!leadUnsubSecret() || !token) return false;
  try {
    const expected = Buffer.from(leadUnsubscribeToken(email));
    const given = Buffer.from(token);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

export function leadUnsubscribeUrl(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  const t = leadUnsubscribeToken(email);
  return `${siteUrl()}/api/leads/unsubscribe?e=${e}&t=${t}`;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  /** Always required — the plain-text part, and the fallback when html is absent. */
  text: string;
  /** Optional HTML part (see src/emails/renderEmail.ts). Sent multipart with text. */
  html?: string;
  tags?: Array<{ name: string; value: string }>;
};

/**
 * Send a transactional email — plain text, plus an HTML part when supplied.
 * `text` stays mandatory: it is the multipart fallback for clients that refuse
 * HTML, and it keeps every existing caller working unchanged.
 * Returns { ok: true, skipped: true } when Resend is not configured.
 */
export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: true, skipped: true };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: resendFrom(),
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      tags: input.tags,
    });
    if (error) {
      console.error('sendTransactionalEmail error:', error);
      return { ok: false, error: error.message || 'send failed' };
    }
    return { ok: true };
  } catch (err) {
    console.error('sendTransactionalEmail exception:', err);
    return { ok: false, error: err instanceof Error ? err.message : 'send failed' };
  }
}
