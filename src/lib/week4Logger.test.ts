import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { __resetAuthPresenceForTests, setLoggerAuthPresence } from '@/lib/authPresence';
import { isoWeekOffset, localIsoWeekKey } from '@/lib/time/localDate';
import {
  applyWorkingSetWeek,
  computeRetainedWeek4,
  emptyWeek4State,
  isWorkingSetKind,
  readWeek4LoggerState,
  recordWorkingSetLogged,
  week4HoodSnapshot,
} from '@/lib/week4Logger';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let uninstall: () => void;

beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
  __resetAuthPresenceForTests();
});

afterEach(() => {
  uninstall();
  __resetAuthPresenceForTests();
});

describe('isWorkingSetKind', () => {
  it('excludes warmup and counts normal / failure / drop', () => {
    assert.equal(isWorkingSetKind('warmup'), false);
    assert.equal(isWorkingSetKind('normal'), true);
    assert.equal(isWorkingSetKind('failure'), true);
    assert.equal(isWorkingSetKind('drop'), true);
    assert.equal(isWorkingSetKind(undefined), true);
  });
});

describe('computeRetainedWeek4', () => {
  it('is false before week 4 even with a log this week', () => {
    const state = { firstIsoWeek: '2026-W01', weeks: ['2026-W01', '2026-W03'] };
    assert.equal(computeRetainedWeek4(state, '2026-W01'), false);
    assert.equal(computeRetainedWeek4(state, '2026-W03'), false);
  });

  it('is true at week 4 only when this week has a working-set log', () => {
    const logged = { firstIsoWeek: '2026-W01', weeks: ['2026-W01', '2026-W04'] };
    const gap = { firstIsoWeek: '2026-W01', weeks: ['2026-W01'] };
    assert.equal(computeRetainedWeek4(logged, '2026-W04'), true);
    assert.equal(computeRetainedWeek4(gap, '2026-W04'), false);
    assert.equal(computeRetainedWeek4(emptyWeek4State(), '2026-W04'), false);
  });
});

describe('applyWorkingSetWeek', () => {
  it('marks only the first save in a week as new', () => {
    const first = applyWorkingSetWeek(emptyWeek4State(), '2026-W33');
    assert.equal(first.isNewWeek, true);
    assert.equal(first.next.firstIsoWeek, '2026-W33');
    const again = applyWorkingSetWeek(first.next, '2026-W33');
    assert.equal(again.isNewWeek, false);
    assert.deepEqual(again.next.weeks, ['2026-W33']);
  });
});

describe('recordWorkingSetLogged', () => {
  it('does not fire set_logged for a warmup', () => {
    const events: string[] = [];
    const enqueued: string[] = [];
    const result = recordWorkingSetLogged(
      { kind: 'warmup', exerciseId: 'squat', weight: 60 },
      {
        source: 'guest',
        now: new Date(2026, 7, 13, 12),
        track: (event) => {
          events.push(event);
        },
        enqueueWeekLogged: (week) => {
          enqueued.push(week);
        },
      }
    );
    assert.equal(result.firedSetLogged, false);
    assert.equal(result.firedWeekLogged, false);
    assert.deepEqual(events, []);
    assert.deepEqual(enqueued, []);
  });

  it('guest has no server write', () => {
    const enqueued: string[] = [];
    const events: Array<{ event: string; props?: Record<string, string | number | boolean> }> =
      [];
    setLoggerAuthPresence(false);
    const result = recordWorkingSetLogged(
      { kind: 'normal', exerciseId: 'bench', weight: 80 },
      {
        source: 'guest',
        now: new Date(2026, 7, 13, 12),
        track: (event, props) => {
          events.push({ event, props });
        },
        enqueueWeekLogged: (week) => {
          enqueued.push(week);
        },
      }
    );
    assert.equal(result.firedSetLogged, true);
    assert.equal(result.firedWeekLogged, true);
    assert.equal(result.enqueuedWeek, false);
    assert.equal(result.source, 'guest');
    assert.deepEqual(enqueued, []);
    assert.equal(events[0]?.event, 'set_logged');
    assert.equal(events[0]?.props?.source, 'guest');
    assert.equal(events[0]?.props?.exercise_id, 'bench');
    assert.equal(events[0]?.props?.has_load, true);
    assert.equal(events[1]?.event, 'week_logged');
  });

  it('account enqueues week_logged once per ISO week', () => {
    const enqueued: string[] = [];
    const now = new Date(2026, 7, 13, 12);
    const hooks = {
      source: 'account' as const,
      now,
      track: () => undefined,
      enqueueWeekLogged: (week: string) => {
        enqueued.push(week);
      },
    };
    const first = recordWorkingSetLogged(
      { kind: 'normal', exerciseId: 'row', weight: 0 },
      hooks
    );
    const second = recordWorkingSetLogged(
      { kind: 'drop', exerciseId: 'row', weight: 40 },
      hooks
    );
    assert.equal(first.enqueuedWeek, true);
    assert.equal(second.enqueuedWeek, false);
    assert.equal(second.firedSetLogged, true);
    assert.equal(second.firedWeekLogged, false);
    assert.deepEqual(enqueued, ['2026-W33']);
    assert.ok(globalThis.localStorage?.getItem(STORAGE_KEYS.week4Retention));
  });
});

