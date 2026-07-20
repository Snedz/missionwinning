import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectInviteFollowupCandidates } from './inviteFollowups.ts';

describe('selectInviteFollowupCandidates', () => {
  const now = Date.parse('2026-07-20T12:00:00Z');

  it('selects day-2 when no signup after 2 days', () => {
    const c = selectInviteFollowupCandidates(
      [
        {
          id: '1',
          label: 'Alex',
          email: 'alex@example.com',
          created_at: '2026-07-17T12:00:00Z',
          signed_up_user_id: null,
          day2_sent_at: null,
          day7_sent_at: null,
        },
      ],
      now
    );
    assert.equal(c.length, 1);
    assert.equal(c[0].kind, 'day2');
  });

  it('skips day-2 if already sent or too new', () => {
    const c = selectInviteFollowupCandidates(
      [
        {
          id: '1',
          label: 'A',
          email: 'a@x.com',
          created_at: '2026-07-19T12:00:00Z',
          signed_up_user_id: null,
          day2_sent_at: null,
          day7_sent_at: null,
        },
        {
          id: '2',
          label: 'B',
          email: 'b@x.com',
          created_at: '2026-07-10T12:00:00Z',
          signed_up_user_id: null,
          day2_sent_at: '2026-07-12T00:00:00Z',
          day7_sent_at: null,
        },
      ],
      now
    );
    assert.equal(c.length, 0);
  });

  it('selects day-7 when signed up without first workout', () => {
    const c = selectInviteFollowupCandidates(
      [
        {
          id: '3',
          label: 'Chris',
          email: 'c@x.com',
          created_at: '2026-07-10T12:00:00Z',
          signed_up_user_id: 'user-1',
          day2_sent_at: '2026-07-12T00:00:00Z',
          day7_sent_at: null,
          firstWorkout: false,
        },
      ],
      now
    );
    assert.equal(c.length, 1);
    assert.equal(c[0].kind, 'day7');
  });

  it('skips day-7 when first workout done', () => {
    const c = selectInviteFollowupCandidates(
      [
        {
          id: '4',
          label: 'D',
          email: 'd@x.com',
          created_at: '2026-07-10T12:00:00Z',
          signed_up_user_id: 'user-2',
          day2_sent_at: null,
          day7_sent_at: null,
          firstWorkout: true,
        },
      ],
      now
    );
    assert.equal(c.length, 0);
  });

  it('skips rows without email', () => {
    const c = selectInviteFollowupCandidates(
      [
        {
          id: '5',
          label: 'E',
          email: null,
          created_at: '2026-07-01T12:00:00Z',
          signed_up_user_id: null,
          day2_sent_at: null,
          day7_sent_at: null,
        },
      ],
      now
    );
    assert.equal(c.length, 0);
  });
});
