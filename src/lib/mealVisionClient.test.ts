import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMealVisionJson } from './mealVisionClient.ts';

describe('parseMealVisionJson', () => {
  it('parses and clamps fields', () => {
    const e = parseMealVisionJson(
      'Here: {"name":"Chicken rice bowl","protein":40,"cals":520,"carbs":55,"fat":12,"confidence":0.8}'
    );
    assert.ok(e);
    assert.equal(e!.name, 'Chicken rice bowl');
    assert.equal(e!.protein, 40);
    assert.equal(e!.confidence, 0.8);
    assert.equal(e!.source, 'vision');
  });

  it('clamps absurd macros and long names', () => {
    const long = 'x'.repeat(100);
    const e = parseMealVisionJson(
      JSON.stringify({
        name: long,
        protein: 9999,
        cals: -5,
        carbs: 10,
        fat: 5,
        confidence: 150,
      })
    );
    assert.ok(e);
    assert.equal(e!.name.length, 80);
    assert.equal(e!.protein, 250);
    assert.equal(e!.cals, 0);
    assert.equal(e!.confidence, 1);
  });

  it('returns null on garbage', () => {
    assert.equal(parseMealVisionJson('not json'), null);
  });
});
