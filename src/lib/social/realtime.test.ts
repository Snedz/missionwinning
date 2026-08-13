import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectGarageRealtime, type GarageRealtimeDeps } from './realtime';

test('unconfigured supabase does not throw and does not subscribe', async () => {
  let subscribed = 0;
  const deps: GarageRealtimeDeps = {
    isConfigured: () => false,
    getSession: async () => ({ user: { id: 'u1' } }),
    subscribe: async () => {
      subscribed += 1;
      return { send: async () => {}, disconnect: () => {} };
    },
  };
  const handle = await connectGarageRealtime(() => {}, deps);
  assert.equal(handle.ok, false);
  if (!handle.ok) assert.equal(handle.reason, 'unconfigured');
  assert.equal(subscribed, 0);
});

test('no session stays local without subscribe', async () => {
  let subscribed = 0;
  const deps: GarageRealtimeDeps = {
    isConfigured: () => true,
    getSession: async () => null,
    subscribe: async () => {
      subscribed += 1;
      return { send: async () => {}, disconnect: () => {} };
    },
  };
  const handle = await connectGarageRealtime(() => {}, deps);
  assert.equal(handle.ok, false);
  if (!handle.ok) assert.equal(handle.reason, 'no-session');
  assert.equal(subscribed, 0);
});

test('subscribe throw is fail-closed', async () => {
  const deps: GarageRealtimeDeps = {
    isConfigured: () => true,
    getSession: async () => ({ user: { id: 'u1' } }),
    subscribe: async () => {
      throw new Error('paused');
    },
  };
  const handle = await connectGarageRealtime(() => {}, deps);
  assert.equal(handle.ok, false);
  if (!handle.ok) assert.equal(handle.reason, 'subscribe-failed');
});

test('configured session can send after subscribe', async () => {
  const sent: unknown[] = [];
  const deps: GarageRealtimeDeps = {
    isConfigured: () => true,
    getSession: async () => ({ user: { id: 'u1' } }),
    subscribe: async (topic, _onEvent) => {
      assert.match(topic, /^mw-garage-u1$/);
      return {
        send: async (payload) => {
          sent.push(payload);
        },
        disconnect: () => {},
      };
    },
  };
  const handle = await connectGarageRealtime(() => {}, deps);
  assert.equal(handle.ok, true);
  if (!handle.ok) return;
  await handle.send({
    id: '1',
    channelId: 'train',
    authorCallSign: 'Athlete',
    body: 'hi',
    createdAt: '2026-08-13T12:00:00.000Z',
  });
  assert.equal(sent.length, 1);
  handle.disconnect();
});
