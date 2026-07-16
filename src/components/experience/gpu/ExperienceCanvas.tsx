'use client';

import { useEffect, useRef } from 'react';
import type { GpuTier } from '@/lib/gpuTier';
import type { HeroUniforms } from '@/components/experience/gpu/webgl2Renderer';
import type { ParticleUniforms } from '@/components/experience/gpu/webgl2Particles';

type Props = {
  tier: GpuTier;
  className?: string;
  mode?: 'hero' | 'particles';
  /** Win Score particle uniforms (particles mode). */
  score?: number;
  sets?: number;
  pr?: boolean;
};

type AnyRenderer = {
  draw: (u: HeroUniforms & ParticleUniforms) => void;
  resize: (w: number, h: number, dpr: number) => void;
  destroy: () => void;
};

/**
 * Canvas lifecycle owner — one rAF, pause offscreen / hidden, DPR clamp.
 * GPU modules are dynamic-imported so static / reduced-motion never pays the cost.
 */
export function ExperienceCanvas({
  tier,
  className,
  mode = 'hero',
  score = 68,
  sets = 0,
  pr = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ score, sets, pr });
  stateRef.current = { score, sets, pr };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || tier === 'static') return;

    let destroyed = false;
    let raf = 0;
    let running = true;
    let pointer = { x: 0.5, y: 0.5 };
    let renderer: AnyRenderer | null = null;
    const t0 = performance.now();

    const dprCap = () => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      const low = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;
      return Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer = {
        x: (e.clientX - r.left) / Math.max(1, r.width),
        y: (e.clientY - r.top) / Math.max(1, r.height),
      };
    };

    const resize = () => {
      if (!renderer) return;
      const r = canvas.getBoundingClientRect();
      renderer.resize(r.width, r.height, dprCap());
    };

    const frame = () => {
      if (destroyed || !running || !renderer) return;
      const r = canvas.getBoundingClientRect();
      const t = (performance.now() - t0) / 1000;
      const s = stateRef.current;
      renderer.draw({
        time: t,
        aspect: r.width / Math.max(1, r.height),
        px: pointer.x,
        py: pointer.y,
        score: s.score,
        sets: s.sets,
        pr: s.pr ? 1 : 0,
      });
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && document.visibilityState === 'visible';
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(frame);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    };
    document.addEventListener('visibilitychange', onVis);
    if (mode === 'hero') {
      window.addEventListener('pointermove', onPointer, { passive: true });
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    void (async () => {
      try {
        if (mode === 'particles') {
          if (tier === 'webgpu') {
            const { createWebGpuParticles } = await import(
              '@/components/experience/gpu/webgpuParticles'
            );
            renderer = (await createWebGpuParticles(canvas)) as AnyRenderer | null;
          }
          if (!renderer && (tier === 'webgl' || tier === 'webgpu')) {
            const { createWebGl2Particles } = await import(
              '@/components/experience/gpu/webgl2Particles'
            );
            renderer = createWebGl2Particles(canvas) as AnyRenderer | null;
          }
        } else {
          if (tier === 'webgpu') {
            const { createWebGpuHero } = await import(
              '@/components/experience/gpu/webgpuRenderer'
            );
            renderer = (await createWebGpuHero(canvas)) as AnyRenderer | null;
          }
          if (!renderer && (tier === 'webgl' || tier === 'webgpu')) {
            const { createWebGl2Hero } = await import(
              '@/components/experience/gpu/webgl2Renderer'
            );
            renderer = createWebGl2Hero(canvas) as AnyRenderer | null;
          }
        }
        if (!renderer || destroyed) {
          renderer?.destroy();
          return;
        }
        resize();
        raf = requestAnimationFrame(frame);
      } catch {
        /* parent still shows static DOM fallback */
      }
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
      renderer?.destroy();
    };
  }, [tier, mode]);

  if (tier === 'static') return null;

  return <canvas ref={ref} className={className} aria-hidden />;
}
