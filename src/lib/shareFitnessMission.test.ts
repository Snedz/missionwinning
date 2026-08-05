import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { buildCommissioningShareText, buildPftShareText, buildClassInviteShareText } from '@/lib/shareFitnessMission';
import { scoreFitnessTestSession } from '@/lib/presidentialFitnessTest';

describe('shareFitnessMission', () => {
  const prevMaha = process.env.NEXT_PUBLIC_SHOW_MAHA_COPY;
  const prevAmerica = process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;

  after(() => {
    if (prevMaha === undefined) delete process.env.NEXT_PUBLIC_SHOW_MAHA_COPY;
    else process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = prevMaha;
    if (prevAmerica === undefined) delete process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;
    else process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED = prevAmerica;
  });

  it('builds default PFT share text', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'false';
    delete process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'curl_ups', value: 40 }],
    });
    const text = buildPftShareText(session);
    assert.match(text, /Presidential Fitness Test|mini fitness test/);
    assert.match(text, /missionwinning\.com/);
    assert.doesNotMatch(text, /\/america/);
  });

  it('builds MAHA PFT share when America track + MAHA copy enabled', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'true';
    process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED = 'true';
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'push_ups', value: 30 }],
      mode: 'mini',
    });
    const text = buildPftShareText(session, 'MWTEST');
    assert.match(text, /Make America Healthy Again/);
    assert.match(text, /MWTEST/);
    assert.match(text, /\/america/);
  });

  it('MAHA env alone does not deep-link parked /america', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'true';
    delete process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'push_ups', value: 30 }],
      mode: 'mini',
    });
    const text = buildPftShareText(session);
    assert.doesNotMatch(text, /\/america/);
    assert.match(text, /fitness-test/);
  });

  it('builds commissioning and class invite text', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'false';
    delete process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;
    assert.match(buildCommissioningShareText(false), /commissioned/);
    assert.match(buildClassInviteShareText('MWAB12', '5th Grade PE'), /MWAB12/);
  });

  it('appends ref= when refCode provided', () => {
    process.env.NEXT_PUBLIC_SHOW_MAHA_COPY = 'false';
    delete process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED;
    const session = scoreFitnessTestSession({
      age: 14,
      sex: 'male',
      results: [{ eventId: 'curl_ups', value: 40 }],
    });
    const text = buildPftShareText(session, null, { refCode: 'MW-ABC12' });
    assert.match(text, /ref=MW-ABC12/);
    assert.match(buildCommissioningShareText(false, { refCode: 'MW-XYZ99' }), /ref=MW-XYZ99/);
  });
});
