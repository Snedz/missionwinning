import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { MobilityFlow } from '@/data/mobilityFlows';
import {
  filterFlowsByCollection,
  flowMatchesCollection,
  MOVE_COLLECTIONS,
  parseMoveCollectionParam,
} from '@/lib/move/filterFlows';

const sample: MobilityFlow[] = [
  {
    id: 'a',
    name: 'Post Leg Day',
    durationMin: 10,
    focus: 'hips recovery',
    tags: ['post-legs', 'hips', 'recovery'],
    steps: [{ title: 'x', cue: 'y', durationSec: 60 }],
  },
  {
    id: 'b',
    name: 'Desk Reset',
    durationMin: 5,
    focus: 'neck thoracic',
    tags: ['desk', 'neck', 'thoracic'],
    steps: [{ title: 'x', cue: 'y', durationSec: 60 }],
  },
  {
    id: 'c',
    name: 'Long Recovery',
    durationMin: 18,
    focus: 'full body',
    tags: ['long', 'recovery'],
    steps: [{ title: 'x', cue: 'y', durationSec: 60 }],
  },
];

describe('filterFlows', () => {
  it('all returns everything', () => {
    assert.equal(filterFlowsByCollection(sample, 'all').length, 3);
  });

  it('post-legs collection matches tags', () => {
    const out = filterFlowsByCollection(sample, 'recover-after-lower');
    assert.deepEqual(out.map((f) => f.id).sort(), ['a', 'c']);
  });

  it('long-form requires min minutes', () => {
    const out = filterFlowsByCollection(sample, 'long-form');
    assert.deepEqual(
      out.map((f) => f.id),
      ['c']
    );
  });

  it('desk collection', () => {
    const out = filterFlowsByCollection(sample, 'desk-athlete');
    assert.equal(out.length, 1);
    assert.equal(out[0].id, 'b');
  });

  it('MOVE_COLLECTIONS includes yoga-lite', () => {
    assert.ok(MOVE_COLLECTIONS.some((c) => c.id === 'yoga-lite'));
  });

  it('untagged flow can match via focus keywords', () => {
    const bare: MobilityFlow = {
      id: 'legacy',
      name: 'Hip Opener',
      durationMin: 8,
      focus: 'Hips + glutes after leg day',
      steps: [{ title: 'x', cue: 'y', durationSec: 60 }],
    };
    const def = MOVE_COLLECTIONS.find((c) => c.id === 'recover-after-lower')!;
    assert.equal(flowMatchesCollection(bare, def), true);
  });

  it('parseMoveCollectionParam hydrates deep links', () => {
    assert.equal(parseMoveCollectionParam('recover-after-lower'), 'recover-after-lower');
    assert.equal(parseMoveCollectionParam('nope'), 'all');
  });
});
