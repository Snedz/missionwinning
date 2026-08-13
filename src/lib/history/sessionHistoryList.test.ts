/**
 * Session history list — list, empty, open.
 *
 * Pure rows first. Then discover the one page that paints them, and assert
 * tap opens the log read-only. A name that listed two files would miss a third
 * (`.220`); walk the page-components tree instead.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  listSessionHistoryRows,
  liveSessionLogs,
  sessionMuscles,
  sessionSetCount,
  toSessionHistoryRow,
} from './sessionHistoryList';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx$/.test(entry)) out.push(path.relative(root, abs).split(path.sep).join('/'));
  }
  return out;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function log(partial: Partial<CompletedWorkoutLog> & Pick<CompletedWorkoutLog, 'id'>): CompletedWorkoutLog {
  return {
    workoutName: 'Push',
    startedAt: isoDaysAgo(1),
    completedAt: isoDaysAgo(1),
    durationSeconds: 1800,
    totalVolume: 4000,
    exercises: [
      {
        exerciseId: 'bench-press',
        muscleGroups: ['Chest', 'Arms'],
        sets: [
          { reps: 8, weight: 60 },
          { reps: 8, weight: 60 },
        ],
      },
      {
        exerciseId: 'overhead-press',
        muscleGroups: ['Shoulders', 'Arms'],
        sets: [{ reps: 6, weight: 40 }],
      },
    ],
    ...partial,
  };
}

test('sessionSetCount sums every logged set', () => {
  assert.equal(sessionSetCount(log({ id: 'a' })), 3);
  assert.equal(sessionSetCount(log({ id: 'b', exercises: [] })), 0);
});

test('sessionMuscles is unique, first-seen, stored groups first', () => {
  assert.deepEqual(sessionMuscles(log({ id: 'a' })), ['Chest', 'Arms', 'Shoulders']);
});

test('sessionMuscles backfills from the catalog when the log has no snapshot', () => {
  const bare = log({
    id: 'bare',
    exercises: [{ exerciseId: 'squats', sets: [{ reps: 5, weight: 100 }] }],
  });
  assert.deepEqual(sessionMuscles(bare), ['Legs', 'Core']);
});

test('toSessionHistoryRow projects the scan and skips tombstones', () => {
  const live = toSessionHistoryRow(log({ id: 'live', workoutName: 'Upper' }));
  assert.ok(live);
  assert.equal(live.title, 'Upper');
  assert.equal(live.setCount, 3);
  assert.deepEqual(live.muscles, ['Chest', 'Arms', 'Shoulders']);

  const dead = toSessionHistoryRow(log({ id: 'dead', deletedAt: isoDaysAgo(0) }));
  assert.equal(dead, null);
});

test('listSessionHistoryRows is empty when there is nothing live', () => {
  assert.deepEqual(listSessionHistoryRows([]), []);
  assert.deepEqual(
    listSessionHistoryRows([log({ id: 'dead', deletedAt: isoDaysAgo(0) })]),
    []
  );
});

test('listSessionHistoryRows keeps store order and drops tombstones', () => {
  const newest = log({ id: 'new', workoutName: 'A' });
  const tomb = log({ id: 'gone', deletedAt: isoDaysAgo(0) });
  const older = log({
    id: 'old',
    workoutName: 'B',
    exercises: [{ exerciseId: 'plank', muscleGroups: ['Core'], sets: [{ reps: 1, weight: 0 }] }],
  });
  const rows = listSessionHistoryRows([newest, tomb, older]);
  assert.deepEqual(
    rows.map((r) => r.id),
    ['new', 'old']
  );
  assert.equal(rows[1]?.setCount, 1);
  assert.deepEqual(liveSessionLogs([newest, tomb, older]).map((l) => l.id), ['new', 'old']);
});

const PAGE_DIR = path.join(root, 'src/page-components');
const pages = walk(PAGE_DIR);
const historyPage = 'src/page-components/HistoryPage.tsx';

test('discovery finds HistoryPage — the guard is not scanning nothing', () => {
  assert.ok(pages.includes(historyPage), 'HistoryPage is missing from page-components');
  assert.ok(pages.length > 10, `only ${pages.length} pages discovered`);
});

test('HistoryPage is the one session-history list', () => {
  const listed = pages.filter((p) => {
    const src = readFileSync(path.join(root, p), 'utf8');
    return src.includes('session-history-list');
  });
  assert.deepEqual(
    listed,
    [historyPage],
    `session-history-list must live on HistoryPage only, found: ${listed.join(', ') || '(none)'}`
  );
});

test('HistoryPage: list + empty + read-only open', () => {
  const src = readFileSync(path.join(root, historyPage), 'utf8');

  assert.match(src, /listSessionHistoryRows|toSessionHistoryRow|liveSessionLogs/, 'list uses the row helper');
  assert.match(src, /hasHydrated/, 'empty waits for persist hydrate');
  assert.match(src, /session-history-empty/, 'shame-free empty is marked');
  assert.match(src, /session-history-list/, 'the list is marked');
  assert.match(src, /session-history-row/, 'rows are marked');
  assert.match(src, /session-history-log/, 'open target is the log dialog');
  assert.match(src, /finished sessions land here/, 'empty stays an invitation');
  assert.match(src, /setSelected\(log\)/, 'tap selects the completed log');

  assert.doesNotMatch(src, /Top 8|top eight/i, 'no Top 8');
  assert.doesNotMatch(src, /you missed|streak broken|days behind/i, 'no streak-as-shame');
  assert.doesNotMatch(src, /comment on this|leave a comment/i, 'no comments');
});

test('row tap is not resume — startWorkout stays off the card handler', () => {
  const src = readFileSync(path.join(root, historyPage), 'utf8');
  const card = src.slice(src.indexOf('session-history-row'), src.indexOf('session-history-log'));
  assert.ok(card.length > 40, 'could not slice the list→log region');
  assert.doesNotMatch(card, /startWorkout\(/, 'row tap must not start a workout');
  assert.match(card, /setSelected\(log\)/, 'row tap opens the log');
});
