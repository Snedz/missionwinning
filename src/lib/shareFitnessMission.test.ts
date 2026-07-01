import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildCommissioningShareText, buildPftShareText, buildClassInviteShareText } from '@/lib/shareFitnessMission';
import { scoreFitnessTestSession } from '@/lib/presidentialFitnessTest';

describe('shareFitnessMission', () => {
  const prev = process.env.NEXT_PUBLIC_SHOW_MAHA_COPY;

  after(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SHOW_MAHA_COPY;
    else process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = prev;
  });

  it('builds default PFT share text', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'false';
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'curl_ups', value: 40 }],
    });
    const text = buildPftShareText(session);
    assert.match(text, /Presidential Fitness Test|mini fitness test/);
    assert.match(text, /missionwinning\.com/);
  });

  it('builds MAHA PFT share when enabled', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'true';
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'push_ups', value: 30 }],
      mode: 'mini',
    });
    const text = buildPftShareText(session, 'MWTEST');
    assert.match(text, /Make America Healthy Again/);
    assert.match(text, /MWTEST/);
  });

  it('builds commissioning and class invite text', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'false';
    assert.match(buildCommissioningShareText(false), /commissioned/);
    assert.match(buildClassInviteShareText('MWAB12', '5th Grade PE'), /MWAB12/);
  });
});
