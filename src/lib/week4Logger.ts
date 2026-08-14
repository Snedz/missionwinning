/**
 * Week-4 retained weekly logger — the honest boss-metric instrument.
 *
 * A working set saved (kind ≠ warmup) emits `set_logged`. The first working set
 * in a local ISO week emits `week_logged`. `retained_week_4` is derived for
 * **this install only** (first logged week vs this week ≥ 4 and a log this week).
 *
 * Guests stay local + PostHog. Signed-in `week_logged` may ride the outbox.
 * No PII, no emails, no EIN, no public user count.
 */

import { track } from '@/lib/analytics';
import { loggerEventSource } from '@/lib/authPresence';
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
  enqueueWeekLogged: (isoWeek: string) => void;
  source: LoggerSource;
  now: Date;
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
  };
}

/**
 * Record a saved set. Warmups are ignored. Never awaits — safe on `logSet`.
 * Guest never enqueues a server write.
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
    if (source === 'account') {
      h.enqueueWeekLogged(isoWeek);
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
