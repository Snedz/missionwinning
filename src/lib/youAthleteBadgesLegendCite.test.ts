/**
 * You athlete card badges legend cite is house leftover — house cite, not text-muted.
 * Badge buttons stay. Preview cite stays later.
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

test('You athlete card badges legend cite is house leftover, not text-muted', () => {
  const card = read('src/components/profile/ProfileAthleteCard.tsx');
  const needle = 'data-testid="athlete-card-badges-legend"';
  const start = card.indexOf(needle);
  assert.ok(start >= 0, `missing ${needle}`);
  const cite = card.slice(start - 160, start + 80);
  assert.match(cite, /house-athlete-badges-legend/);
  assert.doesNotMatch(cite, /text-muted-foreground/);
  assert.doesNotMatch(cite, /house-btn-primary/);
});

test('house leftover rule paints athlete badges legend cite with --house-muted', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-profile \.house-athlete-badges-legend \{[^}]*--house-muted/
  );
});

test('DESIGN names You athlete card badges legend cite is house leftover', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /You athlete card badges legend cite is house leftover/);
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
