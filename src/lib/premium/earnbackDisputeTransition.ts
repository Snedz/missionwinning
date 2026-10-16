import { type DisputeRequest } from './earnbackDisputeRequest.ts';

export type DisputeTransition = 'clear' | 'reject';

export type TransitionResult =
  | { ok: true; request: DisputeRequest }
  | { ok: false; reason: string };

export function transitionDispute(
  request: DisputeRequest,
  action: DisputeTransition,
  nowMs: number
): TransitionResult {
  // Validate nowMs is a finite number
  if (!Number.isFinite(nowMs)) {
    return { ok: false, reason: 'invalid_now' };
  }

  // Only allow transitions from open status
  if (request.status !== 'open') {
    return { ok: false, reason: 'not_open' };
  }

  // Apply the transition based on action
  const newStatus = action === 'clear' ? 'cleared' : 'rejected';

  // Return shallow copy with updated status
  return {
    ok: true,
    request: {
      ...request,
      status: newStatus,
    },
  };
}
