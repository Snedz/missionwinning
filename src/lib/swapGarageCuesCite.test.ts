/**
 * Swap garage cues are house leftover — house-lede, not text-muted.
 * Lead cite leftover stays. List / confirm / copy stay. Close stays outline.
 * Log set stays filled. After-set cites stay parked.
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

function sliceCues(list: string): string {
  const needle = '{ex.cues}</span>';
  const start = list.indexOf(needle);
  assert.ok(start >= 0, 'missing option-row cues');
  return list.slice(Math.max(0, start - 80), start + needle.length);
}

function sliceLead(list: string): string {
  const needle = 'activeSwapGarageLead';
  const start = list.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return list.slice(Math.max(0, start - 160), start + 80);
}

test('Swap garage cues are house leftover, not text-muted', () => {
  const list = read('src/components/workout/GarageSwapList.tsx');
  const cues = sliceCues(list);
  assert.match(cues, /house-lede/);
  assert.doesNotMatch(cues, /text-muted-foreground/);
  assert.match(list, /data-testid="garage-swap-list"/);
  assert.match(list, /className="mw-house space-y-3"/);
  assert.match(list, /house-btn house-btn-ghost house-swap-option/);
});

test('swap garage lead cite leftover stays (not this leftover)', () => {
  const list = read('src/components/workout/GarageSwapList.tsx');
  const cite = sliceLead(list);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('session-swap-confirm slice never house-btn-primary', () => {
  const confirm = sliceFromTestId(
    read('src/components/workout/SessionSwapSheet.tsx'),
    'session-swap-confirm'
  );
  assert.doesNotMatch(confirm, /house-btn-primary/);
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
  assert.match(vsLast, /house-lede/);
  assert.doesNotMatch(vsLast, /text-muted-foreground/);

  const header = read('src/components/workout/ActiveExerciseHeader.tsx');
  const e1rm = sliceFromTestId(header, 'session-e1rm');
  assert.match(e1rm, /house-lede/);
  assert.doesNotMatch(e1rm, /text-muted-foreground/);
});

test('Log set stays the sole filled press', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints swap garage cues with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house \.house-swap-option \.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Swap garage cues is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Swap garage cues is house leftover/);
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
