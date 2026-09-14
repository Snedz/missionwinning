import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HEALTH_TRAIN_MANIFEST,
  HOST_SHELL,
  HOST_SHELL_ID,
  SOCIAL_SERVER_MANIFEST,
  UTILITY_CLEARSHOT_MANIFEST,
  assertModuleManifest,
  isModuleScope,
  miniSlugFromId,
  parseMissionMiniEntry,
  parseModuleId,
} from './types';

test('parseModuleId accepts reverse-dns ids', () => {
  assert.equal(parseModuleId('health.train'), 'health.train');
  assert.equal(parseModuleId('game.racing.gt'), 'game.racing.gt');
  assert.equal(parseModuleId('l1.health'), 'l1.health');
  assert.equal(parseModuleId('Train'), null);
  assert.equal(parseModuleId('health'), null);
  assert.equal(miniSlugFromId('l1.health'), 'health');
  assert.equal(parseMissionMiniEntry('mission://minis/health'), 'health');
});

test('isModuleScope is closed', () => {
  assert.equal(isModuleScope('economy.earn'), true);
  assert.equal(isModuleScope('social.channel.write'), true);
  assert.equal(isModuleScope('photos.read'), true);
  assert.equal(isModuleScope('photos.write'), true);
  assert.equal(isModuleScope('storage.read'), true);
  assert.equal(isModuleScope('storage.write'), true);
  assert.equal(isModuleScope('billing.read'), true);
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

test('SOCIAL_SERVER_MANIFEST is free-core messenger with channel write', () => {
  assert.equal(SOCIAL_SERVER_MANIFEST.freeCore, true);
  assert.equal(SOCIAL_SERVER_MANIFEST.entry, '/server');
  assert.ok(SOCIAL_SERVER_MANIFEST.scopes.includes('social.channel.write'));
  assert.equal(isModuleScope('social.channel.write'), true);
  assert.doesNotThrow(() => assertModuleManifest(SOCIAL_SERVER_MANIFEST));
});

test('UTILITY_CLEARSHOT_MANIFEST parses id, name, scopes, entry, version', () => {
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.id, 'utility.clearshot');
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.name, 'ClearShot');
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.version, '0.1.0');
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.entry, 'mission://minis/clearshot');
  assert.equal(UTILITY_CLEARSHOT_MANIFEST.freeCore, true);
  assert.deepEqual([...UTILITY_CLEARSHOT_MANIFEST.surfaces], ['android']);
  assert.deepEqual(
    [...UTILITY_CLEARSHOT_MANIFEST.scopes],
    ['identity.read', 'photos.read', 'photos.write', 'storage.write']
  );
  assert.doesNotThrow(() => assertModuleManifest(UTILITY_CLEARSHOT_MANIFEST));
  assert.equal(HEALTH_TRAIN_MANIFEST.freeCore, true);
});

test('HOST_SHELL is a reserved id, not a fake / entry', () => {
  assert.equal(HOST_SHELL_ID, 'host.shell');
  assert.equal(HOST_SHELL.id, 'host.shell');
  assert.equal(HOST_SHELL.role, 'host');
  assert.equal(parseModuleId(HOST_SHELL_ID), 'host.shell');
  assert.equal('entry' in HOST_SHELL, false);
});

test('assertModuleManifest accepts matching mission://minis/{slug}', () => {
  assert.equal(parseMissionMiniEntry('mission://minis/clearshot'), 'clearshot');
  assert.equal(miniSlugFromId('utility.clearshot'), 'clearshot');
  assert.doesNotThrow(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      entry: 'mission://minis/clearshot',
    })
  );
  assert.doesNotThrow(() =>
    assertModuleManifest({
      id: 'l1.health',
      name: 'Health',
      version: '0.1.0',
      scopes: ['identity.read', 'storage.read', 'storage.write'],
      surfaces: ['web'],
      freeCore: true,
      entry: 'mission://minis/health',
    })
  );
});

test('assertModuleManifest rejects /active on ClearShot (mutant: wrong entry)', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      entry: '/active',
    })
  );
});

test('assertModuleManifest rejects mission://minis/other when id is utility.clearshot', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      entry: 'mission://minis/other',
    })
  );
  assert.equal(parseMissionMiniEntry('mission://minis/other'), 'other');
});

test('assertModuleManifest rejects unknown scopes', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      scopes: ['identity.read', 'admin.wipe'] as typeof UTILITY_CLEARSHOT_MANIFEST.scopes,
    })
  );
});

test('mission:// minis require a trimmed name of at most 40', () => {
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      name: undefined,
    })
  );
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      name: '   ',
    })
  );
  assert.throws(() =>
    assertModuleManifest({
      ...UTILITY_CLEARSHOT_MANIFEST,
      name: 'x'.repeat(41),
    })
  );
});
