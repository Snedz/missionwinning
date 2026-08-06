import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldCollapseVictoryDetails } from '@/lib/workout/victoryLayout';

describe('shouldCollapseVictoryDetails', () => {
  it('stays open when only stats-level content', () => {
    assert.equal(
      shouldCollapseVictoryDetails({
        hasBodyDelta: false,
        hasDebrief: false,
        fragmentCount: 0,
        hasProgression: false,
      }),
      false
    );
  });

  it('collapses when debrief or fragments exist', () => {
    assert.equal(
      shouldCollapseVictoryDetails({
        hasBodyDelta: false,
        hasDebrief: true,
        fragmentCount: 0,
        hasProgression: false,
      }),
      true
    );
    assert.equal(
      shouldCollapseVictoryDetails({
        hasBodyDelta: false,
        hasDebrief: false,
        fragmentCount: 2,
        hasProgression: false,
      }),
      true
    );
  });

  it('collapses body delta + progression together', () => {
    assert.equal(
      shouldCollapseVictoryDetails({
        hasBodyDelta: true,
        hasDebrief: false,
        fragmentCount: 0,
        hasProgression: true,
      }),
      true
    );
  });
});
