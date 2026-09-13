/**
 * Victory description is house leftover — house-lede, not text-muted.
 * DialogContent is not mw-house. Receipt leftovers stay. Feel / share stay muted.
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

test('Victory description is house leftover, not text-muted', () => {
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  // house-victory-desc is unique on DialogDescription. historySessionLabel
  // hits the import first and the className never lands in a ±180 slice.
  const desc = sliceAround(sheet, 'house-victory-desc');
  assert.match(desc, /house-lede/);
  assert.match(desc, /house-victory-desc/);
  assert.doesNotMatch(desc, /text-muted-foreground/);
});

test('Victory dialog is not mw-house', () => {
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const dialog = sliceAround(sheet, 'victory-lock');
  assert.doesNotMatch(dialog, /mw-house/);
});

test('receipt set-index leftover stays (not this leftover)', () => {
  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  const idx = sliceAround(receipt, '{set.setIndex + 1}');
  assert.match(idx, /house-lede house-victory-receipt-set/);
  assert.doesNotMatch(idx, /text-muted-foreground/);
});

test('feel / share stay parked (not this leftover)', () => {
  const feel = read('src/components/workout/VictoryFeelStrip.tsx');
  assert.match(feel, /text-muted-foreground/);
  const share = read('src/components/workout/VictorySecondaryLinks.tsx');
  assert.match(share, /text-muted-foreground/);
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

test('house leftover rule paints Victory description with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-victory-desc\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Victory description is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Victory description is house leftover/);
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
