/**
 * Transient HOLD pulse for observed set-save failures.
 * Local log stays authoritative; no invented success.
 */

export type MissFlashSource = 'save-fail' | 'offline-save' | 'ci-red';

export type MissFlashPulse = {
  active: boolean;
  source: MissFlashSource | null;
  observedAtMs: number | null;
  clearAtMs: number | null;
};

export type MissFlashEvent =
  | { type: 'fail'; source: MissFlashSource; nowMs: number; timeoutMs: number }
  | { type: 'ack'; nowMs: number }
  | { type: 'tick'; nowMs: number }
  | { type: 'reset' };

export const IDLE_PULSE: MissFlashPulse = {
  active: false,
  source: null,
  observedAtMs: null,
  clearAtMs: null,
};

export function applyMissFlash(state: MissFlashPulse, event: MissFlashEvent): MissFlashPulse {
  switch (event.type) {
    case 'reset':
      return IDLE_PULSE;

    case 'fail': {
      if (
        !Number.isFinite(event.timeoutMs) ||
        event.timeoutMs <= 0 ||
        !Number.isFinite(event.nowMs)
      ) {
        return state;
      }
      return {
        active: true,
        source: event.source,
        observedAtMs: event.nowMs,
        clearAtMs: event.nowMs + event.timeoutMs,
      };
    }

    case 'ack': {
      if (state.active) {
        return IDLE_PULSE;
      }
      return state;
    }

    case 'tick': {
      if (state.active) {
        const clearAt = state.clearAtMs;
        if (typeof clearAt === 'number' && Number.isFinite(clearAt) && event.nowMs >= clearAt) {
          return IDLE_PULSE;
        }
      }
      return state;
    }
  }

  // Explicit return for exhaustive typing
  return state;
}
