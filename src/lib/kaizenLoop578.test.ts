import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Live HR and wind-down CTAs are 44px', () => {
  const hr = readFileSync(join(root, 'src/components/workout/LiveHeartRate.tsx'), 'utf8');
  assert.match(hr, /min-h-\[44px\] tap-target/);

  const wind = readFileSync(join(root, 'src/components/workout/WindDownOptIn.tsx'), 'utf8');
  assert.match(wind, /min-h-\[44px\] tap-target/);
});

test('Guided session complete/exit CTAs are 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/session/GuidedStepPlayer.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] tap-target/);
  assert.match(src, /asChild variant="onInk"/);
});

test('Active exercise footer Add Set is tap-target', () => {
  const src = readFileSync(
    join(root, 'src/components/workout/ActiveExerciseFooter.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\] tap-target/);
});
