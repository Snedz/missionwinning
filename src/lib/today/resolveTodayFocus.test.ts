import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeReadinessFromHistory } from '@/lib/readinessIndex';
import { normalizeCoachFocusGroup, resolveTodayRecommendedFocus } from '@/lib/today/resolveTodayFocus';

describe('normalizeCoachFocusGroup', () => {
  it('maps seed-plan lowercase groups to major groups', () => {
    assert.equal(normalizeCoachFocusGroup('quads'), 'Legs');
    assert.equal(normalizeCoachFocusGroup('Chest'), 'Chest');
  });
});

describe('resolveTodayRecommendedFocus', () => {
  it('prefers live coach session focus over readiness guess', () => {
    const readiness = computeReadinessFromHistory([]);
    const focus = resolveTodayRecommendedFocus(readiness, {
      focusGroups: ['Legs'],
    });
    assert.equal(focus.group, 'Legs');
  });
});
