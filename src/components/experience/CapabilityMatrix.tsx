'use client';

import { useEffect, useState } from 'react';
import { gpuTierLabel, resolveGpuTier, type GpuTier } from '@/lib/gpuTier';
import { XP } from '@/components/experience/experienceStrings';

type Row = { name: string; ok: boolean; note: string };

export function CapabilityMatrix({ exerciseCount }: { exerciseCount: number }) {
  const [tier, setTier] = useState<GpuTier>('static');
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    void resolveGpuTier().then(setTier);
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasWebGpu = Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
    let hasWebGl2 = false;
    try {
      hasWebGl2 = Boolean(document.createElement('canvas').getContext('webgl2'));
    } catch {
      hasWebGl2 = false;
    }
    const scrollTimeline =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline', 'scroll()');
    const viewTimeline =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('animation-timeline', 'view()');
    const oklch =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('color', 'oklch(0.7 0.1 150)');
    const viewTransition = 'startViewTransition' in document;

    setRows([
      {
        name: 'WebGPU',
        ok: hasWebGpu,
        note: hasWebGpu ? 'Adapter path available' : 'Fallback to WebGL2/static',
      },
      {
        name: 'WebGL2',
        ok: hasWebGl2,
        note: hasWebGl2 ? 'Fragment aurora path' : 'Static hero-field only',
      },
      {
        name: 'Scroll timelines',
        ok: scrollTimeline,
        note: scrollTimeline ? 'CSS scroll()/view() active' : 'IO / static layout fallback',
      },
      {
        name: 'View timelines',
        ok: viewTimeline,
        note: viewTimeline ? 'Kinetic type ranges' : 'Full opacity static words',
      },
      {
        name: 'OKLCH color',
        ok: oklch,
        note: oklch ? 'Wide-gamut swatches' : 'sRGB fallbacks',
      },
      {
        name: 'View Transitions',
        ok: viewTransition,
        note: viewTransition ? 'CTA flourish available' : 'Instant navigation',
      },
      {
        name: 'Reduced motion',
        ok: prefersReduced,
        note: prefersReduced ? 'Forced static tier' : 'Motion allowed',
      },
    ]);
  }, []);

  return (
    <div>
      <p className="xp-tier-badge">
        {XP.ch06Rendered}: <strong>{gpuTierLabel(tier)}</strong>
      </p>
      <table className="xp-matrix">
        <thead>
          <tr>
            <th>Capability</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td className={r.ok ? 'xp-ok' : 'xp-no'}>{r.ok ? 'Yes' : 'No'}</td>
              <td className="text-muted-foreground">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="xp-stats">
        <span>
          {exerciseCount} {XP.ch06StatExercises}
        </span>
        <span>·</span>
        <span>{XP.ch06StatLangs}</span>
        <span>·</span>
        <span>{XP.ch06StatOffline}</span>
        <span>·</span>
        <span>{XP.ch06StatPrice}</span>
        <span>·</span>
        <span>{XP.ch06StatLicense}</span>
      </div>
    </div>
  );
}
