import { canDispute } from './earnbackVerifiedSession.ts';

export type DisputeRequest = {
  userId: string;
  sessionId: string;
  sessionEndIso: string;
  openedAtIso: string;
  reason: string;
  status: 'open' | 'rejected' | 'cleared';
};

export type DisputeBuildResult =
  | { ok: true; request: DisputeRequest }
  | { ok: false; reason: string };

export function buildDisputeRequest(input: {
  userId: string;
  sessionId: string;
  sessionEndIso: string;
  openedAtIso: string;
  reason: string;
}): DisputeBuildResult {
  // Trim strings
  const userId = input.userId.trim();
  const sessionId = input.sessionId.trim();
  const reason = input.reason.trim();
  const sessionEndIso = input.sessionEndIso.trim();
  const openedAtIso = input.openedAtIso.trim();

  // Validate required fields
  if (!userId) {
    return { ok: false, reason: 'userId_empty' };
  }
  if (!sessionId) {
    return { ok: false, reason: 'sessionId_empty' };
  }
  if (!reason) {
    return { ok: false, reason: 'reason_empty' };
  }

  // Validate reason length
  if (reason.length > 500) {
    return { ok: false, reason: 'reason_too_long' };
  }

  // Validate ISO date strings
  if (Number.isNaN(Date.parse(sessionEndIso))) {
    return { ok: false, reason: 'invalid_session_end_date' };
  }
  if (Number.isNaN(Date.parse(openedAtIso))) {
    return { ok: false, reason: 'invalid_opened_at_date' };
  }

  // Validate dispute window
  const openedAtMs = Date.parse(openedAtIso);
  if (!canDispute(sessionEndIso, openedAtMs)) {
    return { ok: false, reason: 'outside_dispute_window' };
  }

  // Build the request
  return {
    ok: true,
    request: {
      userId,
      sessionId,
      sessionEndIso,
      openedAtIso,
      reason,
      status: 'open',
    },
  };
}

export function disputeStillOpen(request: DisputeRequest, nowMs: number): boolean {
  return request.status === 'open' && canDispute(request.sessionEndIso, nowMs);
}
