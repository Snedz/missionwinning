import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Today progress links drop arrow flourish', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.doesNotMatch(src, /→/);
  assert.match(src, /Open builder|View full history|See full in Fuel/);
});

test('chrome hover is muted; auth chip 44px', () => {
  const header = readFileSync(join(root, 'src/components/layout/AppHeader.tsx'), 'utf8');
  assert.match(header, /hover:bg-muted/);
  assert.doesNotMatch(header, /hover:bg-accent-100/);

  const side = readFileSync(join(root, 'src/components/layout/Sidebar.tsx'), 'utf8');
  assert.match(side, /hover:bg-muted/);

  const chip = readFileSync(join(root, 'src/components/layout/HeaderAuthChip.tsx'), 'utf8');
  assert.match(chip, /min-h-\[44px\]/);
});

test('Today week recap and freshness use muted not accent wash', () => {
  const recap = readFileSync(
    join(root, 'src/components/today/TodayWeekRecapCard.tsx'),
    'utf8'
  );
  assert.match(recap, /bg-muted/);
  assert.doesNotMatch(recap, /bg-accent-100/);

  const fresh = readFileSync(
    join(root, 'src/components/today/MuscleFreshnessStrip.tsx'),
    'utf8'
  );
  assert.match(fresh, /bg-muted/);
});
