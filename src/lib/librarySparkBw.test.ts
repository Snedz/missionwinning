/**
 * Library spark is reps, not 0, on empty load (`.1020`).
 * Cite already prints BW. Spark still does reps * weight, so 8 × 0 is a floor.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { libraryExerciseVolumeSpark } from './libraryFilters.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('library spark is reps, not 0, on empty load (.1020)', () => {
  it('push-ups 8 × 0 plot as 8, not a flat zero', () => {
    const history = [
      {
        exercises: [
          {
            exerciseId: 'push-ups',
            sets: [{ reps: 8, weight: 0, kind: 'normal' as const }],
          },
        ],
      },
    ];
    assert.deepEqual(libraryExerciseVolumeSpark(history, 'push-ups'), [8]);
  });

  it('loaded kg is unchanged', () => {
    const history = [
      {
        exercises: [
          {
            exerciseId: 'squats',
            sets: [{ reps: 5, weight: 80, kind: 'normal' as const }],
          },
        ],
      },
    ];
    assert.deepEqual(libraryExerciseVolumeSpark(history, 'squats'), [400]);
  });

  it('warmup does not count; empty invents nothing; tombs stay out', () => {
    const history = [
      {
        deletedAt: 'gone',
        exercises: [
          {
            exerciseId: 'push-ups',
            sets: [{ reps: 10, weight: 0, kind: 'normal' as const }],
          },
        ],
      },
      {
        exercises: [
          {
            exerciseId: 'push-ups',
            sets: [
              { reps: 8, weight: 0, kind: 'warmup' as const },
              { reps: 8, weight: 0, kind: 'normal' as const },
            ],
          },
        ],
      },
    ];
    assert.deepEqual(libraryExerciseVolumeSpark(history, 'push-ups'), [8]);
    assert.deepEqual(libraryExerciseVolumeSpark([], 'push-ups'), []);
  });

  it('Library still uses the helper; Today stays one Start', () => {
    const helper = read('src/lib/libraryFilters.ts');
    assert.match(helper, /workingSetVolume/);
    assert.doesNotMatch(helper, /s \+ set\.reps \* set\.weight/);
    const sheet = read('src/components/library/LibraryDetailSheet.tsx');
    assert.match(sheet, /libraryExerciseVolumeSpark/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /libraryExerciseVolumeSpark/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
