import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('CoachToday generate buttons are valid 44px handlers', () => {
  const src = readFileSync(
    join(root, 'src/components/coach/CoachTodayCard.tsx'),
    'utf8'
  );
  assert.match(src, /onClick=\{\(\) => generate\(\)\}/);
  assert.doesNotMatch(src, /onClick=\{\(\) = className/);
  assert.match(src, /min-h-\[44px\] tap-target/);
});

test('Coach schedule day chips are single className 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/coach/CoachScheduleEditor.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /className="[^"]*"\s+className=/);
  assert.match(src, /min-h-\[44px\].*tap-target|tap-target.*min-h-\[44px\]/);
});

test('Track body metrics Log opens sheet with 44px button', () => {
  const src = readFileSync(
    join(root, 'src/components/track/BodyMetricsCard.tsx'),
    'utf8'
  );
  assert.match(src, /onClick=\{\(\) => setOpen\(true\)\}/);
  assert.match(src, /min-h-\[44px\] tap-target/);
});

test('First steps / library / form guide sheets have 44px size=sm', () => {
  for (const rel of [
    'src/components/journey/FirstStepsCard.tsx',
    'src/components/library/LibraryDetailSheet.tsx',
    'src/components/form/FormGuideSheet.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /min-h-\[44px\]/, rel);
  }
});
