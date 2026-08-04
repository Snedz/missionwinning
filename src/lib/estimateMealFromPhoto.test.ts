import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateMealFromSignals, matchMealTemplate, portionScaleFromBytes } from '@/lib/estimateMealFromPhoto';

describe('estimateMealFromPhoto', () => {
  it('matches filename keywords', () => {
    const t = matchMealTemplate('my-chicken-lunch.jpg');
    assert.match(t.name, /chicken/i);
  });

  it('uses palette hints when filename is generic', () => {
    const t = matchMealTemplate('IMG_1234.jpg', { palette: 'green' });
    assert.match(t.name, /salad/i);
  });

  it('scales macros by file size', () => {
    const small = estimateMealFromSignals('chicken.jpg', 50 * 1024);
    const large = estimateMealFromSignals('chicken.jpg', 500 * 1024);
    assert.ok(large.protein > small.protein);
  });

  it('portion scale bounds', () => {
    assert.equal(portionScaleFromBytes(50 * 1024), 0.75);
    assert.equal(portionScaleFromBytes(200 * 1024), 1);
    assert.equal(portionScaleFromBytes(500 * 1024), 1.25);
  });

  it('labels color-only guesses honestly and never marks them high', () => {
    const colorOnly = estimateMealFromSignals('IMG_9999.jpg', 200 * 1024, { palette: 'green' });
    assert.match(colorOnly.name, /color guess/i);
    assert.equal(colorOnly.confidence, 'low');
    assert.equal(colorOnly.source, 'heuristic');
  });

  it('filename match is medium at most — heuristic never claims high', () => {
    const both = estimateMealFromSignals('salad-bowl.jpg', 200 * 1024, { palette: 'green' });
    assert.equal(both.confidence, 'medium');
    assert.equal(both.source, 'heuristic');
    assert.doesNotMatch(both.name, /color guess/i);
    const nameOnly = estimateMealFromSignals('chicken-dinner.jpg', 200 * 1024);
    assert.equal(nameOnly.confidence, 'medium');
    assert.notEqual(nameOnly.confidence, 'high');
  });

  it('fallback with no signal stays low', () => {
    const plain = estimateMealFromSignals('IMG_0001.jpg', 200 * 1024);
    assert.equal(plain.confidence, 'low');
    assert.equal(plain.source, 'heuristic');
  });
});
