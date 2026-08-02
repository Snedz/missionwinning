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
 * `.225` puts a six-item checklist on Today, five of whose items are exactly the
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
  const progress = summarizeFirstSteps(getFirstSteps(s));

  assert.equal(
    allBasicDone(s.basic),
    true,
    'Basic Training is the first workout only — the checklist must not have changed that'
  );
  assert.ok(
    progress.done < progress.total,
    'and the checklist should still show work remaining, or it is not a checklist'
  );
});

test('an empty checklist never reports itself complete', () => {
  const progress = summarizeFirstSteps(getFirstSteps(stateWith({})));
  assert.equal(progress.done, 0);
  assert.equal(progress.complete, false);
  assert.ok(progress.next, 'a card with no next step has nothing to say and must not render');
});

test('every step maps to a milestone the app already detects', () => {
  // Discovering, not enumerating: each step's `done` must actually respond to
  // the state it claims to read. A step wired to nothing would sit unchecked
  // forever and the athlete would never learn why.
  const all = getFirstSteps(
    stateWith({ workout: true, fuel: true, move: true, mind: true, learn: true }, true)
  );
  const none = getFirstSteps(stateWith({}, false));

  for (let i = 0; i < all.length; i++) {
    assert.equal(all[i]!.done, true, `step '${all[i]!.key}' never reads as done`);
    assert.equal(none[i]!.done, false, `step '${none[i]!.key}' is done even with nothing logged`);
  }
  assert.equal(summarizeFirstSteps(all).complete, true);
});

test('every step carries a reason, not just a label', () => {
  for (const step of getFirstSteps(stateWith({}))) {
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
