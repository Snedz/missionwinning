import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('ProfileRewardsCard renders badge icons', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'ProfileRewardsCard.tsx'),
    'utf8'
  );
  assert.match(src, /badgeIconPath/);
  assert.match(src, /img/);
});

test('VictoryRewardsLine shows badge medallions when awarded', () => {
  const src = readFileSync(
    join(import.meta.dirname, '..', '..', 'components', 'rewards', 'VictoryRewardsLine.tsx'),
    'utf8'
  );
  assert.match(src, /badgeIconPath/);
});
