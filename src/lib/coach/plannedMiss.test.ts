/**
 * Planned-miss offer — no plan means no chrome; skip is not a fail identity.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  applyPlannedMissSkip,
  applyPlannedMissSlide,
  findPlannedMiss,
  type PlannedMissPlan,
  type PlannedMissSession,
} from '@/lib/coach/plannedMiss';

function session(
  id: string,
  dayOffset: number,
  status: PlannedMissSession['status'] = 'planned'
): PlannedMissSession {
  return { id, dayOffset, status };
}

function plan(
  sessions: PlannedMissSession[],
  extra: Partial<PlannedMissPlan> = {}
): PlannedMissPlan {
  return { weekStart: 'this-week', revision: 1, sessions, ...extra };
}

test('no plan and no overdue day are not re-entry chrome', () => {
  assert.equal(findPlannedMiss(null, 3).show, false);
  assert.equal(findPlannedMiss(undefined, 3).show, false);
  assert.equal(findPlannedMiss(plan([]), 3).show, false);
  assert.equal(
    findPlannedMiss(plan([session('wed', 2), session('fri', 4)]), 0).show,
    false,
    'Monday: nothing is overdue'
  );
  assert.equal(
    findPlannedMiss(plan([session('mon', 0, 'done'), session('wed', 2)]), 1).show,
    false,
    'a done yesterday is not a miss'
  );
  assert.equal(
    findPlannedMiss(plan([session('mon', 0)], { weekStart: 'last-week' }), 3, {
      weekStart: 'this-week',
    }).show,
    false,
    'a stale week is not this week\'s hole'
  );
});

test('one missed planned day is a skippable offer', () => {
  const overduePlanned = findPlannedMiss(plan([session('mon', 0), session('thu', 3)]), 2);
  assert.equal(overduePlanned.show, true);
  assert.equal(overduePlanned.session?.id, 'mon');
  assert.equal(overduePlanned.canSlide, true);

  const alreadyMissed = findPlannedMiss(
    plan([session('mon', 0, 'missed'), session('thu', 3)]),
    2
  );
  assert.equal(alreadyMissed.show, true);
  assert.equal(alreadyMissed.session?.id, 'mon');

  const twoHoles = findPlannedMiss(
    plan([session('mon', 0, 'missed'), session('tue', 1, 'planned')]),
    3
  );
  assert.equal(twoHoles.show, true);
  assert.equal(twoHoles.session?.id, 'mon', 'one prompt — the earliest day, not a stack');
});

test('skip removes the session and does not invent a fail identity', () => {
  const before = plan([session('mon', 0, 'planned'), session('thu', 3, 'planned')]);
  const after = applyPlannedMissSkip(before, 'mon');

  assert.equal(after.sessions.length, 1);
  assert.equal(after.sessions[0]?.id, 'thu');
  assert.equal(after.revision, before.revision + 1);
  assert.equal(
    after.sessions.some((s) => s.status === 'missed'),
    false,
    'skip must not stamp missed'
  );
  assert.deepEqual(
    after.sessions[0],
    before.sessions[1],
    'the remaining day is untouched — skip is not a verdict on the week'
  );

  const src = readFileSync(join(import.meta.dirname, 'plannedMiss.ts'), 'utf8');
  const skipFn = src.slice(src.indexOf('export function applyPlannedMissSkip'));
  const skipBody = skipFn.slice(0, skipFn.indexOf('export function applyPlannedMissSlide'));
  assert.doesNotMatch(
    skipBody,
    /status:\s*['"]missed['"]/,
    'skip writing status missed is the fail-identity mutant'
  );
  assert.doesNotMatch(skipBody, /failed|streak|shame/i);

  const offerAfter = findPlannedMiss(after, 2);
  assert.equal(offerAfter.show, false, 'after skip the prompt is gone');
});

test('Today planned-miss wiring does not auto-generate a week', () => {
  const hook = readFileSync(join(import.meta.dirname, '..', '..', 'hooks', 'usePlannedMissOffer.ts'), 'utf8');
  assert.match(hook, /loadPlan\(/);
  assert.doesNotMatch(
    hook,
    /from ['"]@\/hooks\/useCoachPlan['"]/,
    'importing useCoachPlan would auto-generate a week — Today must only read the stored plan'
  );
});

test('slide lands planned on the next empty day', () => {
  const before = plan([session('mon', 0, 'missed'), session('thu', 3)]);
  const slid = applyPlannedMissSlide(before, 'mon', 2);
  const moved = slid.sessions.find((s) => s.id === 'mon');
  assert.equal(moved?.dayOffset, 2, 'Tuesday is empty — slide there, not invent a day');
  assert.equal(moved?.status, 'planned');
  assert.equal(slid.revision, before.revision + 1);
  assert.equal(findPlannedMiss(slid, 2).show, false);

  const packed = plan([
    session('mon', 0, 'missed'),
    session('tue', 2),
    session('wed', 3),
    session('thu', 4),
    session('fri', 5),
    session('sat', 6),
  ]);
  assert.equal(findPlannedMiss(packed, 2).canSlide, false);
  assert.equal(applyPlannedMissSlide(packed, 'mon', 2), packed);
});
