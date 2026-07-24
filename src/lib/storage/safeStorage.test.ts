import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetForTests,
  isPersistent,
  onStorageFailure,
  readJson,
  readRaw,
  remove,
  writeJson,
  writeRaw,
  type StorageFailure,
} from '@/lib/storage/safeStorage';

type Stub = {
  install: () => void;
  uninstall: () => void;
};

function stubStorage(opts: {
  throwOnSet?: 'quota' | 'denied';
  throwOnGet?: 'denied';
} = {}): Stub {
  const map = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      if (opts.throwOnGet === 'denied') {
        const e = new Error('denied');
        e.name = 'SecurityError';
        throw e;
      }
      return map.has(key) ? (map.get(key) as string) : null;
    },
    setItem(key: string, value: string) {
      if (opts.throwOnSet === 'quota') {
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      }
      if (opts.throwOnSet === 'denied') {
        const e = new Error('denied');
        e.name = 'SecurityError';
        throw e;
      }
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    key(i: number) {
      return [...map.keys()][i] ?? null;
    },
    get length() {
      return map.size;
    },
  } as unknown as Storage;

  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  return {
    install() {
      g.localStorage = storage;
    },
    uninstall() {
      if (prev === undefined) delete g.localStorage;
      else g.localStorage = prev;
    },
  };
}

test('safeStorage', async (t) => {
  t.afterEach(() => __resetForTests());

  await t.test('round-trips raw values when storage works', () => {
    const stub = stubStorage();
    stub.install();
    try {
      assert.equal(writeRaw('k', 'v'), true);
      assert.equal(readRaw('k'), 'v');
      remove('k');
      assert.equal(readRaw('k'), null);
    } finally {
      stub.uninstall();
    }
  });

  await t.test('no-ops without throwing during SSR', () => {
    const g = globalThis as { localStorage?: Storage };
    const prev = g.localStorage;
    delete g.localStorage;
    try {
      assert.equal(writeRaw('k', 'v'), false, 'SSR write is not durable');
      assert.equal(isPersistent(), false);
      // Value is still readable within the same process (memory fallback).
      assert.equal(readRaw('k'), 'v');
    } finally {
      if (prev === undefined) delete g.localStorage;
      else g.localStorage = prev;
    }
  });

  await t.test('quota failure reports once and keeps the value in memory', () => {
    const stub = stubStorage({ throwOnSet: 'quota' });
    stub.install();
    const seen: StorageFailure[] = [];
    onStorageFailure((f) => seen.push(f));
    try {
      assert.equal(writeRaw('a', '1'), false);
      assert.equal(writeRaw('b', '2'), false);
      assert.equal(seen.length, 1, 'a full disk must not spam the user');
      assert.equal(seen[0].reason, 'quota');
      // The session still behaves correctly even though nothing persisted.
      assert.equal(readRaw('a'), '1');
      assert.equal(readRaw('b'), '2');
    } finally {
      stub.uninstall();
    }
  });

  await t.test('denied storage switches to the memory fallback', () => {
    const stub = stubStorage({ throwOnSet: 'denied' });
    stub.install();
    const seen: StorageFailure[] = [];
    onStorageFailure((f) => seen.push(f));
    try {
      assert.equal(writeRaw('x', '1'), false);
      assert.equal(isPersistent(), false, 'private mode must not look persistent');
      assert.equal(readRaw('x'), '1');
      assert.equal(seen[0].reason, 'denied');
    } finally {
      stub.uninstall();
    }
  });

  await t.test('reads survive a storage that throws on get', () => {
    const stub = stubStorage({ throwOnGet: 'denied' });
    stub.install();
    try {
      assert.equal(readRaw('nope'), null);
    } finally {
      stub.uninstall();
    }
  });

  await t.test('readJson treats corrupt payloads as absent', () => {
    const stub = stubStorage();
    stub.install();
    try {
      writeRaw('bad', '{not json');
      assert.deepEqual(readJson('bad', { ok: true }), { ok: true });

      writeRaw('nullish', 'null');
      assert.deepEqual(readJson('nullish', { ok: true }), { ok: true });

      assert.equal(writeJson('good', { n: 1 }), true);
      assert.deepEqual(readJson('good', null), { n: 1 });
    } finally {
      stub.uninstall();
    }
  });

  await t.test('writeJson refuses circular values instead of throwing', () => {
    const stub = stubStorage();
    stub.install();
    try {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      assert.equal(writeJson('circ', circular), false);
    } finally {
      stub.uninstall();
    }
  });
});
