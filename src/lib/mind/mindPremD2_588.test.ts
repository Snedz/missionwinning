import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';
import { PREMIUM_MIND_SESSION_COUNT } from '@/data/premiumInventory';

const root = join(import.meta.dirname, '..', '..', '..');

function countPremiumMindIds(): number {
  const src = readFileSync(join(root, 'src/data/premiumMindSessions.ts'), 'utf8');
  return (src.match(/^\s*id:\s*'/gm) ?? []).length;
}

test('D2 mind premium floor is 60 and constants match file', () => {
  assert.equal(CONTENT_FLOORS.mindPremium, 60);
  assert.equal(PREMIUM_MIND_SESSION_COUNT, 60);
  assert.equal(countPremiumMindIds(), 60);
  assert.equal(getContentInventory().mind.premium, 60);
});

test('sleep-week series seed sessions exist', () => {
  const src = readFileSync(join(root, 'src/data/premiumMindSessions.ts'), 'utf8');
  for (const id of [
    'sleep-week-night-1',
    'sleep-week-night-2',
    'sleep-week-night-3',
    'sleep-week-night-4',
    'sleep-week-night-5',
    'sleep-week-night-6',
    'sleep-week-night-7',
  ]) {
    assert.match(src, new RegExp(`id: '${id}'`));
  }
  assert.match(src, /series-sleep-week/);
});
