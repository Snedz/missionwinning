import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

/**
 * Peak-End is one job. GNT-1 U1/U5 stills showed Session locked stacked on
 * "No session running" because completeActiveWorkout clears the session
 * before the sheet opens, and ActiveEmptyState kept painting the invite.
 */
test('Victory-open empty Active mounts the sheet only — no no-session invite', () => {
  const src = read('src/components/workout/ActiveEmptyState.tsx');
  const fn = src.slice(src.indexOf('export function ActiveEmptyState'));
  const gate = fn.indexOf('if (victoryOpen)');
  const empty = fn.indexOf('<EmptyState');
  const dock = fn.indexOf('<ScreenDock');
  assert.ok(gate >= 0, 'victoryOpen must short-circuit the empty shell');
  assert.ok(empty >= 0 && dock >= 0, 'invite + dock still exist for dismiss');
  assert.ok(gate < empty, 'EmptyState must not render before the victory gate');
  const branch = fn.slice(gate, empty);
  assert.match(branch, /return \(/);
  assert.match(branch, /WorkoutVictorySheet/);
  assert.doesNotMatch(branch, /<EmptyState/);
  assert.doesNotMatch(branch, /<ScreenDock/);
  assert.doesNotMatch(branch, /activeNoWorkout/);
});

test('Victory close is a 44px thumb target on the sheet, not an 18px X', () => {
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const line = sheet.split('\n').find((l) => l.includes('<DialogContent'));
  assert.ok(line, 'Victory must mount DialogContent');
  assert.match(line, /\[&>button\]:min-h-\[44px\]/);
  assert.match(line, /\[&>button\]:min-w-\[44px\]/);
});
