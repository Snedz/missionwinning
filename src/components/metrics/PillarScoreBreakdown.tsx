'use client';

import type { WinScoreBreakdown } from '@/lib/score';

const PILLAR_META: { key: keyof WinScoreBreakdown['pillars']; label: string; href: string; max: number }[] = [
  { key: 'train', label: 'Train', href: '/active', max: 40 },
  { key: 'fuel', label: 'Fuel', href: '/nutrition', max: 15 },
  { key: 'move', label: 'Move', href: '/move', max: 12 },
  { key: 'mind', label: 'Mind', href: '/mind', max: 12 },
  { key: 'track', label: 'Track', href: '/track', max: 11 },
  { key: 'learn', label: 'Learn', href: '/learn', max: 10 },
];

export function PillarScoreBreakdown({ breakdown }: { breakdown: WinScoreBreakdown }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground uppercase tracking-widest">Mission Score by Pillar</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PILLAR_META.map(({ key, label, href, max }) => {
          const val = breakdown.pillars[key];
          const pct = Math.min(100, Math.round((val / max) * 100));
          return (
            <a
              key={key}
              href={href}
              className="block p-3 rounded-lg border border-border/60 bg-card/40 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">{val}/{max}</span>
              </div>
              <div className="h-1.5 bg-muted rounded overflow-hidden">
                <div className="h-full bg-emerald-500 rounded" style={{ width: `${pct}%` }} />
              </div>
            </a>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Holistic scoring — all six pillars contribute. Super Bundle deepens each route; free core counts for everyone.
      </p>
    </div>
  );
}
