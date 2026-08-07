import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';

test('D2 move free floor is 32 and inventory meets it', () => {
  assert.equal(CONTENT_FLOORS.moveFree, 32);
  assert.equal(MOBILITY_FLOWS.length, 32);
  assert.ok(getContentInventory().move.free >= 32);
});

test('new D2 move flows have unique ids and tags', () => {
  const ids = MOBILITY_FLOWS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  const d2 = [
    'hotel-hip-open-10',
    'desk-tspine-8',
    'post-squat-flush-12',
    'ankle-rock-primer-6',
    'shoulder-cars-flow-7',
    'yoga-lite-sun-a-9',
    'long-hamstring-18',
    'neck-reset-desk-5',
  ];
  for (const id of d2) {
    const f = MOBILITY_FLOWS.find((x) => x.id === id);
    assert.ok(f, id);
    assert.ok((f!.tags?.length ?? 0) >= 2, id);
    assert.ok(f!.steps.length >= 5, id);
    assert.ok(f!.durationMin >= 5, id);
  }
  assert.ok(MOBILITY_FLOWS.some((f) => f.tags?.includes('long') && f.durationMin >= 15));
});
