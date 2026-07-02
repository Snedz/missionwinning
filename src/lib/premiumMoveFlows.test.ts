import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PREMIUM_MOVE_FLOW_DATA } from '@/data/premiumMoveFlowData';
import { PREMIUM_MOVE_FLOW_COUNT } from '@/lib/movePremiumMeta';

describe('premiumMoveFlows (Phase I3)', () => {
  it('defines at least 4 premium flows', () => {
    assert.ok(PREMIUM_MOVE_FLOW_DATA.length >= 4);
  });

  it('count matches meta constant for locked teaser', () => {
    assert.equal(PREMIUM_MOVE_FLOW_DATA.length, PREMIUM_MOVE_FLOW_COUNT);
  });

  it('each flow has unique id and timed steps', () => {
    const ids = new Set<string>();
    for (const flow of PREMIUM_MOVE_FLOW_DATA) {
      assert.ok(flow.id.length > 0);
      assert.ok(!ids.has(flow.id), `duplicate id ${flow.id}`);
      ids.add(flow.id);
      assert.ok(flow.steps.length >= 4, `${flow.id} needs steps`);
      for (const step of flow.steps) {
        assert.ok(step.title.length > 0);
        assert.ok(step.cue.length > 0);
        assert.ok(step.durationSec > 0);
      }
    }
  });
});
