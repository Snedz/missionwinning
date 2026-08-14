import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epley1rm } from '@/lib/calcHelpers';
import { __resetForTests } from '@/lib/storage/safeStorage';
import type { LoggedSet } from '@/types';
import {
  SESSION_E1RM_FORMULA,
  SESSION_E1RM_MAX_REPS,
  epleySessionEstimate,
  loadSessionE1rmVisible,
  saveSessionE1rmVisible,
  sessionE1rmFromSets,
} from '@/lib/workout/sessionE1rm';

function set(partial: Partial<LoggedSet> & Pick<LoggedSet, 'reps' | 'weight'>): LoggedSet {
  return {
    id: partial.id ?? `${partial.kind ?? 'n'}-${partial.weight}x${partial.reps}`,
    completed: partial.completed ?? true,
    kind: partial.kind,
    reps: partial.reps,
    weight: partial.weight,
  };
}

test('Epley 100 × 5 is 117 — the named formula, not Brzycki', () => {
  assert.equal(epley1rm(100, 5), 117);
  assert.equal(epleySessionEstimate(100, 5), 117);
  assert.equal(SESSION_E1RM_FORMULA, 'epley');
});

test('a logged single is the weight — Epley is not applied to 1-rep sets', () => {
  assert.equal(epleySessionEstimate(140, 1), 140);
  assert.notEqual(epleySessionEstimate(140, 1), epley1rm(140, 1));
});

test('load-0 skip and invalid inputs do not feed the formula', () => {
  assert.equal(epleySessionEstimate(0, 5), null);
  assert.equal(epleySessionEstimate(-10, 5), null);
  assert.equal(epleySessionEstimate(100, 0), null);
  assert.equal(epleySessionEstimate(100, SESSION_E1RM_MAX_REPS + 1), null);
  assert.equal(epleySessionEstimate(NaN, 5), null);
});

test('warmup W sets do not feed the session estimate', () => {
  const onlyWarmup = sessionE1rmFromSets([
    set({ kind: 'warmup', reps: 8, weight: 200 }),
  ]);
  assert.equal(onlyWarmup, null);

  const mixed = sessionE1rmFromSets([
    set({ kind: 'warmup', reps: 8, weight: 200 }),
    set({ kind: 'normal', reps: 5, weight: 100 }),
  ]);
  assert.equal(mixed?.e1rm, 117);
  assert.equal(mixed?.weight, 100);
  assert.equal(mixed?.formula, 'epley');
});

test('load-0 completed sets do not feed even when marked work', () => {
  assert.equal(
    sessionE1rmFromSets([set({ kind: 'normal', reps: 10, weight: 0 })]),
    null
  );
});

test('incomplete planned rows and failure sets are skipped', () => {
  assert.equal(
    sessionE1rmFromSets([
      set({ completed: false, reps: 5, weight: 120 }),
      set({ kind: 'failure', reps: 3, weight: 150 }),
    ]),
    null
  );
});

test('the session keeps its strongest Epley, which is not always the heaviest bar', () => {
  // 100 × 5 → 117; 110 × 2 → 117; 105 × 3 → 116. The 5-rep set is enough.
  const best = sessionE1rmFromSets([
    set({ reps: 5, weight: 100 }),
    set({ reps: 3, weight: 105 }),
  ]);
  assert.equal(best?.weight, 100);
  assert.equal(best?.e1rm, 117);
});

test('hide pref defaults on; 0 hides', () => {
  __resetForTests();
  assert.equal(loadSessionE1rmVisible(), true);
  saveSessionE1rmVisible(false);
  assert.equal(loadSessionE1rmVisible(), false);
  saveSessionE1rmVisible(true);
  assert.equal(loadSessionE1rmVisible(), true);
});
