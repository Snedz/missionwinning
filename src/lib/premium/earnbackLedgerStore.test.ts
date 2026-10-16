import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLedgerStore, type LedgerKey } from './earnbackLedgerStore.js';
import type { LedgerRow, LedgerEvent } from './earnbackLedgerProgress.js';

function makeRow(overrides: Partial<LedgerRow> = {}): LedgerRow {
  return {
    planId: 'plan_123',
    startDate: '2024-01-01',
    windowDays: 30,
    requiredSessions: 3,
    pricePaidCents: 9999,
    completedSessions: 0,
    disputeOpen: false,
    ...overrides,
  };
}

function makeKey(overrides: Partial<LedgerKey> = {}): LedgerKey {
  return {
    userId: 'user_abc',
    planId: 'plan_123',
    ...overrides,
  };
}

test('upsert then get returns equal fields', () => {
  const store = createLedgerStore();
  const key = makeKey();
  const row = makeRow({ completedSessions: 1 });

  store.upsert(key, row);
  const retrieved = store.get(key);

  assert.deepStrictEqual(retrieved, row);
});

test('apply session_counted increments completedSessions and persists', () => {
  const store = createLedgerStore();
  const key = makeKey();
  const row = makeRow({ completedSessions: 1 });

  store.upsert(key, row);

  const event: LedgerEvent = { type: 'session_counted' };
  const nowMs = Date.parse('2024-01-15');
  const result = store.apply(key, event, nowMs);

  assert.ok(result !== null, 'apply should return result');
  assert.strictEqual(result.row.completedSessions, 2);

  // Verify persistence
  const retrieved = store.get(key);
  assert.strictEqual(retrieved?.completedSessions, 2);
});

test('apply on missing key returns null', () => {
  const store = createLedgerStore();
  const key = makeKey({ userId: 'nonexistent' });

  const event: LedgerEvent = { type: 'session_counted' };
  const nowMs = Date.parse('2024-01-15');
  const result = store.apply(key, event, nowMs);

  assert.strictEqual(result, null);
});

test('listForUser returns only that users rows in insert order', () => {
  const store = createLedgerStore();
  const userId = 'user_test';

  store.upsert({ userId, planId: 'plan_a' }, makeRow({ completedSessions: 1 }));
  store.upsert({ userId, planId: 'plan_b' }, makeRow({ completedSessions: 2 }));
  store.upsert({ userId: 'other_user', planId: 'plan_c' }, makeRow({ completedSessions: 3 }));
  store.upsert({ userId, planId: 'plan_c' }, makeRow({ completedSessions: 4 }));

  const results = store.listForUser(userId);

  assert.strictEqual(results.length, 3);
  assert.strictEqual(results[0].completedSessions, 1);
  assert.strictEqual(results[1].completedSessions, 2);
  assert.strictEqual(results[2].completedSessions, 4);
});

test('empty userId upsert is no-op; get returns undefined', () => {
  const store = createLedgerStore();
  const row = makeRow();

  store.upsert({ userId: '', planId: 'plan_123' }, row);
  const retrieved = store.get({ userId: '', planId: 'plan_123' });

  assert.strictEqual(retrieved, undefined);

  store.upsert({ userId: '   ', planId: 'plan_123' }, row);
  const retrieved2 = store.get({ userId: '   ', planId: 'plan_123' });

  assert.strictEqual(retrieved2, undefined);
});

test('clear empties store', () => {
  const store = createLedgerStore();
  const key = makeKey();

  store.upsert(key, makeRow());
  assert.ok(store.get(key) !== undefined);

  store.clear();

  assert.strictEqual(store.get(key), undefined);
  assert.strictEqual(store.listForUser(key.userId).length, 0);
});
