/**
 * ORCHESTRATION W1 is the Horizon W activation stream.
 * After `.839` cold I-Day lands Today (`/log`), not an Active dump.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const orch = readFileSync(path.join(root, 'ORCHESTRATION.md'), 'utf8');

test('W1 Activation lands I-Day on Today, not Active', () => {
  const w1 = orch.split('\n').find((l) => l.includes('W1 Activation'));
  assert.ok(w1, 'ORCHESTRATION.md must have a W1 Activation row');
  assert.match(w1!, /`\/log`/);
  assert.doesNotMatch(w1!, /I-Day → `\/active`/);
});
