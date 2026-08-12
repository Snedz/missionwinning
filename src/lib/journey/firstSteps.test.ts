/**
 * The checklist encourages. It must never gate.
 *
 * `.223` cost the launch gate itself: `allBasicDone` was defined twice with
 * opposite bodies — `missionJourney.ts` returned `b.workout` (Horizon W: *"Basic
 * Training = first workout only. Other pillars stay free, not gated chores"*)
 * while `betaMetricsServer.ts` kept a private copy demanding all five pillars.
 * A tester who did everything the product asks read as Basic-incomplete on the
 * founder dashboard, and the gate deciding "are ten beta users ready" could not
 * go green however well the beta went.
 *
 * `.240` puts a six-item checklist on Today, five of whose items are exactly the
 * pillars that decision said are not gates. That is safe only for as long as
 * *complete* keeps meaning one thing. These rules say so executably, because the
 * pull to make a visible checklist into a requirement is the whole reason the
 * bug happened the first time.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { allBasicDone } from '@/lib/journey/basicComplete';
import { getFirstSteps, summarizeFirstSteps } from '@/lib/journey/firstSteps';
import type { JourneyState } from '@/lib/missionJourney';

const root = path.join(import.meta.dirname, '..', '..', '..');

function stateWith(basic: Partial<JourneyState['basic']>, parq = false): JourneyState {
  return {
    phase: 'basic',
    iDay: {},
    basic: { workout: false, fuel: false, move: false, mind: false, learn: false, ...basic },
    readiness: { parq, streakMet: false, winScoreSeen: true },
  };
}

test('the first workout alone still completes Basic, with the checklist barely started', () => {
  const s = stateWith({ workout: true });
  const progress = summarizeFirstSteps(getFirstSteps(s, { completedSessions: 1 }));

  assert.equal(
    allBasicDone(s.basic),
    true,
    'Basic Training is the first workout only — the checklist must not have changed that'
  );
  assert.ok(
    progress.done < progress.total,
    'and the checklist should still show work remaining, or it is not a checklist'
  );
  assert.equal(
    progress.next?.key,
    'session2',
    'after the first log, next is session 2 — not Fuel pillar tourism (.291)'
  );
});

test('an empty checklist never reports itself complete', () => {
  const progress = summarizeFirstSteps(getFirstSteps(stateWith({})));
  assert.equal(progress.done, 0);
  assert.equal(progress.complete, false);
  assert.ok(progress.next, 'a card with no next step has nothing to say and must not render');
});

test('F-004: before first workout the checklist is workout-only (no pillar options wall)', () => {
  const steps = getFirstSteps(stateWith({}));
  assert.deepEqual(
    steps.map((s) => s.key),
    ['workout'],
    'Fuel/Mind/Move/Learn/PAR-Q must wait until basic.workout — C5≤90s progressive disclosure'
  );
  assert.equal(summarizeFirstSteps(steps).next?.key, 'workout');
});

test('every step maps to a milestone the app already detects', () => {
  // Discovering, not enumerating: each step's `done` must actually respond to
  // the state it claims to read. A step wired to nothing would sit unchecked
  // forever and the athlete would never learn why.
  // session2 + pillars only mount after first workout — compare by key, not index.
  const all = getFirstSteps(
    stateWith({ workout: true, fuel: true, move: true, mind: true, learn: true }, true),
    { completedSessions: 2 }
  );
  const none = getFirstSteps(stateWith({}, false));
  const byKey = (steps: ReturnType<typeof getFirstSteps>, key: string) =>
    steps.find((s) => s.key === key);

  for (const step of all) {
    assert.equal(step.done, true, `step '${step.key}' never reads as done`);
  }
  for (const step of none) {
    assert.equal(step.done, false, `step '${step.key}' is done even with nothing logged`);
  }
  assert.ok(byKey(all, 'session2')?.done, 'session2 complete at 2 sessions');
  assert.equal(byKey(none, 'session2'), undefined, 'session2 absent before first workout');
  assert.equal(byKey(none, 'fuel'), undefined, 'pillar steps absent before first workout (F-004)');
  assert.equal(summarizeFirstSteps(all).complete, true);
});

test('every step carries a reason, not just a label', () => {
  // After first workout the full discovery list is present — reason lines matter there.
  for (const step of getFirstSteps(stateWith({ workout: true }), { completedSessions: 1 })) {
    assert.ok(
      step.why.trim().length > 30,
      `step '${step.key}' has no real reason line — the reason is the difference between ` +
        `a checklist someone finishes and a chore list they dismiss`
    );
    assert.ok(step.titleKey && step.whyKey, `step '${step.key}' is missing its i18n keys`);
  }
});

/**
 * The structural half. A future edit that makes `basicComplete` consult the
 * checklist would reintroduce `.223` exactly, and no unit assertion above would
 * notice — the two modules would simply agree on the wrong thing.
 */
test('basicComplete stays independent of the checklist', () => {
  const src = readFileSync(path.join(root, 'src/lib/journey/basicComplete.ts'), 'utf8');
  assert.doesNotMatch(
    src,
    /firstSteps/i,
    'basicComplete must not import or mention the checklist — it is the one definition of ' +
      'complete, and .223 is what happens when that answer has two sources'
  );
});
