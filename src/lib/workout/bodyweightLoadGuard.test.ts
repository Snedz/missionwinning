/**
 * .735 bodyweight + load — free logger, skip (0) always works, no premium.
 *
 * Discovers the logger files that paint the set row rather than listing them
 * once in a comment. A missing plus-load branch, or a tap-to-replace that
 * steals BW on dips, is the defect.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const WORKOUT_UI = path.join(root, 'src/components/workout');

function workoutUiFiles(): string[] {
  return readdirSync(WORKOUT_UI)
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => `src/components/workout/${f}`);
}

const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;

test('plus-load logger files never import premium or trial', () => {
  const files = [
    'src/lib/workout/bodyweightLoad.ts',
    'src/lib/workout/activeWorkoutHelpers.ts',
    'src/page-components/ActiveWorkoutPage.tsx',
    ...workoutUiFiles(),
  ];
  const hits = files.filter((f) => PREMIUM.test(read(f)));
  assert.deepEqual(hits, [], `premium/trial import on the free logger: ${hits.join(', ')}`);
});

test('LogConsole plus-load keeps the stepper at 0 — skip is leave load at 0', () => {
  const src = read('src/components/workout/LogConsole.tsx');
  const plusIdx = src.indexOf('plusLoad ?');
  const tapIdx = src.indexOf('activeSetBodyweightAddLoad');
  assert.ok(plusIdx >= 0, 'LogConsole must branch on plusLoad');
  assert.ok(tapIdx > plusIdx, 'tap-to-replace BW must stay the non-plusLoad path');
  assert.match(src, /data-testid="log-console-plus-load"/);
  assert.match(src, /data-testid="log-console-bw-chip"/);
  const plusOpen = src.indexOf('data-testid="log-console-plus-load"');
  const plusClose = src.indexOf(') : weight <= 0');
  assert.ok(plusOpen >= 0 && plusClose > plusOpen, 'plus-load branch must precede the BW tap');
  const plusBlock = src.slice(plusOpen, plusClose);
  assert.match(plusBlock, /Math\.max\(0,\s*weight - weightStep\)/);
  assert.doesNotMatch(plusBlock, /onWeightChange\(weightStep/);
});

test('formatters share formatSetLoadLine — no second private copy', () => {
  const helpers = read('src/lib/workout/activeWorkoutHelpers.ts');
  const cue = read('src/lib/workout/progressiveOverloadCue.ts');
  assert.match(helpers, /formatSetLoadLine\(/);
  assert.match(cue, /formatSetLoadLine\(/);
  assert.match(read('src/components/workout/SetLogRow.tsx'), /plusLoad/);
  assert.match(read('src/components/workout/SetLogTable.tsx'), /plusLoad/);
  assert.match(read('src/components/workout/ActiveSessionDock.tsx'), /consoleSet\.plusLoad/);
  assert.match(read('src/page-components/ActiveWorkoutPage.tsx'), /resolvePlusLoad/);
});
