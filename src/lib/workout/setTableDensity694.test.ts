/**
 * F-003 / MatrAIx — Active set-table density guards (.694).
 *
 * Source shape (not timing): sole filled Log set on the hero log path
 * (house leftover press under .mw-house), no filled accent chrome competing
 * with it, ≥44px taps, metric-first rows.
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
  const logSet = src.slice(
    src.indexOf('data-testid="log-console-log-set"'),
    src.indexOf('data-testid="log-console-log-set"') + 400
  );
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
  assert.doesNotMatch(logSet, /accent-poster/);
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
  // the set-table logger Experience: PREVIOUS is a clear set-row metric anchor.
  assert.match(code, /prevLabel/);
  assert.match(code, /set-row-prev/);
  assert.match(code, /data-prev-anchor/);
  assert.match(code, /activeColPrev/);
  assert.match(code, /set-row-vs-last/);
  assert.doesNotMatch(code, /activeSetInConsole/);
  assert.doesNotMatch(code, /In the console/);
  assert.doesNotMatch(code, /primary-action|accent-poster|bg-primary-fill/);
});

test('SetLogRow: completed ratings wrap on their own row — not shrink-0 on the nowrap metric line', () => {
  const src = workout('SetLogRow.tsx');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const rateIdx = code.indexOf('data-testid="set-row-rate"');
  assert.ok(rateIdx > 0, 'completed ratings must expose set-row-rate');
  const around = code.slice(Math.max(0, rateIdx - 180), rateIdx + 20);
  assert.match(around, /min-w-0 flex-wrap/, 'rate strip must be allowed to wrap inside 390px');
  assert.doesNotMatch(
    around,
    /shrink-0 flex-wrap/,
    'Easy/Med/Hard + RIR as shrink-0 is the 390 sideways scroll'
  );
});

test('ActiveExerciseCard mounts the table on every surface', () => {
  const src = workout('ActiveExerciseCard.tsx');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.match(code, /<SetLogTable/);
  assert.doesNotMatch(code, /<SetLogRow/);
  assert.doesNotMatch(code, /isCompact\s*\?\s*\(/);
});

test('SetLogTable: Prev column anchored; one house leftover Log set; 44px inputs', () => {
  const src = workout('SetLogTable.tsx');
  const primaries = src.match(/primary-action/g) || [];
  assert.equal(primaries.length, 1, 'exactly one primary-action (inline Log set)');
  assert.match(src, /set-table-log-set/);
  const logSet = src.slice(
    src.indexOf('data-testid="set-table-log-set"'),
    src.indexOf('data-testid="set-table-log-set"') + 360
  );
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
  assert.doesNotMatch(logSet, /accent-poster/);
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /set-table-logged-check/);
  assert.match(src, /house-set-done-mark|border-s-primary|border-s-\[3px\]/);
  assert.match(src, /set-table-prev/);
  assert.match(src, /data-prev-anchor/);
  assert.match(src, /set-table-rate/);
  assert.match(src, /set-table-vs-last/);
  assert.match(src, /table-fixed/);
  assert.match(src, /overflow-x-hidden/);
  assert.match(src, /colSpan=\{5\}/);
  assert.doesNotMatch(src, /hover:bg-accent-100/);
});

test('RestTimerBar: ambient running rest + Skip 44px; no poster-red', () => {
  const src = workout('RestTimerBar.tsx');
  assert.match(src, /data-testid="rest-skip"/);
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /finalSeconds/);
  assert.match(src, /house-rest-fill/);
  assert.doesNotMatch(src, /bg-accent-400/);
  // Ambient running chrome — ticking clock + depleting fill while remaining > 0.
  assert.match(src, /data-rest-running/);
  assert.match(src, /data-rest-remaining/);
  assert.match(src, /data-testid="rest-clock"/);
  assert.match(src, /rest-ambient-fill/);
  assert.match(src, /aria-atomic/);
  assert.doesNotMatch(src, /primary-action/);
  assert.doesNotMatch(src, /accent-poster/);
});

test('LastSetGhostButton: house leftover one-tap; never poster-red', () => {
  const src = workout('LastSetGhostButton.tsx');
  assert.match(src, /data-testid="last-set-ghost"/);
  assert.match(src, /house-btn house-btn-ghost house-last-ghost/);
  assert.match(src, /min-h-\[44px\]/);
  assert.match(src, /tap-target/);
  assert.doesNotMatch(src, /border-2/);
  assert.doesNotMatch(src, /hover:bg-muted/);
  assert.doesNotMatch(src, /primary-action/);
  assert.doesNotMatch(src, /accent-poster/);
  assert.doesNotMatch(src, /house-btn-primary/);
});

test('LogConsole and SetLogTable mount the last-set ghost', () => {
  assert.match(workout('LogConsole.tsx'), /LastSetGhostButton/);
  assert.match(workout('SetLogTable.tsx'), /LastSetGhostButton/);
  assert.match(workout('ActiveExerciseCard.tsx'), /resolveLastSetGhost/);
});

test('ActiveExerciseCard wires prevLabels and vs-last into the set table', () => {
  const src = workout('ActiveExerciseCard.tsx');
  assert.match(src, /formatPrevSetLabels/);
  assert.match(src, /prevLabels=\{prevLabels\}/);
  assert.match(src, /formatVsLastSetDeltas/);
  assert.match(src, /vsLastLabels=\{vsLastLabels\}/);
});

test('SetLogTable paints a skippable after-complete cite; Log set stays the only red', () => {
  const table = workout('SetLogTable.tsx');
  const cite = workout('SetLogNextCite.tsx');
  const card = workout('ActiveExerciseCard.tsx');
  assert.match(card, /resolveAfterCompleteCite/);
  assert.match(card, /afterCompleteCites=\{afterCompleteCites\}/);
  assert.match(table, /SetLogNextCite/);
  assert.match(cite, /set-table-next-cite/);
  assert.match(cite, /set-table-next-cite-skip/);
  assert.match(cite, /min-h-\[44px\]/);
  assert.doesNotMatch(cite, /primary-action/);
  assert.doesNotMatch(cite, /accent-poster/);
  const citeCode = cite.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const tableCode = table.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(citeCode, /E-Adjacency/);
  assert.doesNotMatch(tableCode, /E-Adjacency/);
});
