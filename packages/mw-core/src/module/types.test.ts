import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_TRAIN_MANIFEST,
  SOCIAL_SERVER_MANIFEST,
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
  assert.equal(isModuleScope('social.channel.write'), true);
  assert.equal(isModuleScope('admin.wipe'), false);
});

test('HEALTH_TRAIN_MANIFEST is free-core and valid', () => {
  assert.equal(HEALTH_TRAIN_MANIFEST.freeCore, true);
  assert.doesNotThrow(() => assertModuleManifest(HEALTH_TRAIN_MANIFEST));
});

test('SOCIAL_SERVER_MANIFEST is free-core garage text rooms', () => {
  assert.equal(SOCIAL_SERVER_MANIFEST.id, 'social.server');
  assert.equal(SOCIAL_SERVER_MANIFEST.freeCore, true);
  assert.equal(SOCIAL_SERVER_MANIFEST.entry, '/server');
  assert.ok(SOCIAL_SERVER_MANIFEST.scopes.includes('social.channel.write'));
  assert.deepEqual([...SOCIAL_SERVER_MANIFEST.surfaces], ['web']);
  assert.doesNotThrow(() => assertModuleManifest(SOCIAL_SERVER_MANIFEST));
});

test('assertModuleManifest rejects bad entry', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...HEALTH_TRAIN_MANIFEST,
      entry: 'active',
    })
  );
});
