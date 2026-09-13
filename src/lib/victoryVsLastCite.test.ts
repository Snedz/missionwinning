/**
 * Victory vs-last cite is house leftover — house-lede, not text-muted.
 * Stats strip carries mw-house house-victory. Stats labels / receipt stay muted.
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

test('Victory vs-last cite is house leftover, not text-muted', () => {
  const stats = read('src/components/workout/VictoryStatsStrip.tsx');
  const needle = 'data-testid="victory-vs-last"';
  const start = stats.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = stats.slice(Math.max(0, start - 180), start + 40);
  assert.match(cite, /house-lede/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
});

test('Victory stats strip carries mw-house house-victory', () => {
  const stats = read('src/components/workout/VictoryStatsStrip.tsx');
  assert.match(stats, /mw-house house-victory/);
});

test('stats labels leftover ships separately (house-lede, not muted)', () => {
  const stats = read('src/components/workout/VictoryStatsStrip.tsx');
  for (const key of ['victoryDuration', 'victoryVolume', 'victorySets'] as const) {
    const start = stats.indexOf(key);
    assert.ok(start >= 0, `missing ${key}`);
    const slice = stats.slice(Math.max(0, start - 180), start + 40);
    assert.match(slice, /house-lede/, key);
    assert.doesNotMatch(slice, /text-muted-foreground/, key);
  }

  const receipt = read('src/components/workout/VictoryReceiptStrip.tsx');
  assert.match(receipt, /text-muted-foreground/);
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

test('house leftover rule paints Victory vs-last cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-muted/);
  assert.match(css, /\.house-lede \{[^}]*--house-muted/);
  assert.match(
    css,
    /\.mw-house\.house-victory \.house-victory-vs-last\.house-lede \{[^}]*--house-muted/
  );
});

test('DESIGN names Victory vs-last cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /Victory vs-last cite is house leftover/);
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
