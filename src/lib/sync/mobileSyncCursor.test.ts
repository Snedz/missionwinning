import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextMobileSyncCursor, parseMobileSyncCursor } from './mobileSyncCursor';

const time = '2025-04-01T18:30:00.123456+02:00';
const id = '12345678-1234-4234-8234-123456789abc';

test('sync cursors preserve timezone offsets and database microseconds', () => {
  assert.deepEqual(parseMobileSyncCursor(null), { updatedAt: '1970-01-01T00:00:00.000Z', id: undefined });
  assert.deepEqual(parseMobileSyncCursor(time), { updatedAt: time, id: undefined });
  assert.deepEqual(parseMobileSyncCursor(`${time}~${id}`), { updatedAt: time, id });
  for (const value of ['', 'not-a-date', '2025-02-30T18:30:00Z', `${time}~`, `${time}~not-a-uuid`, `${time}~${id}~`]) {
    assert.equal(parseMobileSyncCursor(value), null, value);
  }
});

test('full pages preserve the incoming cursor format; short pages end pagination', () => {
  const rows = [{ updated_at: time, id }];
  assert.equal(nextMobileSyncCursor(rows, 1, false), time);
  assert.equal(nextMobileSyncCursor(rows, 1, true), `${time}~${id}`);
  assert.equal(nextMobileSyncCursor(rows, 2, true), null);
});
