import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildTodayHeaderFocusLine } from './buildTodayHeaderFocusLine.ts';

describe('buildTodayHeaderFocusLine', () => {
  it('hides when showFocusLine is false', () => {
    assert.equal(
      buildTodayHeaderFocusLine({
        showFocusLine: false,
        focusLineBase: 'Chest focus — Prime',
        equipment: 'bodyweight',
        bodyweightTag: 'bodyweight',
      }),
      null
    );
  });

  it('appends bodyweight tag only for bodyweight equipment', () => {
    assert.equal(
      buildTodayHeaderFocusLine({
        showFocusLine: true,
        focusLineBase: 'Chest focus — Prime',
        equipment: 'full_gym',
        bodyweightTag: 'bodyweight',
      }),
      'Chest focus — Prime'
    );
    assert.equal(
      buildTodayHeaderFocusLine({
        showFocusLine: true,
        focusLineBase: 'Chest focus — Prime',
        equipment: 'bodyweight',
        bodyweightTag: 'bodyweight',
      }),
      'Chest focus — Prime · bodyweight'
    );
  });

  it('HomeTodayDashboard wires the helper (.430)', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'page-components', 'HomeTodayDashboard.tsx'),
      'utf8'
    );
    assert.match(src, /buildTodayHeaderFocusLine\(/);
    assert.doesNotMatch(src, /userEquip === 'bodyweight'/);
  });
});
