import assert from 'node:assert/strict';
import { test } from 'node:test';
import { weekStartMonday } from './types';

test('shared coach seed week starts on local Monday east of UTC', () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'Pacific/Kiritimati';
    assert.equal(weekStartMonday(new Date('2026-10-18T09:59:00Z')), '2026-10-12');
    assert.equal(weekStartMonday(new Date('2026-10-18T10:00:00Z')), '2026-10-19');
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
