/**
 * Pure selectors for abandoned-checkout recovery emails (unit-testable).
 */

export type CheckoutRecoveryRow = {
  id: string;
  session_id: string;
  email: string;
  plan: string | null;
  expired_at: string;
  recovery_sent_at: string | null;
};

export type CheckoutRecoveryCandidate = {
  id: string;
  email: string;
  plan: string | null;
  session_id: string;
};

const HOUR_MS = 3600_000;

/** Rows expired ≥1h ago, never sent, email present. */
export function selectCheckoutRecoveryCandidates(
  rows: CheckoutRecoveryRow[],
  nowMs = Date.now(),
  unsubscribedEmails?: Set<string>
): CheckoutRecoveryCandidate[] {
  const unsub = unsubscribedEmails ?? new Set<string>();
  const out: CheckoutRecoveryCandidate[] = [];
  for (const r of rows) {
    if (r.recovery_sent_at) continue;
    const email = r.email?.trim().toLowerCase();
    if (!email || unsub.has(email)) continue;
    const expired = Date.parse(r.expired_at);
    if (!Number.isFinite(expired)) continue;
    if (nowMs - expired < HOUR_MS) continue;
    out.push({
      id: r.id,
      email,
      plan: r.plan,
      session_id: r.session_id,
    });
  }
  return out;
}

export function recoveryEmailBody(
  site: string,
  plan?: string | null
): { subject: string; text: string } {
  const planBit = plan ? ` (${plan})` : '';
  return {
    subject: 'Your founders spot is still open — Mission Winning',
    text: `You started checkout for Mission Winning${planBit} but didn't finish.

Your founders spot is still open. Resume anytime:

${site}/bundle

If you didn't mean to subscribe, ignore this — we won't email again about this session.

— Mission Winning team`,
  };
}
