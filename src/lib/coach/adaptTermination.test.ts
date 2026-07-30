/**
 * Why the plan-changed listener cannot spin forever.
 *
 * `.207` — there is a cycle in the coach plan wiring, and it was held open by
 * the unconditional revision bump:
 *
 *     savePlan()                       storage.ts:29
 *       → dispatch 'mw-coach-plan-changed'
 *         → useCoachPlan listener      useCoachPlan.ts:105-107
 *           → refresh()
 *             → adaptPlan()            revision ALWAYS +1
 *               → next.revision !== existing.revision  → always true
 *                 → savePlan()         …round again
 *
 * `dispatchEvent` is synchronous, so this recurses on one stack. `HomeTodayDashboard`
 * mounts **two** `useCoachPlan()` consumers, and any `savePlan` while a listener
 * is attached — tapping "Adjust today", for instance — enters the cycle.
 *
 * **I did not execute this.** It needs a browser and a mounted React tree, and
 * neither is available in this lane; claiming a reproduction I did not run would
 * be worth less than saying so. What *is* verified is the property that makes
 * the cycle terminate, which is the same property the fix introduces:
 *
 *     adaptPlan(adaptPlan(p)) === adaptPlan(p), revision and all
 *
 * Once an unchanged week returns an unchanged revision, the `!==` guard at
 * `useCoachPlan.ts:86` is false on the second pass, `savePlan` is not called
 * again, and the cycle closes after one round — whether or not it was ever
 * unbounded in practice.
 *
 * Idempotence is worth pinning on its own merits anyway: an adapt that is not
 * idempotent means the plan a user sees depends on how many times a component
 * happened to mount.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildCoachContextFromInputs } from '@/lib/coach/contextBuilder';
import { generateWeek } from '@/lib/coach/planEngine';
import { adaptPlan } from '@/lib/coach/adapt';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function ctxFor(seedId: string) {
  return buildCoachContextFromInputs({
    history: [],
    experience: 'intermediate',
    equipment: 'full-gym',
    goal: 'goal:strength',
    daysPerWeek: 4,
    seedId,
  });
}

describe('adaptPlan termination', () => {
  /**
   * Every day of the week, not one. The cycle only had to be reachable on a
   * single day to be a real crash, and a spot check on Monday is exactly the
   * reading that let the always-Monday bug live.
   */
  it('reaches a fixed point on the first pass, on every day of the week', () => {
    const ctx = ctxFor('adapt-fixed-point');
    const plan = generateWeek(ctx, '2026-07-06');
    const days = ['06', '07', '08', '09', '10', '11', '12'];

    for (const dd of days) {
      const today = `2026-07-${dd}`;
      const once = adaptPlan(plan, ctx, today);
      const twice = adaptPlan(once, ctx, today);
      assert.equal(
        twice.revision,
        once.revision,
        `2026-07-${dd}: a second adapt bumped the revision again — ` +
          'that is the condition that keeps savePlan → dispatch → refresh → savePlan going'
      );
      assert.deepEqual(twice.sessions, once.sessions, `2026-07-${dd}: sessions changed on a re-adapt`);
    }
  });

  it('returns the very same object when there is nothing to do', () => {
    const ctx = ctxFor('adapt-identity');
    const plan = generateWeek(ctx, '2026-07-06');
    const once = adaptPlan(plan, ctx, '2026-07-06');
    assert.equal(
      adaptPlan(once, ctx, '2026-07-06'),
      once,
      'an unchanged week should be returned unchanged — identity is the cheapest possible proof ' +
        'to the caller that nothing happened'
    );
  });
});

describe('the cycle it protects', () => {
  /**
   * If either end of the cycle moves, the argument above stops applying. These
   * pin the shape so the reasoning in this file stays attached to the code.
   */
  it('savePlan still notifies, and useCoachPlan still listens', () => {
    assert.match(
      read('src/lib/coach/storage.ts'),
      /dispatchEvent\(new CustomEvent\('mw-coach-plan-changed'\)\)/,
      'savePlan no longer dispatches — re-read this file before trusting its argument'
    );
    assert.match(
      read('src/hooks/useCoachPlan.ts'),
      /addEventListener\('mw-coach-plan-changed'/,
      'useCoachPlan no longer listens — re-read this file before trusting its argument'
    );
  });

  it('the save is still guarded on a changed revision', () => {
    assert.match(
      read('src/hooks/useCoachPlan.ts'),
      /next\.revision !== existing\.revision/,
      'the revision guard is what turns adaptPlan idempotence into cycle termination'
    );
  });

  /** And the adapt is driven by a real clock, not by the start of the week. */
  it('the hook passes a real today', () => {
    const src = read('src/hooks/useCoachPlan.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');
    assert.doesNotMatch(
      src,
      /adaptPlan\([^)]*,\s*weekStart\s*\)/,
      'adaptPlan received weekStart as `today`, so the coach believed every day was Monday: ' +
        'missed sessions were never marked, and the low-readiness swap hit the wrong day'
    );
    assert.match(src, /adaptPlan\([^)]*localDateKey\(\)\)/);
  });
});
