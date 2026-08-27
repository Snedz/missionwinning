/**
 * Open set-row empty load is blank, not 0 (.1048).
 * Store stays 0. Display only. Does not mention BW as a stored kilogram.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  clampOpenLoadWeight,
  displayOpenLoadDraft,
  formatOpenLoadInput,
  parseOpenLoadInput,
} from './openEmptyLoad.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('open empty load is blank, not 0 (.1048)', () => {
  it('0 / missing / non-finite format to blank', () => {
    assert.equal(formatOpenLoadInput(0), '');
    assert.equal(formatOpenLoadInput(-0), '');
    assert.equal(formatOpenLoadInput(undefined), '');
    assert.equal(formatOpenLoadInput(null), '');
    assert.equal(formatOpenLoadInput(Number.NaN), '');
    assert.equal(formatOpenLoadInput(Number.POSITIVE_INFINITY), '');
    assert.equal(formatOpenLoadInput(''), '');
  });

  it('typed load stays the number string — 60 → 60', () => {
    assert.equal(formatOpenLoadInput(60), '60');
    assert.equal(formatOpenLoadInput(80.5), '80.5');
    assert.equal(formatOpenLoadInput(20), '20');
  });

  it('blank parse → 0; junk → 0; store path still 0', () => {
    assert.equal(parseOpenLoadInput(''), 0);
    assert.equal(parseOpenLoadInput('   '), 0);
    assert.equal(parseOpenLoadInput(null), 0);
    assert.equal(parseOpenLoadInput(undefined), 0);
    assert.equal(parseOpenLoadInput('nope'), 0);
    assert.equal(parseOpenLoadInput('BW'), 0);
    assert.equal(parseOpenLoadInput(0), 0);
    const stored = { weight: parseOpenLoadInput('') };
    assert.equal(stored.weight, 0);
  });

  it('typed parse keeps the number; does not clamp past table min/max', () => {
    assert.equal(parseOpenLoadInput('60'), 60);
    assert.equal(parseOpenLoadInput(' 40.5 '), 40.5);
    assert.equal(parseOpenLoadInput('80,5'), 80.5);
    assert.equal(parseOpenLoadInput('10000'), 10000);
  });

  it('partial decimals parse to the store without claiming they format back', () => {
    assert.equal(parseOpenLoadInput('.'), 0);
    assert.equal(parseOpenLoadInput('0.'), 0);
    assert.equal(parseOpenLoadInput('60.'), 60);
    assert.equal(parseOpenLoadInput('80,'), 80);
    assert.equal(parseOpenLoadInput('2.5'), 2.5);
    assert.equal(formatOpenLoadInput(parseOpenLoadInput('0.')), '');
    assert.equal(formatOpenLoadInput(parseOpenLoadInput('.')), '');
    assert.equal(formatOpenLoadInput(parseOpenLoadInput('60.')), '60');
    assert.equal(formatOpenLoadInput(parseOpenLoadInput('80,')), '80');
    assert.equal(formatOpenLoadInput(parseOpenLoadInput('2.5')), '2.5');
  });

  it('focused draft keeps 0. / 60. / 80, / . visible; unfocused empty is blank', () => {
    assert.equal(
      displayOpenLoadDraft({ focused: true, draft: '0.', weight: 0 }),
      '0.'
    );
    assert.equal(
      displayOpenLoadDraft({ focused: true, draft: '.', weight: 0 }),
      '.'
    );
    assert.equal(
      displayOpenLoadDraft({ focused: true, draft: '60.', weight: 60 }),
      '60.'
    );
    assert.equal(
      displayOpenLoadDraft({ focused: true, draft: '80,', weight: 80 }),
      '80,'
    );
    assert.equal(
      displayOpenLoadDraft({ focused: true, draft: '2.5', weight: 2.5 }),
      '2.5'
    );
    assert.equal(
      displayOpenLoadDraft({ focused: false, draft: '0.', weight: 0 }),
      ''
    );
    assert.equal(
      displayOpenLoadDraft({ focused: false, draft: '2.5', weight: 2.5 }),
      '2.5'
    );
  });

  it('clamp is the table min/max, not the parser', () => {
    assert.equal(parseOpenLoadInput('10000'), 10000);
    assert.equal(clampOpenLoadWeight(10000), 9999);
    assert.equal(clampOpenLoadWeight(-4), 0);
    assert.equal(clampOpenLoadWeight(80.5), 80.5);
  });

  it('does not mention BW as a stored kilogram', () => {
    const src = read('src/lib/workout/openEmptyLoad.ts');
    assert.doesNotMatch(src, /weight\s*[:=]\s*['"]BW['"]/);
    assert.notEqual(formatOpenLoadInput(0), 'BW');
    assert.equal(parseOpenLoadInput('BW'), 0);
  });
});
