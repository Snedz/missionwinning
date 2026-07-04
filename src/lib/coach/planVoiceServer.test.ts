import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePlanVoiceJson,
  planVoiceFromRules,
} from '@/lib/coach/planVoiceServer';

const ctx = {
  plan: {
    weekStart: '2026-07-06',
    sessions: [
      { name: 'Push', kind: 'strength', whyKeys: ['coachWhyLoadUp'] },
      { name: 'Recovery', kind: 'recovery', whyKeys: ['coachWhyRecovery'] },
    ],
  },
  readiness: 70,
  strain: 50,
  recovery: 60,
};

describe('parsePlanVoiceJson', () => {
  it('parses valid JSON', () => {
    const out = parsePlanVoiceJson('{"message":"Push hard early, recover mid-week."}');
    assert.ok(out);
    assert.equal(out!.source, 'llm');
    assert.ok(out!.message.includes('Push'));
  });

  it('returns null for malformed JSON', () => {
    assert.equal(parsePlanVoiceJson('not json'), null);
  });
});

describe('planVoiceFromRules', () => {
  it('returns rules fallback key', () => {
    const out = planVoiceFromRules(ctx);
    assert.equal(out.source, 'rules');
    assert.ok(out.message.startsWith('coachVoice'));
  });

  it('picks deload key when strain high', () => {
    const out = planVoiceFromRules({ ...ctx, strain: 80 });
    assert.equal(out.message, 'coachVoiceDeload');
  });
});
