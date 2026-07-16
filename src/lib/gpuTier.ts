/**
 * GPU capability tier for /experience.
 * Pure helpers unit-tested; browser APIs injected for tests.
 */

export type GpuTier = 'webgpu' | 'webgl' | 'static';

export type GpuTierEnv = {
  search?: string;
  prefersReducedMotion?: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hasWebGpu?: boolean;
  hasWebGl2?: boolean;
};

/** Pure tier resolution — no browser globals required. */
export function resolveGpuTierFromEnv(env: GpuTierEnv): GpuTier {
  const params = new URLSearchParams(
    env.search?.startsWith('?') ? env.search.slice(1) : env.search || ''
  );
  const forced = params.get('tier')?.toLowerCase();
  if (forced === 'webgpu' || forced === 'webgl' || forced === 'static') {
    return forced;
  }

  if (env.prefersReducedMotion) return 'static';
  if (env.saveData) return 'static';
  if (typeof env.deviceMemory === 'number' && env.deviceMemory > 0 && env.deviceMemory < 4) {
    return 'static';
  }
  if (env.hasWebGpu) return 'webgpu';
  if (env.hasWebGl2) return 'webgl';
  return 'static';
}

export function gpuTierLabel(tier: GpuTier): string {
  switch (tier) {
    case 'webgpu':
      return 'WebGPU';
    case 'webgl':
      return 'WebGL2';
    default:
      return 'Static CSS';
  }
}

let cached: Promise<GpuTier> | null = null;

/** Browser entry — cached. Override with ?tier= for demos. */
export function resolveGpuTier(): Promise<GpuTier> {
  if (typeof window === 'undefined') {
    return Promise.resolve('static');
  }
  if (cached) return cached;

  cached = (async () => {
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
      gpu?: { requestAdapter: () => Promise<unknown | null> };
    };
    const saveData = Boolean(nav.connection?.saveData);
    const deviceMemory = nav.deviceMemory;

    // Fast path without GPU probes when already forced static
    const early = resolveGpuTierFromEnv({
      search: window.location.search,
      prefersReducedMotion,
      saveData,
      deviceMemory,
      hasWebGpu: false,
      hasWebGl2: false,
    });
    if (
      early === 'static' &&
      (prefersReducedMotion ||
        saveData ||
        (deviceMemory !== undefined && deviceMemory < 4) ||
        new URLSearchParams(window.location.search).get('tier') === 'static')
    ) {
      return 'static';
    }

    let hasWebGpu = false;
    try {
      if (nav.gpu?.requestAdapter) {
        const adapter = await nav.gpu.requestAdapter();
        hasWebGpu = Boolean(adapter);
      }
    } catch {
      hasWebGpu = false;
    }

    let hasWebGl2 = false;
    try {
      const c = document.createElement('canvas');
      hasWebGl2 = Boolean(c.getContext('webgl2'));
    } catch {
      hasWebGl2 = false;
    }

    return resolveGpuTierFromEnv({
      search: window.location.search,
      prefersReducedMotion,
      saveData,
      deviceMemory,
      hasWebGpu,
      hasWebGl2,
    });
  })();

  return cached;
}

/** Test helper — clear cache between tests. */
export function resetGpuTierCache(): void {
  cached = null;
}
