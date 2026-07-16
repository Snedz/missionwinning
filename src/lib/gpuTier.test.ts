import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gpuTierLabel, resolveGpuTierFromEnv } from '@/lib/gpuTier';

describe('gpuTier', () => {
  it('honors ?tier= override', () => {
    assert.equal(resolveGpuTierFromEnv({ search: '?tier=static', hasWebGpu: true }), 'static');
    assert.equal(resolveGpuTierFromEnv({ search: 'tier=webgl', hasWebGpu: true }), 'webgl');
    assert.equal(resolveGpuTierFromEnv({ search: '?tier=webgpu' }), 'webgpu');
  });

  it('forces static for reduced motion / saveData / low memory', () => {
    assert.equal(
      resolveGpuTierFromEnv({ prefersReducedMotion: true, hasWebGpu: true }),
      'static'
    );
    assert.equal(resolveGpuTierFromEnv({ saveData: true, hasWebGl2: true }), 'static');
    assert.equal(resolveGpuTierFromEnv({ deviceMemory: 2, hasWebGpu: true }), 'static');
  });

  it('prefers webgpu then webgl then static', () => {
    assert.equal(resolveGpuTierFromEnv({ hasWebGpu: true, hasWebGl2: true }), 'webgpu');
    assert.equal(resolveGpuTierFromEnv({ hasWebGl2: true }), 'webgl');
    assert.equal(resolveGpuTierFromEnv({}), 'static');
  });

  it('labels tiers for the matrix', () => {
    assert.equal(gpuTierLabel('webgpu'), 'WebGPU');
    assert.equal(gpuTierLabel('webgl'), 'WebGL2');
    assert.equal(gpuTierLabel('static'), 'Static CSS');
  });
});
