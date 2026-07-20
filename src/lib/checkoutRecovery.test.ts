import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectCheckoutRecoveryCandidates } from './checkoutRecovery.ts';

describe('selectCheckoutRecoveryCandidates', () => {
  const now = Date.parse('2026-07-20T12:00:00Z');

  it('selects rows expired ≥1h with no send', () => {
    const c = selectCheckoutRecoveryCandidates(
      [
        {
          id: '1',
          session_id: 'cs_1',
          email: 'a@x.com',
          plan: 'super-bundle',
          expired_at: '2026-07-20T10:00:00Z',
          recovery_sent_at: null,
        },
      ],
      now
    );
    assert.equal(c.length, 1);
    assert.equal(c[0].email, 'a@x.com');
  });

  it('skips recent, already sent, or unsubscribed', () => {
    const c = selectCheckoutRecoveryCandidates(
      [
        {
          id: '1',
          session_id: 'cs_1',
          email: 'a@x.com',
          plan: null,
          expired_at: '2026-07-20T11:30:00Z',
          recovery_sent_at: null,
        },
        {
          id: '2',
          session_id: 'cs_2',
          email: 'b@x.com',
          plan: null,
          expired_at: '2026-07-19T12:00:00Z',
          recovery_sent_at: '2026-07-19T14:00:00Z',
        },
        {
          id: '3',
          session_id: 'cs_3',
          email: 'c@x.com',
          plan: null,
          expired_at: '2026-07-19T12:00:00Z',
          recovery_sent_at: null,
        },
      ],
      now,
      new Set(['c@x.com'])
    );
    assert.equal(c.length, 0);
  });
});
