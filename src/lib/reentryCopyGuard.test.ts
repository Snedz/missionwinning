/**
 * Re-entry athlete copy must stay shame-free (Horizon W criterion 4).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN = [
  /you missed/i,
  /broken streak/i,
  /failed/i,
  /guilt/i,
  /lazy/i,
  /you quit/i,
  /most people quit/i,
];

test('TodayReentryCard defaults stay shame-free', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', 'components', 'today', 'TodayReentryCard.tsx'),
    'utf8'
  );
  // Extract defaultValue strings only — comments may name the failure mode.
  const defaults = [...src.matchAll(/defaultValue:\s*['`]([^'`]+)['`]/g)].map((m) => m[1]);
  assert.ok(defaults.length >= 2, 'expected reentry default copy');
  for (const d of defaults) {
    for (const re of FORBIDDEN) {
      assert.doesNotMatch(d, re, `reentry copy: ${d}`);
    }
  }
  assert.ok(defaults.some((d) => /back|picking|good to see/i.test(d)));
});
