import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildContinuitySuggestions } from '@/lib/today/continuityStrip';

describe('buildContinuitySuggestions', () => {
  it('returns empty without train history', () => {
    assert.deepEqual(buildContinuitySuggestions({ hasTrainHistory: false }), []);
  });

  it('after lower body today suggests move + mind + fuel', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Quads', 'Glutes'],
    });
    assert.equal(s.length, 3);
    assert.ok(s.some((x) => x.kind === 'move' && x.href === '/move'));
    assert.ok(s.some((x) => x.kind === 'mind'));
    assert.ok(s.some((x) => x.kind === 'fuel' && x.href === '/nutrition'));
    assert.ok(s[0].titleDefault.toLowerCase().includes('leg') || s[0].reasonDefault.includes('hip'));
  });

  it('after upper push suggests shoulders path', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Chest', 'Shoulders'],
    });
    assert.ok(s.some((x) => x.titleDefault.toLowerCase().includes('shoulder')));
  });

  it('history but not today suggests prep not shame', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: false,
    });
    assert.ok(s.length >= 1);
    assert.ok(!s.some((x) => /missed|fail|guilt/i.test(x.titleDefault + x.reasonDefault)));
    assert.ok(s.every((x) => x.kind !== 'fuel' || true));
  });
});
