import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  anonymousComebackPush,
  dayReviewPush,
  windDownPush,
  decideNudge,
  type NudgeCandidate,
  type NudgeKind,
  type PushCopy,
} from '@/lib/nudgeCopy';
import { findToneViolations } from '@/lib/reentryTone';
import { COLD_DEVICE_DAYS } from '@/lib/reentryTone';

const root = path.join(import.meta.dirname, '..', '..');
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

/**
 * Every push the app can send, whatever triggers it.
 *
 * The three email-mirrored kinds come off `decideNudge`; wind-down and
 * day-review have no `decideNudge` branch because their gates select for
 * someone who trained *today*. Enumerated rather than discovered, and the list
 * is closed by construction: `NudgeKind` has five members and each appears once
 * below, so adding a sixth without a push here fails the count assertion.
 */
function everyPush(): { kind: NudgeKind; push: PushCopy }[] {
  const fromEmail = everyKind().map((c) => ({ kind: c.kind, push: c.push }));
  return [
    ...fromEmail,
    { kind: 'wind-down' as const, push: windDownPush() },
    { kind: 'day-review' as const, push: dayReviewPush() },
  ];
}

test('every push copy obeys the tone contract', () => {
  const pushes = everyPush();
  assert.equal(pushes.length, 5, 'a kind was added without push copy beside it');
  for (const { kind, push } of pushes) {
    for (const field of ['title', 'body'] as const) {
      assert.deepEqual(
        findToneViolations(push[field]),
        [],
        `${kind}.push.${field} broke the tone contract`
      );
    }
  }
});

/**
 * Same tag replaces. `pushPayload.ts` added tags for exactly this and two kinds
 * still shared the `mw-nudge` fallback — a comeback nobody had opened could be
 * overwritten by the recap that followed it.
 */
/**
 * The signed-in comeback and the anonymous one are the same message.
 *
 * They reach the same athlete on the same day through two channels — the
 * anonymous path fires off a device row, the signed-in one off a user id — and
 * `decideNudge`'s comeback branch returns `anonymousComebackPush()` rather than
 * re-typing it. `.178`: the claim in that branch's comment is worth an assertion,
 * because a second copy would drift silently and nothing would render both.
 */
test('a comeback says the same thing whether or not you have an account', () => {
  const signedIn = everyKind().find((c) => c.kind === 'comeback');
  assert.ok(signedIn, 'comeback should fire');
  assert.deepEqual(signedIn.push, anonymousComebackPush());
});

test('each kind has its own notification tag', () => {
  const tags = everyPush().map((p) => p.push.tag);
  for (const t of tags) assert.match(t, /^mw-[a-z0-9-]+$/, `${t} is not a usable tag`);
  assert.equal(new Set(tags).size, tags.length, `tags collide: ${tags.join(', ')}`);
  assert.ok(!tags.includes('mw-nudge'), 'mw-nudge is the malformed-payload fallback, not a kind');
});

/**
 * **The defect this wave exists for**, asserted as a shape rather than a spelling.
 *
 * The send site used to build the push body as
 * `c.body.split('\n').find(l => l.trim()).slice(0, 140)`. `.212`'s rule says a
 * guard keyed to one spelling has only ever tested that spelling, so this does
 * not look for that expression: it asserts the *property* the expression
 * violated — a push body that is a slice of the email cannot say anything the
 * email's opening line did not.
 *
 * The `:` rule is the specific tell. `week1-recap`'s email opens *"Mission
 * Winning — your first week on the path:"*, a colon introducing two numbers on
 * the lines below. Truncation kept the promise and dropped the payload, which is
 * the reference app's *"A new article is out!"* with our words.
 */
test('a push says something the email\'s first line does not', () => {
  for (const c of everyKind()) {
    const firstLine = c.body.split('\n').find((l) => l.trim()) ?? '';
    assert.notEqual(
      c.push.body,
      firstLine.slice(0, 140),
      `${c.kind}: the push body is the email's first line — carry the what, not the that`
    );
    assert.ok(
      !c.body.includes(c.push.body),
      `${c.kind}: the push body appears verbatim inside the email, so it is a slice of it`
    );
  }
});

test('no push announces content it then withholds', () => {
  for (const { kind, push } of everyPush()) {
    assert.ok(push.body.trim().length > 0, `${kind}: empty push body`);
    assert.notEqual(push.body, push.title, `${kind}: the body only restates the title`);
    assert.ok(
      !push.body.trimEnd().endsWith(':'),
      `${kind}: the body ends on a colon, promising something it does not carry`
    );
  }
});

/**
 * The wiring, checked at the one place a slice could come back.
 *
 * The property test above cannot see the route — `decideNudge` could be perfect
 * while the send site kept re-deriving. Source text is all that is available
 * without a live Supabase, so this asserts the positive (the route sends
 * `c.push`) as well as the negative, because a negative alone passes on a file
 * that stopped sending pushes at all.
 */
test('the cron route sends the authored push, not a slice of the email', () => {
  const src = readFileSync(path.join(root, 'app/api/cron/nudges/route.ts'), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
  for (const field of ['title', 'body', 'tag']) {
    assert.match(code, new RegExp(`c\\.push\\.${field}`), `route does not send c.push.${field}`);
  }
  assert.doesNotMatch(code, /c\.body\s*\./, 'the route reads the email body to build the push again');
  assert.doesNotMatch(code, /slice\(0,\s*140\)/, 'the 140-char truncation is back');
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
