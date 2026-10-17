/**
 * A push subscription is an address the server will fetch.
 * Anything that is not a known push service is refused before that fetch.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isAllowedPushEndpoint } from '@/lib/pushEndpoint';
import { pushSubscribeBodySchema, pushUnsubscribeBodySchema } from '@/lib/apiSchemas';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const ALLOWED = [
  'https://fcm.googleapis.com/fcm/send/abc',
  'https://updates.push.services.mozilla.com/wpush/v2/abc',
  'https://web.push.apple.com/Q',
  'https://wns2-pn1p.notify.windows.com/w/?token=1',
  'https://fcm.googleapis.com:443/fcm/send/abc',
];

const REFUSED = [
  'http://fcm.googleapis.com/fcm/send/abc',
  'https://example.com/p',
  'https://push.example/e1',
  'https://fcm.googleapis.com.evil.com/fcm/send/abc',
  'https://notfcm.googleapis.com/fcm/send/abc',
  'https://updates.push.services.mozilla.com.evil.com/w',
  'https://notify.windows.com/w',
  'https://evil.notify.windows.com.evil.com/w',
  'https://user:pass@fcm.googleapis.com/fcm/send/abc',
  'https://fcm.googleapis.com:8443/fcm/send/abc',
  'https://127.0.0.1/fcm/send/abc',
  'not-a-url',
];

test('known push hosts are allowed and lookalikes are not', () => {
  for (const url of ALLOWED) {
    assert.equal(isAllowedPushEndpoint(url), true, url);
  }
  for (const url of REFUSED) {
    assert.equal(isAllowedPushEndpoint(url), false, url);
  }
});

test('subscribe and unsubscribe schemas use the host allowlist', () => {
  const body = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
    p256dh: 'k',
    auth: 'a',
    deviceId: 'd',
  };
  assert.equal(pushSubscribeBodySchema.safeParse(body).success, true);
  assert.equal(pushUnsubscribeBodySchema.safeParse({ endpoint: body.endpoint }).success, true);
  assert.equal(
    pushSubscribeBodySchema.safeParse({ ...body, endpoint: 'https://example.com/p' }).success,
    false
  );
  assert.equal(pushUnsubscribeBodySchema.safeParse({ endpoint: 'https://example.com/p' }).success, false);

  const src = read('src/lib/apiSchemas.ts');
  assert.match(src, /const pushEndpoint = z\.string\(\)\.url\(\)\.max\(1000\)\.refine\(isAllowedPushEndpoint/);
  assert.equal((src.match(/endpoint: pushEndpoint/g) ?? []).length, 2);

  const server = read('src/lib/pushServer.ts');
  const check = server.indexOf('isAllowedPushEndpoint');
  const send = server.indexOf('sendNotification');
  assert.ok(check !== -1 && send !== -1 && check < send, 'the host check has to run before the fetch');
});
