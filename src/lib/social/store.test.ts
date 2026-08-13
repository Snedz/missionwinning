import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { writeRaw } from '@/lib/storage/safeStorage';
import { UNSET_CALL_SIGN, readChatCallSign } from './callSign';
import { seedGarageServer } from './garage';
import {
  ingestRemoteMessage,
  loadMissionServer,
  messagesForChannel,
  postLocalMessage,
} from './store';
import {
  DEFAULT_CHANNEL_SLUGS,
  MAX_CHANNELS,
  MAX_MESSAGES_PER_CHANNEL,
  MAX_SERVERS,
} from './types';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const g = globalThis as { localStorage?: Storage };
  const prev = g.localStorage;
  g.localStorage = {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as unknown as Storage;
  return () => {
    if (prev === undefined) delete g.localStorage;
    else g.localStorage = prev;
  };
}

let uninstall: () => void;
beforeEach(() => {
  uninstall = installStorage();
  resetStorage();
});
afterEach(() => {
  uninstall();
  resetStorage();
});

test('seed Garage has three default channels and one self member', () => {
  const garage = seedGarageServer();
  assert.equal(garage.name, 'Garage');
  assert.deepEqual(
    garage.channels.map((c) => c.slug),
    [...DEFAULT_CHANNEL_SLUGS]
  );
  assert.ok(garage.channels.length <= MAX_CHANNELS);
  assert.equal(MAX_SERVERS, 1);
  assert.deepEqual(garage.members, [{ id: 'self', kind: 'self' }]);
});

test('first load persists a Garage and round-trips a message', () => {
  const a = loadMissionServer();
  assert.equal(a.server.channels.length, 3);
  const posted = postLocalMessage('train', 'logged the set');
  assert.equal(posted.ok, true);
  const b = loadMissionServer();
  assert.equal(messagesForChannel(b, 'train').length, 1);
  assert.equal(messagesForChannel(b, 'train')[0].body, 'logged the set');
});

test('channel switch does not bleed messages', () => {
  postLocalMessage('train', 'in train');
  postLocalMessage('garage', 'in garage');
  const state = loadMissionServer();
  assert.deepEqual(
    messagesForChannel(state, 'train').map((m) => m.body),
    ['in train']
  );
  assert.deepEqual(
    messagesForChannel(state, 'garage').map((m) => m.body),
    ['in garage']
  );
  assert.equal(messagesForChannel(state, 'off-topic').length, 0);
});

test('empty body is rejected', () => {
  const result = postLocalMessage('train', '   ');
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'empty');
});

test('unknown channel is rejected', () => {
  const result = postLocalMessage('voice', 'nope');
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'unknown-channel');
});

test('author is Athlete when call sign is unset', () => {
  assert.equal(readChatCallSign(), UNSET_CALL_SIGN);
  const posted = postLocalMessage('train', 'hello');
  assert.equal(posted.ok, true);
  if (posted.ok) assert.equal(posted.message.authorCallSign, 'Athlete');
});

test('author uses stored call sign when set', () => {
  writeRaw(STORAGE_KEYS.operatorName, 'Red Oak');
  const posted = postLocalMessage('train', 'hello');
  assert.equal(posted.ok, true);
  if (posted.ok) assert.equal(posted.message.authorCallSign, 'Red Oak');
});

test('per-channel cap drops oldest', () => {
  for (let i = 0; i < MAX_MESSAGES_PER_CHANNEL + 5; i++) {
    const r = postLocalMessage('train', `m${i}`);
    assert.equal(r.ok, true);
  }
  const list = messagesForChannel(loadMissionServer(), 'train');
  assert.equal(list.length, MAX_MESSAGES_PER_CHANNEL);
  assert.equal(list[0].body, 'm5');
  assert.equal(list[list.length - 1].body, `m${MAX_MESSAGES_PER_CHANNEL + 4}`);
});

test('clamp drops channels past the free cap', () => {
  writeRaw(
    STORAGE_KEYS.missionServer,
    JSON.stringify({
      version: 1,
      server: {
        id: 'garage-local',
        name: 'Garage',
        channels: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, slug: id, name: id })),
        members: [],
        messages: {},
      },
    })
  );
  const state = loadMissionServer();
  assert.equal(state.server.channels.length, MAX_CHANNELS);
});

test('corrupt storage reseeds without throwing', () => {
  writeRaw(STORAGE_KEYS.missionServer, '{not json');
  const state = loadMissionServer();
  assert.equal(state.server.channels.length, 3);
});

test('ingestRemoteMessage ignores junk and accepts a valid payload', () => {
  assert.equal(ingestRemoteMessage({ nope: true }), null);
  const ingested = ingestRemoteMessage({
    id: 'remote-1',
    channelId: 'garage',
    authorCallSign: 'Other',
    body: 'from the wire',
    createdAt: '2026-08-13T12:00:00.000Z',
  });
  assert.ok(ingested);
  assert.equal(messagesForChannel(ingested!, 'garage')[0].id, 'remote-1');
});
