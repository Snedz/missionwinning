import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import {
  POST_SESSION_FLOW_BY_MUSCLE,
  dominantTrainedMuscle,
  pickPostSessionMoveFlow,
  workingMuscleGroupsFromLog,
} from '@/lib/move/postSessionFlow';

const PULL = [
  { muscleGroups: ['Back', 'Arms'], sets: [{ reps: 8, weight: 50, kind: 'normal' as const }] },
  { muscleGroups: ['Back', 'Arms'], sets: [{ reps: 8, weight: 60, kind: 'normal' as const }] },
  { muscleGroups: ['Back', 'Arms'], sets: [{ reps: 10, weight: 40, kind: 'normal' as const }] },
];

describe('pickPostSessionMoveFlow', () => {
  it('sample pull session (lat pulldown + rows) picks T-Spine Opener', () => {
    const groups = workingMuscleGroupsFromLog(PULL);
    const pick = pickPostSessionMoveFlow(groups);
    assert.equal(dominantTrainedMuscle(groups), 'Back');
    assert.equal(pick?.flowId, 'tspine-opener');
    assert.equal(pick?.flowName, 'T-Spine Opener');
    assert.equal(pick?.muscle, 'Back');
    assert.equal(pick?.href, '/move?flow=tspine-opener');
  });

  it('legs win a lower session', () => {
    const pick = pickPostSessionMoveFlow(
      workingMuscleGroupsFromLog([
        { muscleGroups: ['Legs'], sets: [{ reps: 5, kind: 'normal' }] },
        { muscleGroups: ['Legs', 'Core'], sets: [{ reps: 8, kind: 'normal' }] },
      ])
    );
    assert.equal(pick?.flowId, 'post-leg-day');
    assert.equal(pick?.muscle, 'Legs');
  });

  it('ignores warmup-only work', () => {
    const pick = pickPostSessionMoveFlow(
      workingMuscleGroupsFromLog([
        { muscleGroups: ['Back', 'Arms'], sets: [{ reps: 10, kind: 'warmup' }] },
      ])
    );
    assert.equal(pick, null);
  });

  it('returns null when no mapped muscles', () => {
    assert.equal(pickPostSessionMoveFlow([[]]), null);
    assert.equal(pickPostSessionMoveFlow([['Unknown']]), null);
  });

  it('Back beats Arms on a pull-day tie', () => {
    assert.equal(dominantTrainedMuscle([['Back', 'Arms'], ['Back', 'Arms']]), 'Back');
  });
});

describe('POST_SESSION_FLOW_BY_MUSCLE catalog contract', () => {
  it('every mapped id is a free MOBILITY_FLOWS row — not invented', () => {
    const freeById = new Map(MOBILITY_FLOWS.map((f) => [f.id, f]));
    for (const [muscle, flow] of Object.entries(POST_SESSION_FLOW_BY_MUSCLE)) {
      const free = freeById.get(flow.id);
      assert.ok(free, `${muscle} maps to missing free flow ${flow.id}`);
      assert.ok(
        free.name === flow.name || free.name.startsWith(`${flow.name} (`),
        `${muscle} display name ${flow.name} must match catalog ${free.name}`
      );
    }
  });

  it('the picker module does not import the mobility catalog (logger bundle)', () => {
    const src = readFileSync(join(import.meta.dirname, 'postSessionFlow.ts'), 'utf8');
    assert.doesNotMatch(src, /mobilityFlows/);
    assert.doesNotMatch(src, /premiumMobilityFlows/);
    assert.doesNotMatch(src, /mobilityScore|mobility score/i);
  });
});
