
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('rewards INDEX documents perfect week + apply', () => {
  const src = readFileSync(join(import.meta.dirname, 'INDEX.md'), 'utf8');
  assert.match(src, /perfectWeek/i);
  assert.match(src, /apply\.ts/);
  assert.match(src, /full_spectrum|perfect_week/i);
});
