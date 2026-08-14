import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  enqueueSocialMessage,
  enqueueSocialMessageIfSignedIn,
  isSocialPresencePayload,
  isSocialReportPayload,
  socialDeliveryDone,
} from '@/lib/socialSync';
import { __resetForTests as resetOutbox, getState, registerHandler } from '@/lib/sync/outbox';
import { __resetForTests as resetStorage } from '@/lib/storage/safeStorage';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

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
  resetOutbox();
});

afterEach(() => {
  uninstall();
});

describe('socialDeliveryDone', () => {
  it('retries 5xx and 429; finishes 401 so a guest write cannot spin', () => {
    assert.equal(socialDeliveryDone(200), true);
    assert.equal(socialDeliveryDone(401), true);
    assert.equal(socialDeliveryDone(429), false);
    assert.equal(socialDeliveryDone(500), false);
  });
});

describe('payload guards', () => {
  it('presence and report require a closed set', () => {
    assert.equal(isSocialPresencePayload({ status: 'available', callSign: 'Oak' }), true);
    assert.equal(isSocialPresencePayload({ status: 'online', callSign: 'Oak' }), false);
    assert.equal(isSocialReportPayload({ messageId: 'm1', reason: 'spam' }), true);
    assert.equal(isSocialReportPayload({ messageId: 'm1', reason: 'lol' }), false);
  });
});

describe('guest never enqueues', () => {
  it('signed-out probe leaves the outbox empty', async () => {
    registerHandler('social.message', async () => true);
    await enqueueSocialMessageIfSignedIn(
      {
        id: 'm1',
        channelSlug: 'train',
        body: 'hello',
        kind: 'text',
        authorCallSign: 'Athlete',
        authorMissionId: null,
        createdAt: '2026-08-14T12:00:00.000Z',
      },
      async () => null
    );
    assert.equal(getState().pending, 0);
  });

  it('signed-in probe queues one message', async () => {
    registerHandler('social.message', async () => true);
    await enqueueSocialMessageIfSignedIn(
      {
        id: 'm1',
        channelSlug: 'train',
        body: 'hello',
        kind: 'text',
        authorCallSign: 'Athlete',
        authorMissionId: null,
        createdAt: '2026-08-14T12:00:00.000Z',
      },
      async () => ({ user: { id: 'u1' } })
    );
    assert.equal(getState().pending, 1);
  });

  it('raw enqueue is the only writer', () => {
    registerHandler('social.message', async () => true);
    enqueueSocialMessage({
      id: 'm2',
      channelSlug: 'garage',
      body: 'hi',
      kind: 'text',
      authorCallSign: 'Athlete',
      authorMissionId: null,
      createdAt: '2026-08-14T12:00:00.000Z',
    });
    assert.equal(getState().pending, 1);
  });
});

describe('wiring', () => {
  it('handler is registered at boot and page does not raw-fetch the write', () => {
    const drain = read('src/hooks/useOutboxDrain.ts');
    assert.match(drain, /registerSocialSyncHandler\(\)/);
    const page = read('src/page-components/ServerPage.tsx');
    assert.doesNotMatch(page, /fetch\s*\(\s*['"]\/api\/social\/messages['"]/);
    const sync = read('src/lib/socialSync.ts');
    assert.match(sync, /registerHandler\('social\.message'/);
    assert.match(sync, /enqueue\('social\.message'/);
  });
});
