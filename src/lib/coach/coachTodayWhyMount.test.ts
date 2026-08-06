import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('CoachTodayCard surfaces session why line', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'coach', 'CoachTodayCard.tsx'),
    'utf8'
  );
  assert.match(src, /buildSessionWhyLine/);
  assert.match(src, /coach-session-why/);
});
