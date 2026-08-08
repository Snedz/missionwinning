import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_TRAIN_MANIFEST,
  assertModuleManifest,
  isModuleScope,
  parseModuleId,
} from './types';

test('parseModuleId accepts reverse-dns ids', () => {
  assert.equal(parseModuleId('health.train'), 'health.train');
  assert.equal(parseModuleId('game.racing.gt'), 'game.racing.gt');
  assert.equal(parseModuleId('Train'), null);
  assert.equal(parseModuleId('health'), null);
});

test('isModuleScope is closed', () => {
  assert.equal(isModuleScope('economy.earn'), true);
  assert.equal(isModuleScope('admin.wipe'), false);
});

test('HEALTH_TRAIN_MANIFEST is free-core and valid', () => {
  assert.equal(HEALTH_TRAIN_MANIFEST.freeCore, true);
  assert.doesNotThrow(() => assertModuleManifest(HEALTH_TRAIN_MANIFEST));
});

test('assertModuleManifest rejects bad entry', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...HEALTH_TRAIN_MANIFEST,
      entry: 'active',
    })
  );
});
