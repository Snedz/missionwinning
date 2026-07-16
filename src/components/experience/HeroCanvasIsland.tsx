'use client';

import { useEffect, useState } from 'react';
import { gpuTierLabel, resolveGpuTier, type GpuTier } from '@/lib/gpuTier';
import { ExperienceCanvas } from '@/components/experience/gpu/ExperienceCanvas';
import { XP } from '@/components/experience/experienceStrings';

export function HeroCanvasIsland() {
  const [tier, setTier] = useState<GpuTier>('static');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const boot = () => {
      void resolveGpuTier().then((t) => {
        if (!cancelled) {
          setTier(t);
          setReady(true);
        }
      });
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(boot, { timeout: 1800 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const t = setTimeout(boot, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      {ready && tier !== 'static' ? (
        <ExperienceCanvas tier={tier} className="xp-hero-canvas" mode="hero" />
      ) : null}
      <p className="xp-tier-badge" data-tier={tier}>
        {XP.ch00TierPrefix}: {gpuTierLabel(tier)}
      </p>
    </>
  );
}
