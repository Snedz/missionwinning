import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { resolveCoachBossSessionId } from '@/lib/coach/resolveCoachBossSessionId';

describe('resolveCoachBossSessionId', () => {
  const week = [
    { id: 'mon', dayOffset: 0, status: 'done' },
    { id: 'tue', dayOffset: 1, status: 'pending' },
    { id: 'wed', dayOffset: 2, status: 'pending' },
    { id: 'fri', dayOffset: 4, status: 'pending' },
  ];

  it('prefers today when that session is still pending', () => {
    assert.equal(resolveCoachBossSessionId(week, 1), 'tue');
  });

  it('skips done today and picks the next upcoming pending', () => {
    assert.equal(resolveCoachBossSessionId(week, 0), 'tue');
  });

  it('on a rest day in the middle, picks next pending at or after today', () => {
    assert.equal(resolveCoachBossSessionId(week, 3), 'fri');
  });

  it('returns undefined when every session is done', () => {
    assert.equal(
      resolveCoachBossSessionId(
        [
          { id: 'a', dayOffset: 0, status: 'done' },
          { id: 'b', dayOffset: 2, status: 'done' },
        ],
        1
      ),
      undefined
    );
  });

  it('CoachPlanSessionGrid uses resolveCoachBossSessionId and PlanSessionCard', () => {
    const grid = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'coach', 'CoachPlanSessionGrid.tsx'),
      'utf8'
    );
    const page = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'CoachPage.tsx'),
      'utf8'
    );
    assert.match(grid, /resolveCoachBossSessionId\(/);
    assert.match(grid, /PlanSessionCard/);
    assert.match(grid, /isPrimaryStart=\{session\.id === bossId\}/);
    assert.match(page, /CoachPlanSessionGrid/);
    assert.doesNotMatch(
      page,
      /todayPending\s*\?\?/,
      'boss pick must stay inside resolveCoachBossSessionId'
    );
    assert.doesNotMatch(
      page,
      /<PlanSessionCard/,
      'session cards live in CoachPlanSessionGrid'
    );
  });
});
