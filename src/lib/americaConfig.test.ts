import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCouncilStatus,
  isAmericaTrackEnabled,
  showMahaCopy,
  getCouncilDeployWarnings,
} from '@/lib/americaConfig';

describe('americaConfig', () => {
  it('defaults council status to aspirational', () => {
    assert.equal(getCouncilStatus(), 'aspirational');
  });

  it('defaults america track disabled (opt-in via NEXT_PUBLIC_AMERICA_TRACK_ENABLED=true)', () => {
    assert.equal(isAmericaTrackEnabled(), false);
  });

  it('defaults MAHA copy off', () => {
    assert.equal(showMahaCopy(), false);
  });

  it('returns council deploy warnings array', () => {
    assert.ok(Array.isArray(getCouncilDeployWarnings()));
  });
});
