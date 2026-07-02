import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  readTextScale,
  textScaleClass,
  TEXT_SCALE_OPTIONS,
} from './textScalePrefs';

describe('textScalePrefs', () => {
  it('defines four scale options', () => {
    assert.deepEqual([...TEXT_SCALE_OPTIONS], ['sm', 'default', 'lg', 'xl']);
  });

  it('maps scale to css class', () => {
    assert.equal(textScaleClass('lg'), 'text-scale-lg');
    assert.equal(textScaleClass('default'), 'text-scale-default');
  });

  it('defaults to default when unset', () => {
    assert.equal(readTextScale(), 'default');
  });
});
