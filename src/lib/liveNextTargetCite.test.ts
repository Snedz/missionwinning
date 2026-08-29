/**
 * Live-row next-target cite is house leftover — house-lede, not text-muted.
 * Skipped leftover stays. After-set next-cite / e1RM / vs-last / load-% stay parked.
 * Log set stays filled. Finish / Skip / Swap / Form guide stay outline.
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

function sliceNextTarget(header: string): string {
  const needle = '{nextTarget && (';
  const start = header.indexOf(needle);
  assert.ok(start >= 0, 'missing live-row next-target cite');
  return header.slice(start, start + 220);
}

function sliceSkipped(header: string): string {
  const needle = 'data-testid="session-skipped-exercise"';
  const start = header.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return header.slice(Math.max(0, start - 180), start + 80);
}

test('Live-row next-target cite is house leftover, not text-muted', () => {
  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const cite = sliceNextTarget(header);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.match(header, /house-exercise-head/);
});

test('skipped-this-session leftover stays (not this leftover)', () => {
  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const cite = sliceSkipped(header);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('after-set next-cite / e1RM / vs-last stay parked (not this leftover)', () => {
  const next = read('src/components/workout/SetLogNextCite.tsx');
  const nextNeedle = 'data-testid="set-table-next-cite-line"';
  const nextStart = next.indexOf(nextNeedle);
  assert.ok(nextStart >= 0, `missing ${nextNeedle}`);
  const nextLine = next.slice(Math.max(0, nextStart - 180), nextStart + 40);
  assert.match(nextLine, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /house-lede/);
  assert.doesNotMatch(e1rm, /text-muted-foreground/);

  const table = read('src/components/workout/SetLogTable.tsx');
  const vsNeedle = 'data-testid="set-table-vs-last"';
  const vsStart = table.indexOf(vsNeedle);
  assert.ok(vsStart >= 0, `missing ${vsNeedle}`);
  const vsLast = table.slice(Math.max(0, vsStart - 180), vsStart + 40);
  assert.match(vsLast, /text-muted-foreground/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints live-row next-target cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-next-target\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Live-row next-target cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Live-row next-target cite is house leftover/);
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
