/**
 * Victory receipt vs-last cells is house leftover — house-lede, not text-muted.
 * Receipt Prev leftover stays. Set index / description stay muted.
 * Next stays filled on Victory. Log set stays filled on compose.
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

function sliceAround(src: string, needle: string): string {
  const start = src.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  return src.slice(Math.max(0, start - 180), start + 40);
}

test('Victory receipt vs-last cells is house leftover, not text-muted', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const empty = sliceAround(receipt, '>—</span>');
  assert.match(empty, /house-lede house-victory-receipt-delta/);
  assert.doesNotMatch(empty, /text-muted-foreground/);

  const value = sliceAround(receipt, 'parts.join');
  assert.match(value, /house-lede house-victory-receipt-delta/);
  assert.doesNotMatch(value, /text-muted-foreground/);
});

test('receipt Prev leftover stays (not this leftover)', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const prev = sliceAround(receipt, 'data-testid="victory-prev"');
  assert.match(prev, /house-lede house-victory-receipt-prev/);
  assert.doesNotMatch(prev, /text-muted-foreground/);
});

test('set index / description stay parked (not this leftover)', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const idx = sliceAround(receipt, '{set.setIndex + 1}');
  assert.match(idx, /text-muted-foreground/);

  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  assert.ok(
    sheet.includes('text-sm leading-relaxed text-muted-foreground'),
    'missing Victory description muted'
  );
});

test('Next stays the filled press on Victory', () => {
  const next = read('src/components/workout/VictoryNextActionStrip.tsx');
  assert.match(next, /primary-action/);
});

test('Log set stays the sole filled press on compose', () => {
  const table = read('src/components/workout/SetLogTable.tsx');
  const logSet = sliceFromTestId(table, 'set-table-log-set');
  assert.match(logSet, /house-btn house-btn-primary house-set-log/);
});

test('house leftover rule paints Victory receipt vs-last cells with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-victory-receipt \.house-victory-receipt-delta\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Victory receipt vs-last cells is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Victory receipt vs-last cells is house leftover/);
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
