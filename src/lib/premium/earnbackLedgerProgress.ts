/**
 * Earn-back ledger progress — applies a session count or dispute event onto
 * an in-memory ledger row and returns the updated row plus a refund decision.
 *
 * No network, no Stripe, no UI.
 */

import { decideRefund } from './earnbackRefundRule.js';
import type { RefundDecision } from './earnbackRefundRule.js';

export type LedgerRow = {
  planId: string;
  startDate: string;
  windowDays: number;
  requiredSessions: number;
  pricePaidCents: number;
  completedSessions: number;
  disputeOpen: boolean;
};

export type LedgerEvent =
  | { type: 'session_counted' }
  | { type: 'dispute_opened' }
  | { type: 'dispute_cleared' };

export type LedgerApplyResult = {
  row: LedgerRow;
  decision: RefundDecision;
};

export function applyLedgerEvent(
  row: LedgerRow,
  event: LedgerEvent,
  nowMs: number
): LedgerApplyResult {
  // Start from a shallow copy — do not mutate the input
  const updatedRow: LedgerRow = { ...row };

  // Apply event to the row
  if (event.type === 'session_counted') {
    updatedRow.completedSessions = Math.min(
      row.requiredSessions,
      row.completedSessions + 1
    );
  } else if (event.type === 'dispute_opened') {
    updatedRow.disputeOpen = true;
  } else if (event.type === 'dispute_cleared') {
    updatedRow.disputeOpen = false;
  }

  // Build plan and progress for decideRefund
  const plan = {
    planId: row.planId,
    startDate: row.startDate,
    windowDays: row.windowDays,
    requiredSessions: row.requiredSessions,
    pricePaidCents: row.pricePaidCents,
  };

  const progress = {
    completedSessions: updatedRow.completedSessions,
    disputeOpen: updatedRow.disputeOpen,
  };

  const decision = decideRefund(plan, progress, nowMs);

  return { row: updatedRow, decision };
}
