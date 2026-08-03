'use client';
import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logPillarWin } from '@/lib/pillarLog';

export type BreathingPattern = 'box' | '478' | 'relax';

const PATTERNS: Record<BreathingPattern, { name: string; phases: { label: string; sec: number }[] }> = {
  box: {
    name: 'Box Breathing (4-4-4-4)',
    phases: [
      { label: 'Inhale', sec: 4 },
      { label: 'Hold', sec: 4 },
      { label: 'Exhale', sec: 4 },
      { label: 'Hold', sec: 4 },
    ],
  },
  '478': {
    name: '4-7-8 Calm',
    phases: [
      { label: 'Inhale', sec: 4 },
      { label: 'Hold', sec: 7 },
      { label: 'Exhale', sec: 8 },
    ],
  },
  relax: {
    name: 'Relax (5-5)',
    phases: [
      { label: 'Inhale', sec: 5 },
      { label: 'Exhale', sec: 5 },
    ],
  },
};

export function BreathingTimer() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState<BreathingPattern>('box');
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState(PATTERNS.box.phases[0].sec);
  const [cycles, setCycles] = useState(0);
  const targetCycles = 4;

  const config = PATTERNS[pattern];
  const phase = config.phases[phaseIdx];

  useEffect(() => {
    setPhaseIdx(0);
    setRemaining(config.phases[0].sec);
    setCycles(0);
    setRunning(false);
  }, [pattern, config.phases]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      const nextPhase = (phaseIdx + 1) % config.phases.length;
      if (nextPhase === 0) {
        const nextCycles = cycles + 1;
        if (nextCycles >= targetCycles) {
          setRunning(false);
          logPillarWin('mind', config.name, { cycles: targetCycles });
          return;
        }
        setCycles(nextCycles);
      }
      setPhaseIdx(nextPhase);
      setRemaining(config.phases[nextPhase].sec);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining, phaseIdx, cycles, config.phases, config.name]);

  const scale = phase.label === 'Inhale' ? 1.15 : phase.label === 'Exhale' ? 0.85 : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('mindBreathingTitle', { defaultValue: 'Breathing Timer' })}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('mindBreathingSubtitle', {
            count: targetCycles,
            defaultValue: `Free guided patterns — no audio required. ${targetCycles} cycles.`,
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
            <Button
              key={p}
              size="sm"
              className="min-h-[44px]"
              variant={pattern === p ? 'selected' : 'outline'}
              onClick={() => setPattern(p)}
            >
              {PATTERNS[p].name.split(' ')[0]}
            </Button>
          ))}
        </div>

        <div className="flex flex-col items-center py-6">
          <div
            // A scaling square, per the handoff — nothing in this system is
            // round. Ink, because while it is breathing it is the only thing
            // you should be looking at, same rule as the rest dock.
            className="flex h-36 w-36 items-center justify-center bg-neutral-900 text-neutral-100 transition-transform duration-1000 motion-reduce:transition-none"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="text-center">
              <div className="text-[40px] font-extrabold leading-none tabular-nums">{remaining}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                {phase.label}
              </div>
            </div>
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground tabular-nums">
            Cycle {Math.min(cycles + 1, targetCycles)} / {targetCycles}
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {/* `min-h-[44px]`: the Button default is `h-10` (40px), under the 44px
              floor `.125` set for one-thumb use. Applied here rather than to the
              primitive — see LOG `.198` for why that is a founder call. */}
          <Button variant="default" className="min-h-[44px]" onClick={() => setRunning(!running)}>
            {running ? 'Pause' : cycles >= targetCycles ? 'Restart' : 'Start'}
          </Button>
          {running && (
            <Button variant="ghost" className="min-h-[44px]" onClick={() => { setRunning(false); setPhaseIdx(0); setRemaining(config.phases[0].sec); setCycles(0); }}>
              Reset
            </Button>
          )}
        </div>
        {cycles >= targetCycles && !running && (
          <p className="border-s-2 border-primary ps-2 text-sm font-semibold text-primary">
            Session complete — logged to Mind pillar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
