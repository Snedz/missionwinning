import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMiniBus } from './bus';
import { lookupMini } from './registry';

test('guest identity is null; unknown mini is unknown_mini', () => {
  const bus = createMiniBus();
  assert.deepEqual(bus.identity('utility.clearshot'), {
    ok: true,
    value: { missionId: null, callSign: null },
  });
  assert.deepEqual(bus.identity('utility.missing'), {
    ok: false,
    code: 'unknown_mini',
  });
});

test('injected identity and billing never mint or open checkout', () => {
  const bus = createMiniBus({
    identity: { missionId: 12, callSign: '12' },
    billing: { bundle: 'super', muted: false },
  });
  assert.deepEqual(bus.identity('utility.clearshot'), {
    ok: true,
    value: { missionId: 12, callSign: '12' },
  });
  assert.deepEqual(bus.billing('utility.clearshot'), {
    ok: false,
    code: 'scope_denied',
  });
});

test('undeclared health.write and photos stub', () => {
  const bus = createMiniBus();
  assert.deepEqual(bus.photos('utility.clearshot', 'read'), {
    ok: false,
    code: 'photos_stub',
  });
  assert.deepEqual(lookupMini('utility.clearshot').ok, true);
});

test('storage write is namespaced; read is undeclared on ClearShot', () => {
  const bus = createMiniBus();
  assert.deepEqual(bus.storageSet('utility.clearshot', 'note', 'ok'), {
    ok: true,
    value: undefined,
  });
  assert.deepEqual(bus.storageGet('utility.clearshot', 'note'), {
    ok: false,
    code: 'scope_denied',
  });
  assert.deepEqual(bus.storageSet('utility.missing', 'note', 'ok'), {
    ok: false,
    code: 'unknown_mini',
  });
});
