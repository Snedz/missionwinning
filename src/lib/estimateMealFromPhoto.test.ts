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
});
