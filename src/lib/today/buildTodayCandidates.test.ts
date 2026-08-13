import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildTodayCandidates, type BuildTodayCandidatesInput } from './buildTodayCandidates.ts';
import { planTodayBlocks } from './todayBlockBudget.ts';
import { TODAY_BLOCK_PRIORITY } from './todayBlockPriority.ts';

function densestEvening(overrides: Partial<BuildTodayCandidatesInput> = {}): BuildTodayCandidatesInput {
  return {
    phase: 'commissioned',
    firstStepsDismissed: false,
    reentryShow: true,
    showDashboard: true,
    belowFoldReady: true,
    totalSessions: 12,
    streak: 3,
    hour: 19,
    weekRecap: { hasActivity: true, isWeekEnd: true },
    ...overrides,
  };
}

describe('buildTodayCandidates', () => {
  it('pins only beta, header, and reentry when they mount', () => {
    const specs = buildTodayCandidates(densestEvening());
    for (const s of specs) {
      if (s.key === 'beta' || s.key === 'header' || s.key === 'reentry') {
        assert.equal(s.pinned, true, `${s.key} must be pinned`);
      } else {
        assert.equal(s.pinned, undefined, `${s.key} must not be pinned`);
      }
    }
  });

  it('uses TODAY_BLOCK_PRIORITY for every key — no literal prices', () => {
    const specs = buildTodayCandidates(densestEvening());
    for (const s of specs) {
      assert.equal(s.priority, TODAY_BLOCK_PRIORITY[s.key]);
    }
  });

  it('commissioned dense evening declaration order', () => {
    const keys = buildTodayCandidates(densestEvening()).map((s) => s.key);
    assert.deepEqual(keys, [
      'beta',
      'header',
      'intent',
      'reentry',
      'continuity',
      'dashboard',
      'freshness',
      'day-review',
      'week-recap',
      'coach-week',
      'coach-today',
      'guidebook',
    ]);
  });

  it('phase masks: basic never gets coach-today/week/dashboard; commissioned never invite', () => {
    const basic = buildTodayCandidates(
      densestEvening({
        phase: 'basic',
        showDashboard: false,
        reentryShow: false,
        firstStepsDismissed: true,
        totalSessions: 2,
        streak: 0,
      })
    ).map((s) => s.key);
    assert.ok(!basic.includes('coach-today'));
    assert.ok(!basic.includes('coach-week'));
    assert.ok(!basic.includes('dashboard'));
    assert.ok(basic.includes('coach-invite'));
    assert.ok(basic.includes('encourage'));

    // Flow-7 / K3 — early readiness, no plan: invite only (not empty week strip).
    const readinessEarly = buildTodayCandidates(
      densestEvening({
        phase: 'readiness',
        showDashboard: true,
        reentryShow: false,
        firstStepsDismissed: true,
        totalSessions: 1,
        streak: 0,
        hasCoachPlan: false,
      })
    ).map((s) => s.key);
    assert.ok(readinessEarly.includes('coach-invite'));
    assert.ok(!readinessEarly.includes('coach-week'), 'empty week twins invite');

    // K3 — plan present: week strip, not invite.
    const readinessWithPlan = buildTodayCandidates(
      densestEvening({
        phase: 'readiness',
        showDashboard: true,
        reentryShow: false,
        firstStepsDismissed: true,
        totalSessions: 2,
        streak: 0,
        hasCoachPlan: true,
      })
    ).map((s) => s.key);
    assert.ok(readinessWithPlan.includes('coach-week'));
    assert.ok(!readinessWithPlan.includes('coach-invite'));

    const commissioned = buildTodayCandidates(densestEvening()).map((s) => s.key);
    assert.ok(!commissioned.includes('coach-invite'));
    assert.ok(commissioned.includes('coach-today'));
    assert.ok(commissioned.includes('coach-week'));
  });

  it('densest evening keeps session+week on top; dashboard spills', () => {
    const specs = buildTodayCandidates(densestEvening());
    const plan = planTodayBlocks(specs.map((s) => ({ ...s, node: s.key })));
    const top = plan.top.map((b) => b.key);
    const more = plan.inMore.map((b) => b.key);
    assert.ok(top.includes('coach-today'), 'session must stay above the fold');
    assert.ok(top.includes('coach-week'), 'week must stay with the session');
    assert.ok(more.includes('dashboard'), 'Mission Score spills on densest evening');
  });

  it('hides re-entry while a session is already open', () => {
    const specs = buildTodayCandidates(densestEvening({ sessionOpen: true }));
    assert.ok(
      !specs.some((s) => s.key === 'reentry'),
      'a live session is not a return — the missed-day line must not mount'
    );
  });

  it('HomeTodayDashboard builds from buildTodayCandidates rather than a second ladder', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayDashboard.tsx'),
      'utf8'
    );
    assert.match(src, /buildTodayCandidates\(/);
    assert.doesNotMatch(
      src,
      /staggerBlocks\.push\(\{\s*key:\s*'coach-today'/,
      'coach-today mount must stay inside buildTodayCandidates'
    );
  });
});
