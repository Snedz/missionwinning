import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertDeployReady,
  getDeployReadinessReport,
  validateBuildLabel,
} from '@/lib/deployReadiness';

describe('deployReadiness', () => {
  it('validates build label format', () => {
    assert.equal(validateBuildLabel('2025.06-unified.22'), true);
    assert.equal(validateBuildLabel('bad'), false);
  });

  it('report includes locale export plan', () => {
    const r = getDeployReadinessReport();
    assert.equal(r.localeFiles, 42);
    assert.equal(r.localeNamespaces, 7);
    assert.ok(r.minTodayKeys >= 100);
  });

  it('assertDeployReady passes on integration branch', () => {
    assert.doesNotThrow(() => assertDeployReady());
  });
});
