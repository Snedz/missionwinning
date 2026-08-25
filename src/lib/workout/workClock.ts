/**
 * In-set work clock — EMOM interval or AMRAP countdown.
 *
 * `.986` / stamp `.987` — not rest. Rest stays in restTimer.ts + RestTimerBar.
 * Athlete starts this on the live set row. Empty invents nothing.
 */

import { formatRestClock } from '@/lib/workout/restTimer';

export const WORK_CLOCK_KINDS = ['interval', 'countdown'] as const;
export type WorkClockKind = (typeof WORK_CLOCK_KINDS)[number];

/** EMOM is the minute. Not E2MOM. Not a custom interval shop. */
export const EMOM_INTERVAL_SECONDS = 60;

/** Closed AMRAP windows: 5 / 10 / 12 / 20 min. */
export const AMRAP_PRESETS = [300, 600, 720, 1200] as const;
export type AmrapPreset = (typeof AMRAP_PRESETS)[number];

export const AMRAP_DEFAULT_SECONDS = 600;

export type WorkClockStart = {
  kind: WorkClockKind;
  seconds: number;
};

export type WorkClockTick = {
  remaining: number;
  active: boolean;
  restarted: boolean;
};

/** Memory-only idle. Same shape the store slice uses. */
export const IDLE_WORK_CLOCK = {
  workClockKind: null as WorkClockKind | null,
  workClockActive: false,
  workClockRemaining: 0,
  workClockInitialSeconds: 0,
};

function isAmrapPreset(seconds: number): seconds is AmrapPreset {
  return (AMRAP_PRESETS as readonly number[]).includes(seconds);
}

/**
 * Resolve a start. Invalid kind / non-finite / 0 → null (empty invents nothing).
 * Interval always 60. Countdown uses a preset or the 10:00 default.
 */
export function resolveWorkClockStart(params: {
  kind: string | null | undefined;
  seconds?: number;
}): WorkClockStart | null {
  if (params.kind === 'interval') {
    return { kind: 'interval', seconds: EMOM_INTERVAL_SECONDS };
  }
  if (params.kind !== 'countdown') return null;
  const sec = params.seconds;
  if (sec === undefined) {
    return { kind: 'countdown', seconds: AMRAP_DEFAULT_SECONDS };
  }
  if (!Number.isFinite(sec) || sec <= 0) return null;
  if (isAmrapPreset(sec)) return { kind: 'countdown', seconds: sec };
  return { kind: 'countdown', seconds: AMRAP_DEFAULT_SECONDS };
}

export function tickWorkClock(params: {
  kind: WorkClockKind;
  remaining: number;
}): WorkClockTick {
  if (params.kind === 'interval') {
    if (params.remaining <= 1) {
      return { remaining: EMOM_INTERVAL_SECONDS, active: true, restarted: true };
    }
    return { remaining: params.remaining - 1, active: true, restarted: false };
  }
  if (params.remaining <= 1) {
    return { remaining: 0, active: false, restarted: false };
  }
  return { remaining: params.remaining - 1, active: true, restarted: false };
}

/**
 * Named so auto-rest cannot be inlined and go silent.
 * Work clock on → they already have a clock. Off → ordinary rest may start.
 */
export function shouldAutoRestAfterLog(params: { workClockActive: boolean }): boolean {
  return params.workClockActive !== true;
}

/** One clock string — rest and work clock share the formatter. */
export const formatWorkClock = formatRestClock;
