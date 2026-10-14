/**
 * Week-4 retained weekly logger — the honest boss-metric instrument.
 *
 * A working set saved (kind ≠ warmup) emits `set_logged`. The first working set
 * in a local ISO week emits `week_logged`. `retained_week_4` is derived for
 * **this install only** (first logged week vs this week ≥ 4 and a log this week).
 *
 * Guests and accounts both ride the outbox now, keyed by device id. That used to be
 * `if (source === 'account')` — one line, and the reason the north-star metric could
 * only ever describe people who made an account. The product's promise is no account,
 * so the population the metric was measuring was the population the product is not for.
 * The server decides who may actually store a row (see app/api/metrics/week-logged):
 * consent is checked there, not here, so a client cannot claim its own permission.
 *
 * No PII, no emails, no EIN, no public user count.
 */

import { track } from '@/lib/analytics';
import { loggerEventSource } from '@/lib/authPresence';
import { getOrCreateDeviceId } from '@/lib/coach/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { isoWeekOffset, localIsoWeekKey } from '@/lib/time/localDate';
import { enqueueWeekLogged } from '@/lib/week4LoggerSync';

export type LoggerSource = 'guest' | 'account';

export type Week4LoggerState = {
  firstIsoWeek: string;
  weeks: string[];
};

export type WorkingSetLogInput = {
  kind?: string;
  exerciseId: string;
  weight: number;
};

export type Week4LoggerResult = {
  firedSetLogged: boolean;
  firedWeekLogged: boolean;
  enqueuedWeek: boolean;
  source: LoggerSource;
};

export type Week4LoggerHooks = {
  track: typeof track;
  enqueueWeekLogged: (isoWeek: string, deviceId: string) => void;
  source: LoggerSource;
  now: Date;
  deviceId: string;
};

export function isWorkingSetKind(kind?: string): boolean {
  return kind !== 'warmup';
}

export function emptyWeek4State(): Week4LoggerState {
  return { firstIsoWeek: '', weeks: [] };
}

export function readWeek4LoggerState(): Week4LoggerState {
  const raw = readJson<Partial<Week4LoggerState>>(STORAGE_KEYS.week4Retention, {});
  const firstIsoWeek = typeof raw.firstIsoWeek === 'string' ? raw.firstIsoWeek : '';
  const weeks = Array.isArray(raw.weeks)
    ? raw.weeks.filter((w): w is string => typeof w === 'string')
    : [];
  return { firstIsoWeek, weeks };
}

export function writeWeek4LoggerState(state: Week4LoggerState): void {
  writeJson(STORAGE_KEYS.week4Retention, state);
}

/**
 * First working-set week vs this week: retained when offset ≥ 3 (1-indexed week ≥ 4)
 * **and** this week already has a working set.
 */
export function computeRetainedWeek4(
  state: Week4LoggerState,
  thisWeek: string
): boolean {
  if (!state.firstIsoWeek || !thisWeek) return false;
  if (!state.weeks.includes(thisWeek)) return false;
  const offset = isoWeekOffset(state.firstIsoWeek, thisWeek);
  return offset !== null && offset >= 3;
}

export function applyWorkingSetWeek(
  state: Week4LoggerState,
  isoWeek: string
): { next: Week4LoggerState; isNewWeek: boolean } {
  if (!isoWeek) return { next: state, isNewWeek: false };
  if (state.weeks.includes(isoWeek)) {
    return { next: state, isNewWeek: false };
  }
  return {
    next: {
      firstIsoWeek: state.firstIsoWeek || isoWeek,
      weeks: [...state.weeks, isoWeek],
    },
    isNewWeek: true,
  };
}

function defaultHooks(): Week4LoggerHooks {
  return {
    track,
    enqueueWeekLogged,
    source: loggerEventSource(),
    now: new Date(),
    deviceId: getOrCreateDeviceId(),
  };
}

/**
 * Record a saved set. Warmups are ignored. Never awaits — safe on `logSet`.
 *
 * The week is enqueued for guests and accounts alike. A guest without a return-channel
 * subscription is refused by the server with a 4xx, which the outbox treats as done —
 * so an athlete who declined reminders still records their week locally and simply
 * never contributes a server row. That is the privacy decision working, not a failure.
 */
export function recordWorkingSetLogged(
  input: WorkingSetLogInput,
  hooks: Partial<Week4LoggerHooks> = {}
): Week4LoggerResult {
  const h = { ...defaultHooks(), ...hooks };
  const source = h.source;
  const empty: Week4LoggerResult = {
    firedSetLogged: false,
    firedWeekLogged: false,
    enqueuedWeek: false,
    source,
  };
  if (!isWorkingSetKind(input.kind)) return empty;

  const exerciseId = input.exerciseId || 'unknown';
  const hasLoad = Number(input.weight) > 0;
  h.track('set_logged', {
    source,
    exercise_id: exerciseId,
    has_load: hasLoad,
  });

  const isoWeek = localIsoWeekKey(h.now);
  const { next, isNewWeek } = applyWorkingSetWeek(readWeek4LoggerState(), isoWeek);
  writeWeek4LoggerState(next);

  let enqueuedWeek = false;
  if (isNewWeek) {
    h.track('week_logged', { source, iso_week: isoWeek });
    // 'server' is the SSR sentinel from getOrCreateDeviceId — never a real device.
    if (h.deviceId && h.deviceId !== 'server') {
      h.enqueueWeekLogged(isoWeek, h.deviceId);
      enqueuedWeek = true;
    }
  }

  return {
    firedSetLogged: true,
    firedWeekLogged: isNewWeek,
    enqueuedWeek,
    source,
  };
}

export function week4HoodSnapshot(now: Date = new Date()): {
  firstIsoWeek: string;
  thisWeek: string;
  loggedThisWeek: boolean;
  retainedWeek4: boolean;
} {
  const thisWeek = localIsoWeekKey(now);
  const state = readWeek4LoggerState();
  return {
    firstIsoWeek: state.firstIsoWeek,
    thisWeek,
    loggedThisWeek: state.weeks.includes(thisWeek),
    retainedWeek4: computeRetainedWeek4(state, thisWeek),
  };
}
