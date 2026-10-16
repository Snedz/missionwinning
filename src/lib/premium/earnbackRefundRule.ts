/**
 * Earn-back refund rule engine — pure logic for deciding whether an earn-back
 * plan is refundable. Full refund only when every required session is done;
 * never partial, never more than was paid.
 *
 * No network, no Stripe call, no UI. Locked down to the exact spec in the
 * meridian card.
 */

export type EarnbackPlan = {
  planId: string;
  startDate: string;
  windowDays: number;
  requiredSessions: number;
  pricePaidCents: number;
};

export type EarnbackProgress = {
  completedSessions: number;
  disputeOpen: boolean;
};

export type RefundStatus =
  | 'invalid'
  | 'on_hold'
  | 'not_started'
  | 'in_progress'
  | 'eligible'
  | 'missed';

export type RefundDecision = {
  status: RefundStatus;
  refundCents: number;
  daysLeft: number | null;
  reason: string;
};

export const DAY_MS = 86_400_000;

export function decideRefund(
  plan: EarnbackPlan,
  progress: EarnbackProgress,
  nowMs: number
): RefundDecision {
  // 1. invalid when bad inputs
  const startMs = Date.parse(plan.startDate);
  if (Number.isNaN(startMs)) {
    return { status: 'invalid', refundCents: 0, daysLeft: null, reason: 'invalid plan or progress' };
  }
  if (
    !Number.isInteger(plan.windowDays) ||
    plan.windowDays < 1 ||
    !Number.isInteger(plan.requiredSessions) ||
    plan.requiredSessions < 1 ||
    !Number.isInteger(plan.pricePaidCents) ||
    plan.pricePaidCents < 0 ||
    !Number.isInteger(progress.completedSessions) ||
    progress.completedSessions < 0
  ) {
    return { status: 'invalid', refundCents: 0, daysLeft: null, reason: 'invalid plan or progress' };
  }

  // 2. disputeOpen → on_hold
  if (progress.disputeOpen) {
    return { status: 'on_hold', refundCents: 0, daysLeft: null, reason: 'dispute is open' };
  }

  // 3. now < start → not_started
  if (nowMs < startMs) {
    return { status: 'not_started', refundCents: 0, daysLeft: plan.windowDays, reason: 'plan has not started yet' };
  }

  // 4. completed >= required → eligible
  if (progress.completedSessions >= plan.requiredSessions) {
    return { status: 'eligible', refundCents: plan.pricePaidCents, daysLeft: null, reason: 'all required sessions completed' };
  }

  // 5. now >= start + windowDays → missed
  const endMs = startMs + plan.windowDays * DAY_MS;
  if (nowMs >= endMs) {
    return { status: 'missed', refundCents: 0, daysLeft: 0, reason: 'window has passed without meeting requirements' };
  }

  // 6. otherwise → in_progress
  const daysLeft = Math.ceil((endMs - nowMs) / DAY_MS);
  return { status: 'in_progress', refundCents: 0, daysLeft, reason: 'sessions still in progress' };
}
