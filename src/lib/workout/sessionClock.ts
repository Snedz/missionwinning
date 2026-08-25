/**
 * Session elapsed clock — pause / resume of time that counts on the receipt.
 *
 * `.1001` — not rest. Not EMOM/AMRAP. Those stay independent.
 * Leave-Today does not auto-pause (Resume `.963` keeps the set; clock
 * policy is explicit). Empty / never started invents nothing.
 *
 * No store import. Own the seconds math.
 */

export type SessionClock = {
  /** Seconds already counted while the clock was running. */
  accumulatedSeconds: number;
  /** ISO of last resume. Null means paused. */
  runningSince: string | null;
};

export type SessionClockSource = {
  startedAt?: string;
  sessionClock?: SessionClock | null;
} | null | undefined;

function secondsBetween(fromIso: string | null | undefined, now: number): number {
  if (!fromIso) return 0;
  const started = new Date(fromIso).getTime();
  if (!Number.isFinite(started)) return 0;
  return Math.max(0, Math.floor((now - started) / 1000));
}

function sanitizeAccum(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.floor(v);
}

function normalizeClock(clock: SessionClock): SessionClock {
  const accumulatedSeconds = sanitizeAccum(clock.accumulatedSeconds);
  const run = clock.runningSince;
  if (run == null || run === '') {
    return { accumulatedSeconds, runningSince: null };
  }
  if (!Number.isFinite(new Date(run).getTime())) {
    return { accumulatedSeconds, runningSince: null };
  }
  return { accumulatedSeconds, runningSince: run };
}

/** Seed when they tap Start. Running from that instant. */
export function startSessionClock(startedAt: string): SessionClock {
  return { accumulatedSeconds: 0, runningSince: startedAt };
}

/**
 * Read the clock on a live session.
 * No session / no start invents nothing.
 * Pre-`.1001` persist (no clock field) runs from `startedAt`.
 */
export function readSessionClock(source: SessionClockSource): SessionClock | null {
  if (!source || typeof source !== 'object') return null;
  if (source.sessionClock) return normalizeClock(source.sessionClock);
  const startedAt = source.startedAt;
  if (!startedAt) return null;
  if (!Number.isFinite(new Date(startedAt).getTime())) return null;
  return { accumulatedSeconds: 0, runningSince: startedAt };
}

export function sessionElapsedSeconds(
  clock: SessionClock | null,
  now: number = Date.now()
): number {
  if (!clock) return 0;
  const acc = sanitizeAccum(clock.accumulatedSeconds);
  if (!clock.runningSince) return acc;
  return acc + secondsBetween(clock.runningSince, now);
}

export function isSessionClockPaused(clock: SessionClock | null): boolean {
  return clock != null && clock.runningSince == null;
}

export function pauseSessionClock(
  clock: SessionClock | null,
  now: number = Date.now()
): SessionClock | null {
  if (!clock) return null;
  if (clock.runningSince == null) {
    return { accumulatedSeconds: sanitizeAccum(clock.accumulatedSeconds), runningSince: null };
  }
  return {
    accumulatedSeconds: sessionElapsedSeconds(clock, now),
    runningSince: null,
  };
}

export function resumeSessionClock(
  clock: SessionClock | null,
  now: number = Date.now()
): SessionClock | null {
  if (!clock) return null;
  if (clock.runningSince != null) return normalizeClock(clock);
  return {
    accumulatedSeconds: sanitizeAccum(clock.accumulatedSeconds),
    runningSince: new Date(now).toISOString(),
  };
}

export function toggleSessionClock(
  clock: SessionClock | null,
  now: number = Date.now()
): SessionClock | null {
  if (!clock) return null;
  return clock.runningSince == null
    ? resumeSessionClock(clock, now)
    : pauseSessionClock(clock, now);
}
