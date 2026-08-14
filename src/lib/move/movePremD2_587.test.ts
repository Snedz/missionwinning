import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';
import { PREMIUM_MOVE_FLOW_COUNT } from '@/data/premiumInventory';

const root = join(import.meta.dirname, '..', '..', '..');

function countPremiumMoveIds(): number {
  const src = readFileSync(join(root, 'src/data/premiumMobilityFlows.ts'), 'utf8');
  return (src.match(/^\s*id:\s*['"]/gm) ?? []).length;
}

test('D2 move premium ids remain after later depth ships', () => {
  assert.ok(CONTENT_FLOORS.movePremium >= 48);
  assert.ok(PREMIUM_MOVE_FLOW_COUNT >= 48);
  assert.ok(countPremiumMoveIds() >= 48);
  assert.ok(getContentInventory().move.premium >= 48);
});

test('new premium move flows are present with long-form tags', () => {
  const src = readFileSync(join(root, 'src/data/premiumMobilityFlows.ts'), 'utf8');
  for (const id of [
    'post-legs-deep-flush-20',
    'overhead-athlete-shoulders-18',
    'desk-to-deadlift-bridge-15',
    'yoga-lite-hips-long-17',
    'ankle-foot-athlete-14',
    'travel-no-gear-power-15',
    'neck-tspine-desk-long-16',
    'hyrox-engine-opener-14',
  ]) {
    assert.match(src, new RegExp(`id: ['"]${id}['"]`), id);
  }
  assert.match(src, /durationMin: 20/);
  assert.match(src, /['"]long['"]/);
});
