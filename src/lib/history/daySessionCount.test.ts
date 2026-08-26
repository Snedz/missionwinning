/**
 * Trained day shows how many live sessions. Empty / junk invents nothing.
 * Never invent 1 on a blank / logged / future day. Does not invent history rows.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { decideDaySessionCount } from './daySessionCount.ts';

const helperSrc = readFileSync(path.join(import.meta.dirname, 'daySessionCount.ts'), 'utf8');

describe('decideDaySessionCount (.1032)', () => {
  it('empty on none / logged / future / junk / 0 — never invents 1', () => {
    assert.deepEqual(decideDaySessionCount({}), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'none' }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'none', sessions: 1 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'none', sessions: 3 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'logged', sessions: 2 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'logged' }), { kind: 'empty' });
    // A future day is blank paper — mark is not trained, even if a count is stuffed in.
    assert.deepEqual(decideDaySessionCount({ mark: 'none', sessions: 1 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained' }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: undefined }), {
      kind: 'empty',
    });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: null }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: 0 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: -1 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: 1.5 }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: Number.NaN }), {
      kind: 'empty',
    });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: Number.POSITIVE_INFINITY }), {
      kind: 'empty',
    });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: '3' }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: [3] }), { kind: 'empty' });
    assert.deepEqual(decideDaySessionCount({ mark: 'missed', sessions: 1 }), { kind: 'empty' });
  });

  it('apply 1 and apply 3 on trained', () => {
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: 1 }), {
      kind: 'apply',
      count: 1,
    });
    assert.deepEqual(decideDaySessionCount({ mark: 'trained', sessions: 3 }), {
      kind: 'apply',
      count: 3,
    });
  });

  it('does not invent history rows; helper has no store', () => {
    const before = decideDaySessionCount({ mark: 'trained', sessions: 2 });
    assert.deepEqual(before, { kind: 'apply', count: 2 });
    assert.doesNotMatch(helperSrc, /CompletedWorkoutLog|workoutHistory|workoutStore/);
    assert.doesNotMatch(helperSrc, /from '@\/store\//);
    assert.doesNotMatch(helperSrc, /toISOString\(/);
    assert.doesNotMatch(helperSrc, /localStorage/);
    assert.match(helperSrc, /Does not invent history rows/);
    assert.match(helperSrc, /Pure: no store/);
    assert.equal(typeof decideDaySessionCount, 'function');
  });
});
