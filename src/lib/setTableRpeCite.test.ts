/**
 * Set-table RPE cite is house leftover — house-lede, not text-muted.
 * vs-last / e1RM / next-target / load-% stay parked. in-set PR stays muted.
 * Chips / RPE10 stay. Log set stays filled.
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

function sliceRpeCite(table: string): string {
  const needle = 'rpeLabelKey(set.rpe)';
  const start = table.indexOf(needle);
  assert.ok(start >= 0, 'missing completed-set RPE cite');
  return table.slice(Math.max(0, start - 120), start + needle.length);
}

function sliceInSetPr(table: string): string {
  const needle = 'data-testid="set-table-in-set-pr"';
  const start = table.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return table.slice(Math.max(0, start - 180), start + 40);
}

test('Set-table RPE cite is house leftover, not text-muted', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const cite = sliceRpeCite(table);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(table, /data-testid="set-table-rate"/);
  assert.match(table, /house-set-rate/);
});

test('after-set cites stay parked (not this leftover)', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const nextNeedle = 'data-testid="set-table-next-cite-line"';
  const nextStart = next.indexOf(nextNeedle);
  assert.ok(nextStart >= 0, `missing ${nextNeedle}`);
  const nextLine = next.slice(Math.max(0, nextStart - 180), nextStart + 40);
  assert.match(nextLine, /text-muted-foreground/);

  const table = read('src/components/workout/SetLogTable.tsx');
  const vsNeedle = 'data-testid="set-table-vs-last"';
  const vsStart = table.indexOf(vsNeedle);
  assert.ok(vsStart >= 0, `missing ${vsNeedle}`);
  const vsLast = table.slice(Math.max(0, vsStart - 180), vsStart + 40);
  assert.match(vsLast, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /text-muted-foreground/);

  const pctNeedle = 'data-testid="set-table-load-pct-cite"';
  const pctStart = table.indexOf(pctNeedle);
  assert.ok(pctStart >= 0, `missing ${pctNeedle}`);
  const loadPct = table.slice(Math.max(0, pctStart - 180), pctStart + 40);
  assert.match(loadPct, /text-muted-foreground/);
});

test('in-set PR cite stays muted (not this leftover)', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const pr = sliceInSetPr(table);
  assert.match(pr, /text-muted-foreground/);
  assert.doesNotMatch(pr, /house-lede/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints set-table RPE cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-set-rate \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Set-table RPE cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Set-table RPE cite is house leftover/);
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
