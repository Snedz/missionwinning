import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { GuidedMindSession } from '@/data/guidedMindSessions';
import { filterMindByCollection, MIND_COLLECTIONS } from '@/lib/mind/filterSessions';

const sample: GuidedMindSession[] = [
  {
    id: 'a',
    title: 'Pre-workout',
    subtitle: 'focus',
    minutes: 2,
    tags: ['pre-lift', 'focus'],
    steps: [{ text: 'x', durationSec: 30 }],
  },
  {
    id: 'b',
    title: 'Sleep wind',
    subtitle: 'rest',
    minutes: 5,
    tags: ['sleep'],
    steps: [{ text: 'x', durationSec: 30 }],
  },
];

describe('filterMindByCollection', () => {
  it('filters sleep', () => {
    assert.deepEqual(filterMindByCollection(sample, 'sleep').map((s) => s.id), ['b']);
  });

  it('all returns both', () => {
    assert.equal(filterMindByCollection(sample, 'all').length, 2);
  });

  it('has pre-lift collection', () => {
    assert.ok(MIND_COLLECTIONS.some((c) => c.id === 'pre-lift'));
  });
});
