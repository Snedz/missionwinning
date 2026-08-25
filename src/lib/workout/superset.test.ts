import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  advanceAfterLog,
  getSupersetPeers,
  groupWithNext,
  isMidRoundPeerOpen,
  isNextInThisGroup,
  pairMark,
  pairWithNext,
  restIdentityAfterLog,
  shouldRestAfterLog,
  stripOrphanGroups,
  supersetLabel,
  unpair,
} from './superset';
import type { ActiveExerciseLog } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function ex(id: string, sets: number, group?: string): ActiveExerciseLog {
  return {
    exerciseId: id,
    supersetGroup: group,
    sets: Array.from({ length: sets }, (_, i) => ({
      id: `${id}-${i}`,
      reps: 10,
      weight: 100,
      completed: false,
    })),
  };
}

describe('superset', () => {
  it('groups peers by supersetGroup id', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1'), ex('c', 2)];
    assert.deepEqual(getSupersetPeers(exercises, 0), [0, 1]);
    assert.equal(pairMark(exercises, 0), 'A1');
    assert.equal(pairMark(exercises, 1), 'A2');
    assert.equal(supersetLabel(exercises, 1), 'A2');
    assert.equal(pairMark(exercises, 2), null);
  });

  it('numbers a second pair as B1/B2', () => {
    const exercises = [
      ex('a', 2, 'g1'),
      ex('b', 2, 'g1'),
      ex('c', 2, 'g2'),
      ex('d', 2, 'g2'),
    ];
    assert.equal(pairMark(exercises, 2), 'B1');
    assert.equal(pairMark(exercises, 3), 'B2');
  });

  it('pair persist: JSON round-trip keeps the shared group', () => {
    const paired = pairWithNext([ex('a', 2), ex('b', 2)], 0, 'ss-persist');
    const round = JSON.parse(JSON.stringify(paired)) as ActiveExerciseLog[];
    assert.equal(round[0].supersetGroup, 'ss-persist');
    assert.equal(round[1].supersetGroup, 'ss-persist');
    assert.equal(pairMark(round, 0), 'A1');
    assert.equal(pairMark(round, 1), 'A2');
  });

  it('groupWithNext on two unpaired shares an id (A1/A2)', () => {
    const paired = groupWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab');
    assert.equal(paired[0].supersetGroup, 'ss-ab');
    assert.equal(paired[1].supersetGroup, 'ss-ab');
    assert.equal(paired[2].supersetGroup, undefined);
    assert.equal(pairMark(paired, 0), 'A1');
    assert.equal(pairMark(paired, 1), 'A2');
  });

  it('groupWithNext grows a pair into A3 — does not smash the first peer', () => {
    const pair = groupWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab');
    const circuit = groupWithNext(pair, 1, 'ss-should-not-win');
    assert.equal(circuit[0].supersetGroup, 'ss-ab');
    assert.equal(circuit[1].supersetGroup, 'ss-ab');
    assert.equal(circuit[2].supersetGroup, 'ss-ab');
    assert.equal(pairMark(circuit, 0), 'A1');
    assert.equal(pairMark(circuit, 1), 'A2');
    assert.equal(pairMark(circuit, 2), 'A3');
  });

  it('unpair clears every peer', () => {
    const circuit = groupWithNext(
      groupWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab'),
      1
    );
    const cleared = unpair(circuit, 1);
    assert.equal(cleared[0].supersetGroup, undefined);
    assert.equal(cleared[1].supersetGroup, undefined);
    assert.equal(cleared[2].supersetGroup, undefined);
  });

  it('stripOrphanGroups drops a lone leftover', () => {
    const out = stripOrphanGroups([ex('a', 2, 'g1'), ex('b', 2)]);
    assert.equal(out[0].supersetGroup, undefined);
    assert.equal(pairMark(out, 0), null);
  });

  it('advances to peer at same set index before next set', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1')];
    exercises[0].sets[0].completed = true;
    const next = advanceAfterLog(exercises, 0, 0);
    assert.deepEqual(next, { exerciseIndex: 1, setIndex: 0 });
  });

  it('skips rest when advancing within superset round', () => {
    const exercises = [ex('a', 2, 'g1'), ex('b', 2, 'g1')];
    const next = { exerciseIndex: 1, setIndex: 0 };
    assert.equal(shouldRestAfterLog(exercises, 0, 0, next), false);
    assert.equal(shouldRestAfterLog(exercises, 1, 0, { exerciseIndex: 0, setIndex: 1 }), true);
  });

  it('log order is A then B then C then rest', () => {
    const exercises = groupWithNext(
      groupWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-abc'),
      1
    );
    exercises[0].sets[0].completed = true;
    const afterA = advanceAfterLog(exercises, 0, 0);
    assert.deepEqual(afterA, { exerciseIndex: 1, setIndex: 0 });
    assert.equal(shouldRestAfterLog(exercises, 0, 0, afterA), false);
    assert.equal(isMidRoundPeerOpen(exercises, 0, 0), true);

    exercises[1].sets[0].completed = true;
    const afterB = advanceAfterLog(exercises, 1, 0);
    assert.deepEqual(afterB, { exerciseIndex: 2, setIndex: 0 });
    assert.equal(shouldRestAfterLog(exercises, 1, 0, afterB), false);

    exercises[2].sets[0].completed = true;
    const afterC = advanceAfterLog(exercises, 2, 0);
    assert.deepEqual(afterC, { exerciseIndex: 0, setIndex: 1 });
    assert.equal(shouldRestAfterLog(exercises, 2, 0, afterC), true);
    assert.equal(restIdentityAfterLog(exercises, 2, 0, afterC).exerciseId, 'a');
    assert.equal(isMidRoundPeerOpen(exercises, 2, 0), false);
  });

  it('isNextInThisGroup is true only when the next lift shares the group', () => {
    const pair = groupWithNext([ex('a', 2), ex('b', 2), ex('c', 2)], 0, 'ss-ab');
    assert.equal(isNextInThisGroup(pair, 0), true);
    assert.equal(isNextInThisGroup(pair, 1), false);
    assert.equal(isNextInThisGroup([ex('a', 2), ex('b', 2)], 0), false);
  });

  it('helper stays free of premium / social / rewards', () => {
    const helper = read('src/lib/workout/superset.ts');
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/social/);
    assert.doesNotMatch(helper, /usePremium|trial|leaderboard|Force Sync|Session Expired/);
  });

  it('Today / door / Fuel do not import the group helper', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/NutritionPage.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      assert.doesNotMatch(src, /from\s+['"]@\/lib\/workout\/superset['"]/, rel);
      assert.doesNotMatch(src, /groupWithNext|pairWithNext/, rel);
    }
  });
});
