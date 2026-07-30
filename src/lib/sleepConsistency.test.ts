import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_NIGHTS,
  bedClock,
  bedMinutes,
  computeSleepConsistency,
  consistencyLine,
} from '@/lib/sleepConsistency';
import type { MindCheckIn } from '@/lib/mindCheckIns';

const NOW = new Date('2026-07-30T12:00:00');

function night(daysAgo: number, bedTime: string): MindCheckIn {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
  return { date, sleep: 3, mood: 3, stress: 3, energy: 3, behaviors: { bedTime } };
}

describe('bedMinutes — the midnight problem', () => {
  it('23:45 and 00:15 are thirty minutes apart, not twenty-three hours', () => {
    // Raw clock minutes would make these 1410 and 15 — a 1395-minute "spread"
    // that would label every ordinary sleeper scattered.
    const a = bedMinutes('23:45')!;
    const b = bedMinutes('00:15')!;
    assert.equal(Math.abs(a - b), 30);
  });

  it('round-trips back to the wall clock', () => {
    assert.equal(bedClock(bedMinutes('23:00')!), '23:00');
    assert.equal(bedClock(bedMinutes('00:30')!), '00:30');
  });

  it('garbage is null', () => {
    assert.equal(bedMinutes('nope'), null);
    assert.equal(bedMinutes('7:00'), null); // unpadded never reaches here
  });
});

describe('computeSleepConsistency', () => {
  it(`fewer than ${MIN_NIGHTS} logged nights is silence, not a hedge`, () => {
    const four = [night(1, '23:00'), night(2, '23:15'), night(3, '22:45'), night(4, '23:00')];
    assert.equal(computeSleepConsistency(four, NOW), null);
    assert.equal(computeSleepConsistency([], NOW), null);
  });

  it('a regular sleeper reads steady', () => {
    const nights = [0, 1, 2, 3, 4, 5].map((d) => night(d + 1, d % 2 ? '23:00' : '23:15'));
    const c = computeSleepConsistency(nights, NOW);
    assert.equal(c?.band, 'steady');
    assert.equal(c?.nights, 6);
    assert.match(bedClock(c!.usualBedMinutes), /^23:(00|15)$/);
  });

  it('an erratic sleeper reads scattered', () => {
    const times = ['21:00', '02:00', '23:30', '00:45', '20:30', '03:15'];
    const c = computeSleepConsistency(
      times.map((t, i) => night(i + 1, t)),
      NOW
    );
    assert.equal(c?.band, 'scattered');
  });

  it('counts how many of the last seven ran late, and never more than were logged', () => {
    const nights = [
      night(1, '01:30'),
      night(2, '01:15'),
      night(3, '23:00'),
      night(4, '23:00'),
      night(5, '23:00'),
      night(6, '23:00'),
    ];
    const c = computeSleepConsistency(nights, NOW)!;
    assert.equal(c.loggedOf7, 6);
    assert.ok(c.laterThanUsualOf7 <= c.loggedOf7);
    assert.ok(c.laterThanUsualOf7 >= 1, 'the two late nights should register');
  });

  it('nights outside the window do not count', () => {
    const stale = [0, 1, 2, 3, 4, 5].map((d) => night(30 + d, '23:00'));
    assert.equal(computeSleepConsistency(stale, NOW), null);
  });

  it('days without a bed time are skipped, not treated as zero', () => {
    const mixed: MindCheckIn[] = [
      night(1, '23:00'),
      { date: '2026-07-28', sleep: 3, mood: 3, stress: 3, energy: 3 },
      night(3, '23:15'),
      night(4, '23:00'),
      night(5, '22:45'),
    ];
    // Four usable nights out of five entries → under the minimum → silence.
    assert.equal(computeSleepConsistency(mixed, NOW), null);
  });
});

describe('consistencyLine — what it will not say', () => {
  const nights = [0, 1, 2, 3, 4, 5].map((d) => night(d + 1, d % 2 ? '23:00' : '23:15'));
  const line = consistencyLine(computeSleepConsistency(nights, NOW)!);

  /**
   * Both shapes the line can take. The tail clause only renders when some
   * nights ran late, so a tone check over the short form alone would leave
   * half the copy untested — which is exactly how a prescriptive phrase
   * survives in the branch nobody asserted on.
   */
  const withLateNights = consistencyLine(
    computeSleepConsistency(
      [
        night(1, '01:30'),
        night(2, '01:15'),
        night(3, '23:00'),
        night(4, '23:00'),
        night(5, '23:00'),
        night(6, '23:00'),
      ],
      NOW
    )!
  );
  const bothForms = [line, withLateNights];

  it('never prints a sleep debt or a deficit', () => {
    // The screenshot that prompted this feature said "2h 7m 48s". We do not
    // have that number and would not print it at that precision if we did.
    for (const l of bothForms) {
      assert.ok(!/debt|deficit|owe|catch up/i.test(l), l);
      assert.ok(!/\d+h ?\d+m/i.test(l), l);
    }
  });

  it('never prints seconds, and only quarter-hour times', () => {
    for (const l of bothForms) {
      assert.ok(!/\d+\s?s\b/.test(l), l);
      assert.ok(!/\d{1,2}:\d{2}:\d{2}/.test(l), l);
      for (const time of l.match(/\d{2}:\d{2}/g) ?? []) {
        assert.ok(
          ['00', '15', '30', '45'].includes(time.split(':')[1]),
          `not quarter-hour: ${time}`
        );
      }
    }
  });

  it('never leaks a score out of a hundred — bands only', () => {
    for (const l of bothForms) {
      assert.ok(!/\d+\s?\/\s?100|\bscore\b|\bindex\b/i.test(l), l);
    }
  });

  it('describes and stops — no prescription, no medical framing, in either form', () => {
    for (const l of bothForms) {
      for (const word of [
        'should',
        'need to',
        'must',
        'fix that',
        'risk',
        'injury',
        'disorder',
        'apnea',
        'insomnia',
        'unhealthy',
        'poor',
      ]) {
        assert.ok(!l.toLowerCase().includes(word), `line prescribes or diagnoses: ${l}`);
      }
    }
  });

  it('says how many nights it is speaking from', () => {
    assert.match(line, /\d+ logged nights/);
  });

  it('a perfectly regular sleeper gets no invented "late nights" clause', () => {
    const same = [0, 1, 2, 3, 4].map((d) => night(d + 1, '23:00'));
    const c = computeSleepConsistency(same, NOW)!;
    assert.equal(c.laterThanUsualOf7, 0);
    assert.ok(!/later than/.test(consistencyLine(c)));
  });
});
