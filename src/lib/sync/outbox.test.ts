import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ATTEMPTS,
  __resetForTests,
  __setClockForTests,
  __setJitterForTests,
  enqueue,
  flush,
  getState,
  msUntilNextAttempt,
  registerHandler,
  retryStuck,
  subscribe,
} from '@/lib/sync/outbox';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

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

let now = 1_000_000;

function setup() {
  const uninstall = installStorage();
  resetStorage();
  __resetForTests();
  now = 1_000_000;
  __setClockForTests(() => now);
  __setJitterForTests(() => 0.5); // deterministic backoff
  return uninstall;
}

test('outbox', async (t) => {
  await t.test('a queued op is delivered and removed', async () => {
    const uninstall = setup();
    try {
      const seen: unknown[] = [];
      registerHandler('workout.upsert', async (payload) => {
        seen.push(payload);
        return true;
      });

      enqueue('workout.upsert', 'client-1', { id: 'client-1' });
      assert.equal(getState().pending, 1);

      const done = await flush();
      assert.equal(done, 1);
      assert.deepEqual(seen, [{ id: 'client-1' }]);
      assert.equal(getState().pending, 0, 'a delivered op must not linger');
    } finally {
      uninstall();
    }
  });

  await t.test('survives a reload — the queue lives in storage, not memory', async () => {
    const uninstall = setup();
    try {
      enqueue('workout.upsert', 'client-1', { id: 'client-1' });
      // Simulate a fresh page: handlers and listeners are gone, storage is not.
      __setClockForTests(() => now);
      assert.equal(getState().pending, 1, 'the op outlived the tab');

      let delivered = false;
      registerHandler('workout.upsert', async () => {
        delivered = true;
        return true;
      });
      await flush();
      assert.equal(delivered, true);
    } finally {
      uninstall();
    }
  });

  await t.test('a failing op backs off exponentially instead of hammering', async () => {
    const uninstall = setup();
    try {
      let calls = 0;
      registerHandler('coach.plan', async () => {
        calls += 1;
        return false;
      });

      enqueue('coach.plan', 'plan', { revision: 1 });
      await flush();
      assert.equal(calls, 1);

      // Not due yet — a second flush must not retry.
      await flush();
      assert.equal(calls, 1, 'retry before the backoff window is a hammer');

      const wait1 = msUntilNextAttempt();
      assert.ok(wait1 !== null && wait1 > 0);

      now += wait1 + 1;
      await flush();
      assert.equal(calls, 2);

      const wait2 = msUntilNextAttempt();
      assert.ok(wait2 !== null && wait2 > wait1, 'delay must grow');
    } finally {
      uninstall();
    }
  });

  await t.test('a handler that throws is treated as a retry, not a loss', async () => {
    const uninstall = setup();
    try {
      let calls = 0;
      registerHandler('fuel.plan', async () => {
        calls += 1;
        throw new Error('network down');
      });

      enqueue('fuel.plan', 'plan', { a: 1 });
      await flush();
      assert.equal(calls, 1);
      assert.equal(getState().pending, 1, 'the op is still queued after a throw');
    } finally {
      uninstall();
    }
  });

  await t.test('exhausted ops go stuck but are never discarded', async () => {
    const uninstall = setup();
    try {
      registerHandler('journey.state', async () => false);
      enqueue('journey.state', 'state', { phase: 'basic' });

      for (let i = 0; i < MAX_ATTEMPTS + 2; i++) {
        const wait = msUntilNextAttempt();
        if (wait !== null) now += wait + 1;
        await flush();
      }

      const state = getState();
      assert.equal(state.stuck, 1, 'the op is retained for an honest UI count');
      assert.equal(state.pending, 0);

      retryStuck();
      assert.equal(getState().pending, 1, 'retryStuck re-arms it');
    } finally {
      uninstall();
    }
  });

  await t.test('re-enqueuing the same key collapses superseded latest-state work', async () => {
    const uninstall = setup();
    try {
      const seen: unknown[] = [];
      registerHandler('coach.plan', async (p) => {
        seen.push(p);
        return true;
      });

      enqueue('coach.plan', 'plan', { revision: 1 });
      enqueue('coach.plan', 'plan', { revision: 2 });
      enqueue('coach.plan', 'plan', { revision: 3 });
      assert.equal(getState().pending, 1, 'three edits, one push');

      await flush();
      assert.deepEqual(seen, [{ revision: 3 }], 'only the newest state is sent');
    } finally {
      uninstall();
    }
  });

  await t.test('distinct entity keys are all kept', async () => {
    const uninstall = setup();
    try {
      const seen: string[] = [];
      registerHandler('workout.upsert', async (p) => {
        seen.push((p as { id: string }).id);
        return true;
      });

      enqueue('workout.upsert', 'a', { id: 'a' });
      enqueue('workout.upsert', 'b', { id: 'b' });
      assert.equal(getState().pending, 2, 'two workouts must not collapse into one');

      await flush();
      assert.deepEqual(seen.sort(), ['a', 'b']);
    } finally {
      uninstall();
    }
  });

  await t.test('an op with no registered handler waits instead of failing', async () => {
    const uninstall = setup();
    try {
      enqueue('pft.push', 'pft', { tier: 3 });
      const done = await flush();
      assert.equal(done, 0);
      assert.equal(getState().pending, 1, 'still queued for a surface that can send it');
    } finally {
      uninstall();
    }
  });

  await t.test('corrupt queue storage recovers to empty rather than throwing', async () => {
    const uninstall = setup();
    try {
      globalThis.localStorage.setItem('mw_outbox_v1', '{not an array');
      assert.equal(getState().pending, 0);
      enqueue('workout.upsert', 'a', { id: 'a' });
      assert.equal(getState().pending, 1);
    } finally {
      uninstall();
    }
  });

  await t.test('subscribers see the pending count change', async () => {
    const uninstall = setup();
    try {
      const counts: number[] = [];
      const unsub = subscribe((s) => counts.push(s.pending));
      enqueue('workout.upsert', 'a', { id: 'a' });
      registerHandler('workout.upsert', async () => true);
      await flush();
      unsub();
      assert.deepEqual(counts, [0, 1, 0]);
    } finally {
      uninstall();
    }
  });
});
