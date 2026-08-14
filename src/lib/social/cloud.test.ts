import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMissingRelation,
  isSocialMessagePayload,
  messageToPayload,
  rowToGarageMessage,
  rowToRemotePresence,
} from './cloud';

test('isMissingRelation recognizes undefined table codes', () => {
  assert.equal(isMissingRelation({ code: '42P01' }), true);
  assert.equal(isMissingRelation({ code: 'PGRST205' }), true);
  assert.equal(isMissingRelation({ message: 'relation "social_messages" does not exist' }), true);
  assert.equal(isMissingRelation({ code: '23505' }), false);
});

test('rowToGarageMessage maps snake_case and marks origin', () => {
  const remote = rowToGarageMessage({
    id: 'm1',
    channel_slug: 'train',
    body: 'hello',
    author_call_sign: 'Oak',
    created_at: '2026-08-14T12:00:00.000Z',
    kind: 'text',
  });
  assert.ok(remote);
  assert.equal(remote?.origin, 'remote');
  assert.equal(remote?.channelId, 'train');

  const mine = rowToGarageMessage(
    {
      id: 'm2',
      channel_slug: 'garage',
      body: 'mine',
      author_call_sign: 'Oak',
      created_at: '2026-08-14T12:00:00.000Z',
    },
    { mine: true }
  );
  assert.equal(mine?.origin, 'local');
});

test('messageToPayload rejects unknown channels', () => {
  assert.equal(
    messageToPayload({
      id: '1',
      channelId: 'voice',
      authorCallSign: 'A',
      body: 'x',
      createdAt: '2026-08-14T12:00:00.000Z',
    }),
    null
  );
  const payload = messageToPayload({
    id: '1',
    channelId: 'train',
    authorCallSign: 'A',
    body: 'x',
    createdAt: '2026-08-14T12:00:00.000Z',
    kind: 'nudge',
  });
  assert.ok(payload);
  assert.equal(payload?.channelSlug, 'train');
  assert.equal(isSocialMessagePayload(payload), true);
});

test('rowToRemotePresence never invents a row', () => {
  assert.equal(rowToRemotePresence({ call_sign: 'Oak' }), null);
  const person = rowToRemotePresence({
    call_sign: 'Oak',
    status: 'available',
    last_seen: '2026-08-14T12:00:00.000Z',
  });
  assert.deepEqual(person, {
    callSign: 'Oak',
    status: 'available',
    lastSeen: '2026-08-14T12:00:00.000Z',
  });
});
