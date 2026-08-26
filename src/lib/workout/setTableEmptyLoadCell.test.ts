/**
 * Completed set-table load cell is BW, not 0 (.1025).
 * Cites already print 8 × BW. The kg cell still painted stored weight 0.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { formatCompletedWeightCell } from './bodyweightLoad.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('completed set-table load cell is BW, not 0 (.1025)', () => {
  it('weight-type empty load is BW, not 0', () => {
    assert.equal(formatCompletedWeightCell(0, 'BW', false), 'BW');
    assert.equal(formatCompletedWeightCell(-0, 'BW', false), 'BW');
  });

  it('plus-load empty is BW; extra is BW+N', () => {
    assert.equal(formatCompletedWeightCell(0, 'BW', true), 'BW');
    assert.equal(formatCompletedWeightCell(20, 'BW', true), 'BW+20');
  });

  it('loaded barbell stays the number, not BW+80', () => {
    assert.equal(formatCompletedWeightCell(80, 'BW', false), '80');
  });

  it('SetLogTable uses the helper — no raw completed 0 interpolator', () => {
    const table = read('src/components/workout/SetLogTable.tsx');
    assert.match(table, /formatCompletedWeightCell/);
    assert.doesNotMatch(table, /: plusLoad\s*\?[\s\S]*: set\.weight/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
