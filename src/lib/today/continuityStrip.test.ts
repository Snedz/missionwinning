import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContinuitySuggestions,
  pickContinuityNextAction,
} from '@/lib/today/continuityStrip';

describe('buildContinuitySuggestions', () => {
  it('returns empty without train history', () => {
    assert.deepEqual(buildContinuitySuggestions({ hasTrainHistory: false }), []);
  });

  it('after lower body today deep-links move recover-after-lower', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Quads', 'Glutes'],
    });
    assert.equal(s.length, 3);
    const move = s.find((x) => x.kind === 'move');
    assert.ok(move);
    assert.equal(move!.href, '/move?collection=recover-after-lower');
    assert.equal(move!.collectionId, 'recover-after-lower');
    assert.ok(s.some((x) => x.kind === 'mind' && x.href.includes('post-train')));
    assert.ok(s.some((x) => x.kind === 'fuel' && x.href === '/nutrition'));
  });

  it('after upper push deep-links shoulders collection', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Chest', 'Shoulders'],
    });
    const move = s.find((x) => x.kind === 'move');
    assert.ok(move);
    assert.equal(move!.href, '/move?collection=shoulders');
    assert.ok(s.some((x) => x.titleDefault.toLowerCase().includes('shoulder')));
  });

  it('protein gap prioritizes fuel first', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Chest'],
      proteinGapG: 55,
    });
    assert.equal(s[0]?.kind, 'fuel');
    assert.ok(s.length <= 3);
    assert.equal(s.filter((x) => x.kind === 'fuel').length, 1);
  });

  it('history but not today suggests prep collections not shame', () => {
    const s = buildContinuitySuggestions({
      hasTrainHistory: true,
      trainedToday: false,
    });
    assert.ok(s.length >= 1);
    assert.ok(!s.some((x) => /missed|fail|guilt/i.test(x.titleDefault + x.reasonDefault)));
    assert.ok(s.some((x) => x.href.includes('pre-session') || x.href.includes('pre-lift')));
  });
});

describe('pickContinuityNextAction', () => {
  it('returns null without history', () => {
    assert.equal(pickContinuityNextAction({ hasTrainHistory: false }), null);
  });

  it('returns first suggestion when history exists', () => {
    const a = pickContinuityNextAction({
      hasTrainHistory: true,
      trainedToday: true,
      lastFocusGroups: ['Quads'],
    });
    assert.ok(a);
    assert.equal(a!.kind, 'move');
  });
});
