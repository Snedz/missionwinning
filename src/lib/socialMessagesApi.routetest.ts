/**
 * Social message API is session-only. Guests must not have a write path.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { socialMessageBodySchema, socialReportBodySchema } from '@/lib/apiSchemas';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('social messages API contract', () => {
  it('requires a session and never trusts a client user id', () => {
    const route = read('app/api/social/messages/route.ts');
    assert.match(route, /getUserFromRequest/);
    assert.match(route, /status: 401/);
    assert.doesNotMatch(route, /user_id:\s*parsed/);
    assert.match(route, /user\.id/);
    assert.doesNotMatch(route, /error\.message/);
  });

  it('accepts garage slugs only', () => {
    const ok = socialMessageBodySchema.safeParse({
      id: 'aaaaaaaa',
      channelSlug: 'train',
      body: 'hello',
      authorCallSign: 'Athlete',
      createdAt: '2026-08-14T12:00:00.000Z',
    });
    assert.equal(ok.success, true);
    assert.equal(
      socialMessageBodySchema.safeParse({
        id: 'aaaaaaaa',
        channelSlug: 'voice',
        body: 'hello',
        authorCallSign: 'Athlete',
        createdAt: '2026-08-14T12:00:00.000Z',
      }).success,
      false
    );
    assert.equal(socialMessageBodySchema.safeParse({}).success, false);
  });

  it('report schema is a closed reason set', () => {
    assert.equal(socialReportBodySchema.safeParse({ messageId: 'm1' }).success, true);
    assert.equal(
      socialReportBodySchema.safeParse({ messageId: 'm1', reason: 'nope' }).success,
      false
    );
  });
});
