import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  anonymousComebackPush,
  dayReviewPush,
  windDownPush,
  decideNudge,
  type NudgeCandidate,
  type NudgeKind,
} from '@/lib/nudgeCopy';
import { findToneViolations } from '@/lib/reentryTone';
import { COLD_DEVICE_DAYS } from '@/lib/reentryTone';

const APP = 'https://example.test';
const UNSUB = `${APP}/api/nudges/unsubscribe?u=u1&t=tok`;

function daysAgo(now: Date, n: number): string {
  return new Date(now.getTime() - n * 86_400_000).toISOString().slice(0, 10);
}

function base(now: Date, over: Partial<Parameters<typeof decideNudge>[0]> = {}) {
  return {
    email: 'a@b.test',
    userId: 'u1',
    createdAt: new Date(now.getTime() - 40 * 86_400_000).toISOString(),
    workoutDays: [] as string[],
    workoutCount14d: 0,
    totalVolume14d: 0,
    now,
    appUrl: APP,
    unsubscribeUrl: UNSUB,
    ...over,
  };
}

/** Every kind the engine can emit, so the tone assertion cannot miss one. */
function everyKind(): NudgeCandidate[] {
  // Wednesday, so week-behind's "<=2 days left" window is closed unless we move it.
  const midweek = new Date('2026-07-15T12:00:00Z');
  const saturday = new Date('2026-07-18T12:00:00Z');

  const comeback = decideNudge(
    base(midweek, { workoutDays: [daysAgo(midweek, 9)], daysPerWeek: 3 })
  );
  const recap = decideNudge(
    base(midweek, {
      createdAt: new Date(midweek.getTime() - 7 * 86_400_000).toISOString(),
      workoutDays: [daysAgo(midweek, 1)],
      workoutCount14d: 3,
      totalVolume14d: 12_400,
      daysPerWeek: 3,
    })
  );
  const behind = decideNudge(
    base(saturday, {
      workoutDays: [daysAgo(saturday, 1)],
      workoutCount14d: 1,
      daysPerWeek: 4,
    })
  );

  assert.ok(comeback, 'comeback should fire');
  assert.ok(recap, 'week1-recap should fire');
  assert.ok(behind, 'week-behind should fire');
  return [comeback, recap, behind];
}

test('emits all three kinds, and only those', () => {
  const kinds = everyKind().map((c) => c.kind).sort();
  const expected: NudgeKind[] = ['comeback', 'week-behind', 'week1-recap'];
  assert.deepEqual(kinds, expected);
});

test('no message names an absence length or leans on a streak', () => {
  for (const c of everyKind()) {
    for (const field of ['subject', 'body'] as const) {
      const violations = findToneViolations(c[field]);
      assert.deepEqual(
        violations,
        [],
        `${c.kind}.${field} broke the tone contract: ${JSON.stringify(violations)}`
      );
    }
  }
});

test('the anonymous push copy obeys the same contract', () => {
  const p = anonymousComebackPush();
  assert.deepEqual(findToneViolations(p.title), []);
  assert.deepEqual(findToneViolations(p.body), []);
});

test('every message carries a way out', () => {
  for (const c of everyKind()) {
    assert.ok(c.body.includes(UNSUB), `${c.kind} is missing its unsubscribe link`);
  }
});

test('a rest day at the athlete cadence is not a nudge', () => {
  const now = new Date('2026-07-15T12:00:00Z');
  // 3x/week: trained two days ago. That is a normal gap, not a lapse.
  const c = decideNudge(
    base(now, { workoutDays: [daysAgo(now, 2)], workoutCount14d: 4, daysPerWeek: 3 })
  );
  assert.equal(c, null);
});

test('a lower-cadence athlete is given more room than a higher-cadence one', () => {
  const now = new Date('2026-07-15T12:00:00Z');
  const quiet = { workoutDays: [daysAgo(now, 5)], workoutCount14d: 2 };
  const twice = decideNudge(base(now, { ...quiet, daysPerWeek: 2 }));
  const sixTimes = decideNudge(base(now, { ...quiet, daysPerWeek: 6 }));

  assert.equal(twice, null, '2x/week: five days quiet is within their own rhythm');
  assert.equal(sixTimes?.kind, 'comeback', '6x/week: five days quiet is a real lapse');
});

test('nothing is sent to a device that has gone cold', () => {
  const now = new Date('2026-07-15T12:00:00Z');
  const c = decideNudge(
    base(now, {
      workoutDays: [daysAgo(now, COLD_DEVICE_DAYS + 5)],
      workoutCount14d: 1,
      daysPerWeek: 3,
    })
  );
  assert.equal(c, null);
});

test('week-behind stays quiet for someone who logged nothing this week', () => {
  // "Room for one more" only makes sense to someone who has started. With zero
  // sessions this week the honest options are a comeback or silence — and here the
  // athlete's own 2x/week threshold has not been crossed yet, so: silence.
  const saturday = new Date('2026-07-18T12:00:00Z');
  // Six days back is the previous Sunday — last week, not this one.
  const c = decideNudge(
    base(saturday, { workoutDays: [daysAgo(saturday, 6)], workoutCount14d: 2, daysPerWeek: 2 })
  );
  assert.equal(c, null);
});

test('the wind-down copy obeys the same tone contract', () => {
  const c = windDownPush();
  assert.deepEqual(findToneViolations(c.title), []);
  assert.deepEqual(findToneViolations(c.body), []);
});

test('the wind-down copy makes no medical claim', () => {
  // It describes a comparison and prescribes hygiene. LEGAL_SAFETY §3a, and the same
  // rule load.ts sets for every band sentence: describe, never predict.
  const text = `${windDownPush().title} ${windDownPush().body}`.toLowerCase();
  for (const word of ['injur', 'risk', 'prevent', 'pain', 'diagnos', 'overtrain']) {
    assert.equal(text.includes(word), false, `wind-down must not say "${word}"`);
  }
});

test('the day-review doorbell carries no numbers at all', () => {
  // The row it is sent from holds no behavior data, no sleep figure and no
  // session load — by contract. A digit here would either be invented or would
  // mean we had started storing what we promised not to.
  const p = dayReviewPush();
  assert.ok(!/\d/.test(p.title), p.title);
  assert.ok(!/\d/.test(p.body), p.body);
});

test('the day-review copy obeys the same tone contract as every other kind', () => {
  const p = dayReviewPush();
  assert.deepEqual(findToneViolations(p.title), []);
  assert.deepEqual(findToneViolations(p.body), []);
});
