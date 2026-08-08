import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { coachSessionTemplates, resolveCoachSessionStart } from '@/lib/coach/coachSessionStart';
import { coachAdaptReentryIsPrescribed, coachAdaptReentrySession } from '@/lib/coach/coachAdaptReentry';
import type { PlanSession } from '@/lib/coach/types';

/**
 * A button that says "start" has to start something, with the dose it promised.
 *
 * Two defects, one shape — a start CTA that navigates instead of starting:
 *
 *   - `CoachAdaptBanner` rendered "Start this session" as `<Link href="/active">`.
 *     `/active` with no active workout renders `ActiveEmptyState` ("No session
 *     running"), so the one red control on the re-entry banner was a dead end.
 *   - The re-entry dose was applied in exactly **one** of the four places a coach
 *     session can start. `TodayReentryCard` promises "about 50% of usual sets" —
 *     its own header says the card "must not promise lighter without applying
 *     it" — and the Coach card directly beneath it started the full session.
 *
 * Four call sites and one rule is `.178`. The rule now lives in
 * `coachSessionTemplates` + `useStartCoachSession`, and the last test here is a
 * discovery guard so a *fifth* caller cannot quietly reintroduce the raw path.
 */

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

function session(setsPerExercise = 4): PlanSession {
  return {
    dayOffset: 0,
    name: 'Push',
    kind: 'strength',
    status: 'planned',
    estMinutes: 40,
    focusGroups: [],
    exercises: [
      { exerciseId: 'bench-press', sets: setsPerExercise, reps: 8, weight: 60 },
      { exerciseId: 'push-ups', sets: setsPerExercise, reps: 10, weight: 0 },
    ],
  } as unknown as PlanSession;
}

describe('coachSessionTemplates', () => {
  it('leaves a full session alone when there is no re-entry', () => {
    const full = coachSessionTemplates(session(4), 1);
    assert.deepEqual(
      full.map((e) => e.sets.length),
      [4, 4],
      'an athlete who missed nothing must not get a quietly eased session'
    );
  });

  it('applies the dose the re-entry card promised', () => {
    // 0.5 is the `lapsed` / `long-gap` scale in reentry.ts — the one the card
    // renders as "about 50% of usual sets".
    const eased = coachSessionTemplates(session(4), 0.5);
    assert.deepEqual(
      eased.map((e) => e.sets.length),
      [2, 2],
      'the promise on TodayReentryCard and the session that starts must be the same number'
    );
  });

  it('never eases a session down to nothing', () => {
    const eased = coachSessionTemplates(session(1), 0.5);
    assert.deepEqual(
      eased.map((e) => e.sets.length),
      [1, 1],
      'a session with no sets is not a lighter session, it is no session'
    );
  });

  it('keeps the coach prescription intact while trimming', () => {
    const eased = coachSessionTemplates(session(4), 0.5);
    assert.ok(
      eased.every((e) => e.prescribed === true),
      'trimming set count must not turn a prescribed session into a freestyle one'
    );
  });
});

describe('coachAdaptReentrySession', () => {
  const plan = {
    sessions: [
      { dayOffset: 0, status: 'done', exercises: [{}] },
      { dayOffset: 1, status: 'planned', exercises: [{}] },
      { dayOffset: 2, status: 'planned', exercises: [] },
    ],
  };

  it('returns the very session the label is advertising', () => {
    assert.equal(coachAdaptReentrySession(plan, 1)?.dayOffset, 1);
  });

  it('returns nothing when the day is done, empty, or unknown', () => {
    assert.equal(coachAdaptReentrySession(plan, 0), null, 'a finished day is not restartable');
    assert.equal(coachAdaptReentrySession(plan, 2), null, 'a session with no exercises is not one');
    assert.equal(coachAdaptReentrySession(plan, undefined), null);
  });

  it('is the same decision the label is chosen by', () => {
    // The predicate used to be a second, independent copy of this search. Two
    // copies is how the button came to say "Start this session" about a session
    // it could not name, let alone start.
    for (const offset of [0, 1, 2, undefined, 99]) {
      assert.equal(
        coachAdaptReentryIsPrescribed(plan, offset),
        coachAdaptReentrySession(plan, offset) !== null,
        `label and target disagree at offset ${String(offset)}`
      );
    }
  });
});

