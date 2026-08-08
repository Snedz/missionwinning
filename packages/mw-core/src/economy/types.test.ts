import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isEconomyEventKind, type InventoryItem } from './types';

test('isEconomyEventKind accepts known kinds only', () => {
  assert.equal(isEconomyEventKind('workout_finish'), true);
  assert.equal(isEconomyEventKind('game_participation'), true);
  assert.equal(isEconomyEventKind('open_app'), false);
  assert.equal(isEconomyEventKind(''), false);
});

test('InventoryItem is a plain data bag (no grant authority)', () => {
  const item: InventoryItem = {
    itemId: 'frame:hairline',
    source: 'economy.rewards',
    earnedAt: '2026-08-08T00:00:00.000Z',
    module: 'id.profile',
  };
  assert.equal(item.itemId.startsWith('frame:'), true);
});
