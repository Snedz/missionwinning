/**
 * ORCHESTRATION W1 is the Horizon W activation stream.
 * Cold Begin opens Train. The profile step is not the first-run wall.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const orch = readFileSync(path.join(root, 'ORCHESTRATION.md'), 'utf8');

test('W1 Activation opens the set from I-Day, with no profile wall', () => {
  const w1 = orch.split('\n').find((l) => l.includes('W1 Activation'));
  assert.ok(w1, 'ORCHESTRATION.md must have a W1 Activation row');
  assert.match(w1!, /`\/active`/);
  assert.match(w1!, /no profile wall/);
  assert.doesNotMatch(w1!, /I-Day → `\/log`/);
});
