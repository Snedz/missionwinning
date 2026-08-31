import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('WorkoutVictorySheet does not mount leftover secondary Super Bundle links', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'workout', 'WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /VictorySecondaryLinks/);
  assert.doesNotMatch(src, /buildVictorySecondaryLinks/);
});

test('mw-core victory never routes fuel to Bundle', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', '..', 'packages', 'mw-core', 'src', 'workout', 'victory.ts'),
    'utf8'
  );
  assert.match(src, /\/nutrition/);
  assert.ok(!/href: '\/bundle'/.test(src));
});
