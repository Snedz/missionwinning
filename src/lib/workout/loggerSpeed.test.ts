import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  activeSetOfParams,
  consoleMatchesTarget,
  shouldOfferUseNext,
  shouldShowSetKindExpand,
  visibleSetKinds,
} from './loggerSpeed.ts';
import { SET_KINDS } from './setKind.ts';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('loggerSpeed', () => {
  it('matches when reps and weight equal the target', () => {
    assert.equal(consoleMatchesTarget(9, 60, { reps: 9, weight: 60 }), true);
    assert.equal(consoleMatchesTarget(8, 60, { reps: 9, weight: 60 }), false);
    assert.equal(consoleMatchesTarget(9, 60, null), false);
  });

  it('offers Use next only when dialed values differ', () => {
    assert.equal(shouldOfferUseNext(8, 60, { reps: 9, weight: 60 }), true);
    assert.equal(shouldOfferUseNext(9, 60, { reps: 9, weight: 60 }), false);
    assert.equal(shouldOfferUseNext(9, 60, null), false);
  });

  it('collapses set kinds to Work only on the default outdoor path', () => {
    assert.deepEqual(visibleSetKinds('normal', false), ['normal']);
    assert.equal(shouldShowSetKindExpand('normal', false), true);
  });

  it('expands all kinds when open or non-work selected', () => {
    assert.deepEqual(visibleSetKinds('normal', true), SET_KINDS);
    assert.deepEqual(visibleSetKinds('warmup', false), SET_KINDS);
    assert.equal(shouldShowSetKindExpand('warmup', false), false);
    assert.equal(shouldShowSetKindExpand('normal', true), false);
  });

  it('activeSetOf params use current/total, not n', () => {
    assert.deepEqual(activeSetOfParams(2, 4), { current: 2, total: 4 });
  });

  it('LogConsole and en locale agree on activeSetOf interpolation keys', () => {
    const root = path.join(import.meta.dirname, '..', '..', '..');
    const consoleSrc = readFileSync(
      path.join(root, 'src/components/workout/LogConsole.tsx'),
      'utf8'
    );
    const locales = readFileSync(
      path.join(root, 'src/i18n/activeWorkoutLocales.ts'),
      'utf8'
    );
    assert.match(
      locales,
      /activeSetOf:\s*'Set \{\{current\}\} of \{\{total\}\}'/,
      'en pack template drifted'
    );
    assert.match(
      consoleSrc,
      /activeSetOfParams\(\s*setNumber\s*,\s*totalSets\s*\)/,
      'console must spread activeSetOfParams(setNumber, totalSets)'
    );
    assert.doesNotMatch(
      consoleSrc,
      /activeSetOf[\s\S]{0,120}\bn:\s*setNumber/,
      'console must not pass n: for activeSetOf'
    );
  });
});
