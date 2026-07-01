import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_EQUIPMENT,
  equipmentLibraryFilter,
  isBodyweightFirst,
  trainLocationSuggestsBodyweight,
} from './equipmentPrefs.ts';

describe('equipmentPrefs', () => {
  it('defaults to bodyweight', () => {
    assert.equal(DEFAULT_EQUIPMENT, 'bodyweight');
    assert.equal(isBodyweightFirst('bodyweight'), true);
    assert.equal(isBodyweightFirst('full-gym'), false);
  });

  it('maps library filter tokens', () => {
    assert.equal(equipmentLibraryFilter('bodyweight'), 'bodyweight');
    assert.equal(equipmentLibraryFilter('dumbbells'), 'dumbbell');
    assert.equal(equipmentLibraryFilter('full-gym'), '');
  });

  it('rural train locations suggest bodyweight', () => {
    assert.equal(trainLocationSuggestsBodyweight('village'), true);
    assert.equal(trainLocationSuggestsBodyweight('school'), true);
    assert.equal(trainLocationSuggestsBodyweight('gym'), false);
  });
});
