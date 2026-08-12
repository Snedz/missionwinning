/**
 * F-003 / MatrAIx — Active set-table density guards (.694).
 *
 * Source shape (not timing): sole poster-red Log set on the hero log path,
 * no filled accent chrome competing with it, ≥44px taps, metric-first rows.
 * Do not claim faster-than-Strong — this only pins chrome discipline.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');
const workout = (...parts: string[]) =>
  readFileSync(join(root, 'src/components/workout', ...parts), 'utf8');

test('LogConsole: sole primary-action Log set; kind/Use-next never accent-fill', () => {
  const src = workout('LogConsole.tsx');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(primaries.length, 1, 'exactly one primary-action (Log set)');
  assert.match(src, /log-console-log-set/);
  assert.match(src, /accent-poster/);
  assert.match(src, /min-h-\[52px\]/);
  assert.match(src, /h-\[52px\]/);
  // Selected kind / Use next stay ink — filled accent competed with Log set.
  assert.doesNotMatch(src, /bg-accent-400/);
  assert.doesNotMatch(src, /border-accent-400 px-3 text-start/);
  assert.match(src, /border-neutral-100 bg-neutral-100/);
  assert.match(src, /tap-target/);
});

test('SetLogRow: PREVIOUS row anchor + metric-first density; 44px taps', () => {
  const src = workout('SetLogRow.tsx');
  // Strip block/line comments so doc mentions of the retired prose don't trip the guard.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.match(code, /formatLoggedSetLine/);
  assert.match(code, /min-h-\[44px\]/);
  assert.match(code, /data-set-complete/);
  assert.match(code, /set-logged-check/);
  // Hevy Experience: PREVIOUS is a clear set-row metric anchor.
  assert.match(code, /prevLabel/);
  assert.match(code, /set-row-prev/);
  assert.match(code, /data-prev-anchor/);
  assert.match(code, /activeColPrev/);
  assert.doesNotMatch(code, /activeSetInConsole/);
  assert.doesNotMatch(code, /In the console/);
  assert.doesNotMatch(code, /primary-action|accent-poster|bg-primary-fill/);
});

test('SetLogTable: Prev column anchored; one poster-red Log set; 44px inputs', () => {
  const src = workout('SetLogTable.tsx');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(primaries.length, 1, 'exactly one primary-action (inline Log set)');
  assert.match(src, /set-table-log-set/);
  assert.match(src, /accent-poster/);
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /set-table-logged-check/);
  assert.match(src, /border-s-primary|border-s-\[3px\]/);
  assert.match(src, /set-table-prev/);
  assert.match(src, /data-prev-anchor/);
  assert.doesNotMatch(src, /hover:bg-accent-100/);
});

test('RestTimerBar: ambient running rest + Skip 44px; no poster-red', () => {
  const src = workout('RestTimerBar.tsx');
  assert.match(src, /data-testid="rest-skip"/);
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /finalSeconds &&/);
  assert.match(src, /bg-accent-400/);
  // Ambient running chrome — ticking clock + depleting fill while remaining > 0.
  assert.match(src, /data-rest-running/);
  assert.match(src, /data-rest-remaining/);
  assert.match(src, /data-testid="rest-clock"/);
  assert.match(src, /rest-ambient-fill/);
  assert.match(src, /aria-atomic/);
  assert.doesNotMatch(src, /primary-action/);
  assert.doesNotMatch(src, /accent-poster/);
});

test('ActiveExerciseCard wires prevLabels into compact SetLogRow', () => {
  const src = workout('ActiveExerciseCard.tsx');
  assert.match(src, /formatPrevSetLabels/);
  assert.match(src, /prevLabel=\{prevLabels\[setIdx\]\}/);
  assert.match(src, /prevLabels=\{prevLabels\}/);
});
