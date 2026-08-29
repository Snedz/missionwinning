'use client';
import { useTranslation } from 'react-i18next';

import { useEffect, useState } from 'react';
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
    <section className="house-card house-breathe">
      <h2 className="house-breathe-name">
        {t('mindBreathingTitle', { defaultValue: 'Breathing Timer' })}
      </h2>
      <p className="house-lede">
        {t('mindBreathingSubtitle', {
          count: targetCycles,
          defaultValue: `Free guided patterns — no audio required. ${targetCycles} cycles.`,
        })}
      </p>
      <div className="house-collections">
        {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`house-state tap-target${pattern === p ? ' is-on' : ''}`}
            onClick={() => setPattern(p)}
          >
            {PATTERNS[p].name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="house-breathe-stage">
        <div
          // A scaling square, per the handoff — nothing in this system is
          // round. Ink, because while it is breathing it is the only thing
          // you should be looking at, same rule as the rest dock.
          className="house-breathe-square"
          style={{ transform: `scale(${scale})` }}
        >
          <p className="house-breathe-count tabular-nums">{remaining}</p>
          <p className="house-kicker">{phase.label}</p>
        </div>
        <p className="house-lede tabular-nums">
          Cycle {Math.min(cycles + 1, targetCycles)} / {targetCycles}
        </p>
      </div>

      <div className="house-row">
        <button
          type="button"
          className="house-btn house-btn-ghost min-h-[44px] tap-target"
          onClick={() => setRunning(!running)}
        >
          {running ? 'Pause' : cycles >= targetCycles ? 'Restart' : 'Start'}
        </button>
        {running && (
          <button
            type="button"
            className="house-btn house-btn-ghost min-h-[44px] tap-target"
            onClick={() => {
              setRunning(false);
              setPhaseIdx(0);
              setRemaining(config.phases[0].sec);
              setCycles(0);
            }}
          >
            Reset
          </button>
        )}
      </div>
      {cycles >= targetCycles && !running && (
        <p className="house-lede">Session complete — logged to Mind pillar.</p>
      )}
    </section>
  );
}
