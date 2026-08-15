/**
 * S1 — Visibility report names Alpha mute-pay, not leftover free-first beta.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const src = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'src/lib/transparency/report.ts'),
  'utf8',
);

test('visibility report does not say free-first beta', () => {
  assert.doesNotMatch(src, /free-first beta/i);
  assert.doesNotMatch(src, /Open-beta/i);
  assert.match(src, /Alpha mute-pay/);
  assert.match(src, /logger stays free/i);
});
