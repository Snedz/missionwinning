/**
 * Never-trained is not overdue (`.1019`).
 * Anatomy daysSince >= 7 paints days=99 as a missed session.
 * Grid heatmap already idles >= 99. Score keeps the 99 sentinel.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { anatomyGroupOverdue, buildMuscleHeatmap } from './historyAnalytics.ts';
import type { CompletedWorkoutLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

describe('never-trained is not overdue (.1019)', () => {
  it('empty diary: six groups idle, none overdue', () => {
    const cells = buildMuscleHeatmap([]);
    assert.equal(cells.length, 6);
    for (const cell of cells) {
      assert.equal(cell.sessions, 0, cell.group);
      assert.equal(cell.daysSince, 99, cell.group);
      assert.equal(anatomyGroupOverdue(cell), false, cell.group);
    }
  });

  it('never-trained days=99 is not overdue — mutant daysSince>=7 alone dies', () => {
    assert.equal(anatomyGroupOverdue({ daysSince: 99 }), false);
    assert.equal(anatomyGroupOverdue(null), false);
    assert.equal(anatomyGroupOverdue(undefined), false);
    assert.equal(anatomyGroupOverdue({ daysSince: Number.NaN }), false);
  });

  it('trained then left ≥7 days is overdue — including outside the 14-day window', () => {
    assert.equal(anatomyGroupOverdue({ daysSince: 10 }), true);
    assert.equal(anatomyGroupOverdue({ daysSince: 7 }), true);
    assert.equal(anatomyGroupOverdue({ daysSince: 20 }), true);
    assert.equal(anatomyGroupOverdue({ daysSince: 6 }), false);
    assert.equal(anatomyGroupOverdue({ daysSince: 1 }), false);
  });

  it('chest 20 days ago is overdue even with an empty 14-day window', () => {
    const log: CompletedWorkoutLog = {
      id: 'log-20',
      workoutName: 'Push',
      startedAt: isoDaysAgo(20),
      completedAt: isoDaysAgo(20),
      durationSeconds: 3600,
      totalVolume: 0,
      exercises: [
        {
          exerciseId: 'push-ups',
          muscleGroups: ['Chest'],
          sets: [{ reps: 8, weight: 0 }],
        },
      ],
    };
    const cells = buildMuscleHeatmap([log], 14);
    const chest = cells.find((c) => c.group === 'Chest');
    assert.ok(chest);
    assert.equal(chest.sessions, 0, 'outside the heatmap window');
    assert.ok(chest.daysSince >= 19 && chest.daysSince <= 21, String(chest.daysSince));
    assert.equal(anatomyGroupOverdue(chest), true);
    for (const cell of cells) {
      if (cell.group === 'Chest') continue;
      assert.equal(cell.daysSince, 99, cell.group);
      assert.equal(anatomyGroupOverdue(cell), false, cell.group);
    }
  });

  it('AnatomyHeatMap uses the helper — not daysSince >= 7 alone', () => {
    const src = read('src/components/history/AnatomyHeatMap.tsx');
    assert.match(src, /anatomyGroupOverdue\(cell\)/);
    assert.doesNotMatch(src, /daysSince\s*>=\s*7/);
    assert.doesNotMatch(src, /daysSince\s*\?\?/);
  });

  it('score 99 sentinel and grid idle stay — this hop is anatomy only', () => {
    const score = read('src/lib/score.ts');
    assert.match(score, /days === 99/);
    const helper = read('src/lib/historyAnalytics.ts');
    assert.match(helper, /days === 99/);
    assert.doesNotMatch(helper, /sessions <= 0/);
    const grid = read('src/components/history/MuscleHeatmap.tsx');
    assert.match(grid, /daysSince >= 99/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /AnatomyHeatMap/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
