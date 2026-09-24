import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  HIGHLIGHTER_MUSCLES,
  MAJOR_TO_HIGHLIGHTER,
  MUSCLE_BALANCE_WINDOW_DAYS,
  muscleBalanceFromHistory,
  type HighlighterMuscle,
} from './muscleBalance.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function log(
  daysAgo: number,
  exercises: CompletedWorkoutLog['exercises'],
  extra: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog {
  return {
    id: `log-${daysAgo}-${exercises.map((e) => e.exerciseId).join('-')}`,
    workoutName: 'Session',
    startedAt: isoDaysAgo(daysAgo),
    completedAt: isoDaysAgo(daysAgo),
    durationSeconds: 1800,
    totalVolume: 1000,
    exercises,
    ...extra,
  };
}

function lift(
  exerciseId: string,
  muscleGroups?: CompletedWorkoutLog['exercises'][number]['muscleGroups']
): CompletedWorkoutLog['exercises'][number] {
  return {
    exerciseId,
    ...(muscleGroups ? { muscleGroups } : {}),
    sets: [
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
    ],
  };
}

const UNMAPPED = [
  'forearm',
  'adductor',
  'abductors',
  'head',
  'neck',
  'knees',
  'left-soleus',
  'right-soleus',
] as const;

describe('muscleBalanceFromHistory', () => {
  it('empty history paints nothing', () => {
    assert.deepEqual(muscleBalanceFromHistory([]), []);
  });

  it('a tombstone is not a session', () => {
    const live = log(1, [lift('custom-press', ['Chest'])]);
    const tomb = log(1, [lift('custom-row', ['Back'])], { deletedAt: isoDaysAgo(0), id: 'gone' });
    const rows = muscleBalanceFromHistory([live, tomb]);
    assert.deepEqual(
      rows.map((r) => r.name),
      ['Chest']
    );
    assert.equal(rows[0]?.frequency, 1);
  });

  it('two lifts in one session count once for that group', () => {
    const rows = muscleBalanceFromHistory([
      log(1, [lift('press-a', ['Chest']), lift('press-b', ['Chest'])]),
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.name, 'Chest');
    assert.deepEqual(rows[0]?.muscles, ['chest']);
    assert.equal(rows[0]?.frequency, 1);
  });

  it('two sessions raise frequency to 2', () => {
    const rows = muscleBalanceFromHistory([
      log(1, [lift('press-a', ['Chest'])]),
      log(2, [lift('press-b', ['Chest'])]),
    ]);
    assert.equal(rows[0]?.frequency, 2);
  });

  it('a session outside the window is omitted', () => {
    const rows = muscleBalanceFromHistory([
      log(MUSCLE_BALANCE_WINDOW_DAYS + 3, [lift('old-squat', ['Legs'])]),
    ]);
    assert.deepEqual(rows, []);
  });

  it('stored groups beat the catalog name', () => {
    const rows = muscleBalanceFromHistory([
      log(1, [lift('bench-press', ['Back'])]),
    ]);
    assert.deepEqual(
      rows.map((r) => r.name),
      ['Back']
    );
    assert.deepEqual(rows[0]?.muscles, ['trapezius', 'upper-back', 'lower-back']);
  });

  it('Full Body and Cardio do not invent a highlighter region', () => {
    const rows = muscleBalanceFromHistory([
      log(1, [lift('carry', ['Full Body']), lift('run', ['Cardio'])]),
    ]);
    assert.deepEqual(rows, []);
  });

  it('the projection is disjoint and stays inside the major groups', () => {
    const seen = new Map<HighlighterMuscle, string>();
    for (const [group, slugs] of Object.entries(MAJOR_TO_HIGHLIGHTER)) {
      assert.ok(slugs.length > 0, group);
      for (const slug of slugs) {
        assert.ok(
          (HIGHLIGHTER_MUSCLES as readonly string[]).includes(slug),
          slug
        );
        assert.equal(seen.has(slug), false, `${slug} claimed by ${seen.get(slug)} and ${group}`);
        seen.set(slug, group);
        assert.equal(
          (UNMAPPED as readonly string[]).includes(slug),
          false,
          slug
        );
      }
    }
    for (const slug of UNMAPPED) {
      assert.equal(seen.has(slug as HighlighterMuscle), false);
    }
  });
});

describe('Coach balance strip wiring', () => {
  it('CoachPage mounts the map', () => {
    const page = read('src/page-components/CoachPage.tsx');
    assert.match(page, /<MuscleBalanceMap\b/);
  });

  it('the wrapper uses the package and does not paste its polygons or a hex ramp', () => {
    const src = read('src/components/coach/MuscleBalanceMap.tsx');
    assert.match(src, /from 'react-body-highlighter'/);
    assert.match(src, /highlightedColors/);
    assert.match(src, /bodyColor/);
    assert.match(src, /anterior/);
    assert.match(src, /posterior/);
    assert.doesNotMatch(src, /svgPoints|<polygon|points="/);
    assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/);
    assert.doesNotMatch(src, /premium|paymentUrl|UnlockButton/);
  });

  it('NOTICE keeps the MIT copyright', () => {
    const notice = read('src/lib/bodyHighlighter/NOTICE.md');
    assert.match(notice, /Copyright \(c\) 2020 GV79/);
    assert.match(notice, /MIT License/);
    assert.match(notice, /react-body-highlighter/);
  });
});
