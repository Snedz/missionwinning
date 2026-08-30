/**
 * Victory receipt table heads is house leftover — house-lede, not text-muted.
 * Receipt lead leftover stays. Description is house leftover. Feel / share stay muted.
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

test('Victory receipt table heads is house leftover, not text-muted', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const start = receipt.indexOf('const headCell');
  assert.ok(start >= 0, 'missing headCell');
  const head = receipt.slice(start, start + 180);
  assert.match(head, /house-lede house-victory-receipt-head/);
  assert.doesNotMatch(head, /text-muted-foreground/);
  assert.doesNotMatch(head, /uppercase/);
});

test('receipt lead leftover stays (not this leftover)', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const start = receipt.lastIndexOf('victoryReceiptLabel');
  assert.ok(start >= 0, 'missing victoryReceiptLabel');
  const lead = receipt.slice(Math.max(0, start - 180), start + 40);
  assert.match(lead, /house-lede house-victory-receipt-lead/);
  assert.doesNotMatch(lead, /text-muted-foreground/);
});

test('Prev leftover ships separately (house-lede, not muted)', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const prev = sliceAround(receipt, 'data-testid="victory-prev"');
  assert.match(prev, /house-lede/);
  assert.doesNotMatch(prev, /text-muted-foreground/);

  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const desc = sliceAround(sheet, 'house-victory-desc');
  assert.match(desc, /house-lede/);
  assert.doesNotMatch(desc, /text-muted-foreground/);
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

test('house leftover rule paints Victory receipt heads with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-victory-receipt \.house-victory-receipt-head\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Victory receipt heads is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Victory receipt heads is house leftover/);
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
