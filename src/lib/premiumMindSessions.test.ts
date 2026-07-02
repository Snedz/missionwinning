import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PREMIUM_MIND_SESSION_DATA } from '@/data/premiumMindSessionData';
import { PREMIUM_MIND_SESSION_COUNT } from '@/lib/mindPremiumMeta';

describe('premiumMindSessions (Phase I3)', () => {
  it('defines at least 5 premium sessions', () => {
    assert.ok(PREMIUM_MIND_SESSION_DATA.length >= 5);
  });

  it('count matches meta constant for locked teaser', () => {
    assert.equal(PREMIUM_MIND_SESSION_DATA.length, PREMIUM_MIND_SESSION_COUNT);
  });

  it('each session has unique id and non-empty steps', () => {
    const ids = new Set<string>();
    for (const s of PREMIUM_MIND_SESSION_DATA) {
      assert.ok(s.id.length > 0);
      assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
      ids.add(s.id);
      assert.ok(s.steps.length >= 3, `${s.id} needs steps`);
      for (const step of s.steps) {
        assert.ok(step.text.length > 0);
        assert.ok(step.durationSec > 0);
      }
    }
  });
});
