/**
 * Skipped-this-session cite is house leftover — house-lede, not text-muted.
 * vs-last / e1RM / load-% stay parked. Live-row next-target leftover ships separately. Skip hold stays outline.
 * Copy stays. Log set stays filled.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function sliceFromTestId(src: string, testId: string, chars = 360): string {
  const needle = `data-testid="${testId}"`;
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(start, start + chars);
}

function sliceSkippedCite(header: string): string {
  const needle = 'data-testid="session-skipped-exercise"';
  const start = header.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return header.slice(Math.max(0, start - 180), start + 80);
}

test('Skipped-this-session cite is house leftover, not text-muted', () => {
  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const cite = sliceSkippedCite(header);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(header, /activeSkippedThisSession/);
  assert.match(header, /house-exercise-head/);
});

test('after-set cites stay parked (not this leftover)', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const nextNeedle = 'data-testid="set-table-next-cite-line"';
  const nextStart = next.indexOf(nextNeedle);
  assert.ok(nextStart >= 0, `missing ${nextNeedle}`);
  const nextLine = next.slice(Math.max(0, nextStart - 180), nextStart + 40);
  assert.match(nextLine, /house-lede/);
  assert.doesNotMatch(nextLine, /text-muted-foreground/);

  const table = read('src/components/workout/SetLogTable.tsx');
  const vsNeedle = 'data-testid="set-table-vs-last"';
  const vsStart = table.indexOf(vsNeedle);
  assert.ok(vsStart >= 0, `missing ${vsNeedle}`);
  const vsLast = table.slice(Math.max(0, vsStart - 180), vsStart + 40);
  assert.match(vsLast, /house-lede/);
  assert.doesNotMatch(vsLast, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /house-lede/);
  assert.doesNotMatch(e1rm, /text-muted-foreground/);

  const targetNeedle = 'activeNextTargetLine';
  const targetStart = header.indexOf(targetNeedle);
  assert.ok(targetStart >= 0, `missing ${targetNeedle}`);
  const nextTarget = header.slice(Math.max(0, targetStart - 160), targetStart + 40);
  assert.match(nextTarget, /house-lede/);
  assert.doesNotMatch(nextTarget, /text-muted-foreground/);

  const pctNeedle = 'data-testid="set-table-load-pct-cite"';
  const pctStart = table.indexOf(pctNeedle);
  assert.ok(pctStart >= 0, `missing ${pctNeedle}`);
  const loadPct = table.slice(Math.max(0, pctStart - 180), pctStart + 40);
  assert.match(loadPct, /text-muted-foreground/);
});

test('Skip this exercise stays outline, never house-btn-primary', () => {
  const skip = sliceFromTestId(
    read('src/components/workout/ActiveExerciseHeader.tsx'),
    'active-skip-exercise'
  );
  assert.doesNotMatch(skip, /house-btn-primary/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints skipped-this-session cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-exercise-head \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Skipped-this-session cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Skipped-this-session cite is house leftover/);
});

test('Finish / Skip / Swap / Form guide / Repeat last never house-btn-primary', () => {
  const finish = sliceFromTestId(
    read('src/components/workout/ActiveSessionChrome.tsx'),
    'active-finish'
  );
  assert.doesNotMatch(finish, /house-btn-primary/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  for (const id of [
    'active-skip-exercise',
    'active-swap-exercise',
    'active-form-guide',
    'active-repeat-last',
  ] as const) {
    const slice = sliceFromTestId(header, id);
    assert.doesNotMatch(slice, /house-btn-primary/, id);
  }
});
