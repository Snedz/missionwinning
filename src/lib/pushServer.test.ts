import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPushNotificationJson, isStalePushStatus } from '@/lib/pushPayload';

describe('pushPayload helpers', () => {
  it('builds notification JSON with url in data', () => {
    const raw = buildPushNotificationJson({
      title: 'Train today',
      body: 'Your streak is on the line.',
      url: '/log?src=push',
    });
    const parsed = JSON.parse(raw) as {
      title: string;
      body: string;
      data: { url: string };
    };
    assert.equal(parsed.title, 'Train today');
    assert.equal(parsed.data.url, '/log?src=push');
  });

  it('classifies stale push statuses', () => {
    assert.equal(isStalePushStatus(404), true);
    assert.equal(isStalePushStatus(410), true);
    assert.equal(isStalePushStatus(500), false);
    assert.equal(isStalePushStatus(undefined), false);
  });
});