describe('every coach start goes through the one path', () => {
  /**
   * Discovered, not enumerated. The defect was that three components each built
   * this by hand and each forgot something different, so listing the three we
   * fixed would guard exactly the code that is already correct.
   */
  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(path.join(root, dir))) {
      const rel = `${dir}/${entry}`;
      if (statSync(path.join(root, rel)).isDirectory()) walk(rel, out);
      else if (/\.tsx$/.test(entry)) out.push(rel);
    }
    return out;
  }

  /**
   * Components allowed to build templates directly, each with a reason.
   * `useStartCoachSession` is the hook the rule exists to funnel through;
   * `todayPrimaryAction` is pure logic that already applies the dose itself and
   * is unit-tested for it.
   */
  const DIRECT_OK: { file: string; reason: string }[] = [];

  it('no component calls planSessionToTemplates raw', () => {
    const files = [...walk('src/components'), ...walk('src/page-components')];
    assert.ok(files.length > 100, `only walked ${files.length} files — the walk has stopped finding components`);

    const offenders = files.filter(
      (f) =>
        /planSessionToTemplates\s*\(/.test(stripComments(read(f))) &&
        !DIRECT_OK.some((d) => d.file === f)
    );
    assert.deepEqual(
      offenders,
      [],
      'these build coach templates without the re-entry dose — call `useStartCoachSession` instead, ' +
        `or add a DIRECT_OK row saying why not:\n  ${offenders.join('\n  ')}`
    );
  });

  it('every DIRECT_OK row is in scope, live, and reasoned', () => {
    const walked = new Set([...walk('src/components'), ...walk('src/page-components')]);
    for (const { file, reason } of DIRECT_OK) {
      assert.ok(reason.trim().length > 0, `${file} has no reason`);
      // An exemption for a file the walk never visits exempts nothing and reads
      // like coverage — the shape that let `outboxResilience`'s LEAKY list guard
      // six of sixty-nine routes.
      assert.ok(walked.has(file), `${file} is exempted but the walk never checks it — the row is theatre`);
      // A row for a file that no longer does the thing makes the list cheaper to
      // add to, which is how an exemption list stops meaning anything.
      assert.match(
        stripComments(read(file)),
        /planSessionToTemplates/,
        `${file} is exempted but no longer builds coach templates — delete the row`
      );
    }
  });

  it('the funnel resolves through the tested decision rather than its own', () => {
    const hook = stripComments(read('src/hooks/useStartCoachSession.ts'));
    assert.match(
      hook,
      /resolveCoachSessionStart\(/,
      'the hook must go through the pure resolver — a branch written inside the hook is a branch ' +
        'no unit test can reach'
    );
    assert.doesNotMatch(
      hook,
      /status\s*===\s*['"]done['"]/,
      'the done guard belongs in the resolver, where it is tested once for every caller'
    );
  });
});

/**
 * The decision the hook used to own. Pure, so the `done` guard and the dose read
 * are covered for every caller at once rather than per component — which is how
 * three components came to have three different ideas of what starting means.
 */
describe('resolveCoachSessionStart', () => {
  const noHistory: never[] = [];
  // Relative to now, never a literal — a fixture with a date in it has an expiry date.
  const now = Date.UTC(2020, 0, 15);
  const daysAgo = (n: number) =>
    [{ completedAt: new Date(now - n * 86_400_000).toISOString() }] as never;

  it('refuses a session that is already done', () => {
    const done = { ...session(3), status: 'done' } as PlanSession;
    assert.equal(
      resolveCoachSessionStart(done, noHistory, now),
      null,
      'a finished session is not restartable — this guard existed in only one of three callers'
    );
  });

  it('refuses nothing at all', () => {
    assert.equal(resolveCoachSessionStart(null, noHistory, now), null);
    assert.equal(resolveCoachSessionStart(undefined, noHistory, now), null);
  });

  it('starts a full session for an athlete who has not lapsed', () => {
    const start = resolveCoachSessionStart(session(4), daysAgo(1), now);
    assert.ok(start);
    assert.equal(start.doseScale, 1);
    assert.deepEqual(start.templates.map((e) => e.sets.length), [4, 4]);
    assert.equal(start.name, 'Push');
  });

  it('eases the session for an athlete coming back from a gap', () => {
    // 20 days out is `long-gap` in reentry.ts — doseScale 0.5.
    const start = resolveCoachSessionStart(session(4), daysAgo(20), now);
    assert.ok(start);
    assert.equal(start.doseScale, 0.5);
    assert.deepEqual(
      start.templates.map((e) => e.sets.length),
      [2, 2],
      'the eased session is what starts, not just what the card claimed'
    );
  });
});
