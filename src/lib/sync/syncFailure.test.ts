/**
 * A sync ack carries a fixed code. The database sentence stays in the log.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { logSyncFailure, logSyncThrown, SYNC_FAILED } from '@/lib/sync/syncFailure';

const root = path.join(import.meta.dirname, '..', '..', '..');

test('a PostgREST failure becomes sync_failed', () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  };
  try {
    assert.equal(logSyncFailure('mobile/sync/workouts', 'invalid input syntax for type timestamp'), SYNC_FAILED);
    assert.equal(logSyncThrown('mobile/sync/workouts', new Error('column workout_logs.nope does not exist')), SYNC_FAILED);
    assert.equal(logSyncThrown('mobile/sync/workouts', 'nope'), SYNC_FAILED);
  } finally {
    console.error = original;
  }
  assert.match(lines.join('\n'), /invalid input syntax/);
  assert.match(lines.join('\n'), /workout_logs/);
});

test('the three sync pushes do not put a thrown message on the ack', () => {
  for (const file of [
    'app/api/mobile/sync/workouts/route.ts',
    'app/api/mobile/sync/customs/route.ts',
    'app/api/mobile/sync/routines/route.ts',
  ]) {
    const src = readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(src, /throw new Error\(error\.message\)/);
    assert.doesNotMatch(src, /e instanceof Error \? e\.message/);
    assert.match(src, /SYNC_FAILED|logSyncFailure|logSyncThrown/);
  }
});
