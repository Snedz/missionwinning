import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { composeFounderDigest } from '@/lib/founderDigestCompose';

describe('composeFounderDigest', () => {
  it('includes funnel, retention, and referrals sections', () => {
    const { subject, text } = composeFounderDigest({
      generatedAt: '2026-07-19T16:00:00.000Z',
      funnel: {
        signedUpLast14Days: 12,
        iDayComplete: 10,
        basicComplete: 6,
        commissioned: 3,
      },
      retention: { cohort_eligible: 40, week4_retained: 5 },
      referrals: {
        attributedTotal: 8,
        topCodes: [{ code: 'MW-ABC12', count: 3 }],
      },
      feedback: [],
    });
    assert.match(subject, /2026-07-19/);
    assert.match(text, /I-Day complete: 10/);
    assert.match(text, /iday_mission_accepted/);
    assert.match(text, /Week-4 retained: 5/);
    assert.match(text, /12\.5%/);
    assert.match(text, /MW-ABC12: 3/);
    assert.match(text, /recognition only/i);
  });

  it('handles missing metrics gracefully', () => {
    const { text } = composeFounderDigest({
      generatedAt: '2026-07-19T00:00:00.000Z',
      funnel: null,
      retention: null,
      referrals: null,
      feedback: null,
    });
    assert.match(text, /unavailable/i);
  });
});
