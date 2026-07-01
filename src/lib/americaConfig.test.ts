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

  it('defaults america track enabled', () => {
    assert.equal(isAmericaTrackEnabled(), true);
  });

  it('defaults MAHA copy off', () => {
    assert.equal(showMahaCopy(), false);
  });

  it('returns council deploy warnings array', () => {
    assert.ok(Array.isArray(getCouncilDeployWarnings()));
  });
});
