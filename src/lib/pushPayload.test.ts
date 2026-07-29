import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPushNotificationJson, isStalePushStatus } from '@/lib/pushPayload';

test('the tag rides in the payload so kinds do not replace each other', () => {
  const parsed = JSON.parse(
    buildPushNotificationJson({
      title: 'That one ran hot',
      body: 'Water, food, an early night.',
      url: '/log?debrief=last&src=push',
      tag: 'mw-wind-down',
    })
  );
  assert.equal(parsed.data.tag, 'mw-wind-down');
  assert.equal(parsed.data.url, '/log?debrief=last&src=push');
});

test('an untagged payload leaves the service worker on its default', () => {
  const parsed = JSON.parse(
    buildPushNotificationJson({ title: 'T', body: 'B', url: '/log?src=push' })
  );
  assert.equal(parsed.data.tag, undefined, 'sw falls back to mw-nudge');
});

test('stale endpoints are the ones push services retire', () => {
  assert.equal(isStalePushStatus(404), true);
  assert.equal(isStalePushStatus(410), true);
  assert.equal(isStalePushStatus(429), false);
  assert.equal(isStalePushStatus(undefined), false);
});