describe('week4Logger wiring', () => {
  it('logSet records working sets and does not inline PostHog event names', () => {
    const store = read('src/store/workoutStore.ts');
    const logSet = store.match(/logSet:\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\},/);
    assert.ok(logSet, 'logSet missing');
    assert.match(logSet![0], /recordWorkingSetLogged/);
    assert.doesNotMatch(logSet![0], /['"]set_logged['"]|['"]week_logged['"]/);
    assert.doesNotMatch(logSet![0], /\benqueueWeekLogged\b/);
  });

  it('warmup early-return is the only skip in the recorder', () => {
    const src = read('src/lib/week4Logger.ts');
    assert.match(src, /kind !== 'warmup'/);
    assert.match(src, /source === 'account'/);
    assert.match(src, /enqueueWeekLogged/);
  });

  it('METRICS.md defines the metric and forbids invented traction', () => {
    const doc = read('docs/METRICS.md');
    assert.match(doc, /We do not invent traction/);
    assert.match(doc, /kind === 'warmup'/);
    assert.match(doc, /Empty sessions/);
    assert.match(doc, /Guests stay on-device|Guest[\s\S]*Never/);
    assert.doesNotMatch(doc, /\b\d{2,}\s+users retained\b/i);
  });
});

describe('H-01 end-to-end working-set chain', () => {
  it('one install: first week + a later week, hood matches device and enqueue', () => {
    const enqueued: string[] = [];
    const firstNow = new Date(2026, 0, 5, 12);
    const laterNow = new Date(2026, 0, 26, 12);
    const week1 = localIsoWeekKey(firstNow);
    const weekLater = localIsoWeekKey(laterNow);
    const offset = isoWeekOffset(week1, weekLater);
    assert.ok(offset !== null && offset >= 3, `need ≥3 weeks between ${week1} and ${weekLater}`);

    const first = recordWorkingSetLogged(
      { kind: 'normal', exerciseId: 'squat', weight: 100 },
      {
        source: 'account',
        now: firstNow,
        track: () => undefined,
        enqueueWeekLogged: (week) => {
          enqueued.push(week);
        },
      }
    );
    assert.equal(first.firedSetLogged, true);
    assert.equal(first.firedWeekLogged, true);
    assert.equal(first.enqueuedWeek, true);

    const hood1 = week4HoodSnapshot(firstNow);
    assert.equal(hood1.firstIsoWeek, week1);
    assert.equal(hood1.thisWeek, week1);
    assert.equal(hood1.loggedThisWeek, true);
    assert.equal(hood1.retainedWeek4, false);
    assert.deepEqual(enqueued, [hood1.thisWeek]);

    const later = recordWorkingSetLogged(
      { kind: 'normal', exerciseId: 'squat', weight: 105 },
      {
        source: 'account',
        now: laterNow,
        track: () => undefined,
        enqueueWeekLogged: (week) => {
          enqueued.push(week);
        },
      }
    );
    assert.equal(later.firedSetLogged, true);
    assert.equal(later.firedWeekLogged, true);
    assert.equal(later.enqueuedWeek, true);

    const hood = week4HoodSnapshot(laterNow);
    const device = readWeek4LoggerState();
    assert.equal(hood.firstIsoWeek, week1);
    assert.equal(hood.thisWeek, weekLater);
    assert.equal(hood.loggedThisWeek, true);
    assert.equal(hood.retainedWeek4, true);
    assert.equal(hood.retainedWeek4, computeRetainedWeek4(device, weekLater));
    assert.deepEqual(device.weeks, [week1, weekLater]);
    assert.deepEqual(enqueued, [week1, weekLater]);
    assert.equal(enqueued[1], hood.thisWeek);
  });

  it('hood card and week-logged API consume the snapshot and the same week key', () => {
    const card = read('src/components/profile/UnderTheHoodCard.tsx');
    assert.match(card, /week4HoodSnapshot/);
    assert.match(card, /We do not invent traction/);
    assert.doesNotMatch(card, /\b\d{2,}\s+users retained\b/i);
    const route = read('app/api/metrics/week-logged/route.ts');
    assert.match(route, /weekLoggedBodySchema/);
    const sync = read('src/lib/week4LoggerSync.ts');
    assert.match(sync, /isoWeek/);
    const events = read('src/lib/analytics.ts');
    assert.match(events, /'set_logged'/);
    assert.match(events, /'week_logged'/);
  });
});
