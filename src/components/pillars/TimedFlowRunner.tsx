'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MobilityFlow } from '@/data/mobilityFlows';
import { logPillarWin } from '@/lib/pillarLog';
import { Play, Pause, SkipForward, Check } from 'lucide-react';

interface TimedFlowRunnerProps {
  flow: MobilityFlow;
  onComplete?: () => void;
  onExit?: () => void;
}

export function TimedFlowRunner({ flow, onComplete, onExit }: TimedFlowRunnerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(flow.steps[0]?.durationSec ?? 30);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const step = flow.steps[stepIndex];
  const totalSteps = flow.steps.length;

  const advance = useCallback(() => {
    if (stepIndex >= totalSteps - 1) {
      setRunning(false);
      setDone(true);
      logPillarWin('move', flow.name, { steps: totalSteps, durationMin: flow.durationMin });
      onComplete?.();
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    setRemaining(flow.steps[next].durationSec);
  }, [stepIndex, totalSteps, flow, onComplete]);

  useEffect(() => {
    if (!running || done) return;
    if (remaining <= 0) {
      advance();
      return;
    }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [running, remaining, done, advance]);

  if (done) {
    return (
      <Card className="border-emerald-500/40">
        <CardContent className="py-10 text-center space-y-4">
          <Check className="h-12 w-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold">Flow Complete</h3>
          <p className="text-muted-foreground">{flow.name} logged — recovery score updated.</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="fitness" onClick={() => { setStepIndex(0); setRemaining(flow.steps[0].durationSec); setDone(false); }}>
              Repeat Flow
            </Button>
            {onExit && (
              <Button variant="outline" onClick={onExit}>Back to Flows</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex justify-between items-start gap-2">
          <span>{flow.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Step {stepIndex + 1}/{totalSteps}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold tabular-nums text-emerald-400">{remaining}s</div>
          <h3 className="text-xl font-semibold mt-4">{step?.title}</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">{step?.cue}</p>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-2 bg-emerald-500 transition-all duration-1000"
            style={{ width: `${((step?.durationSec ?? 1) - remaining) / (step?.durationSec ?? 1) * 100}%` }}
          />
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {!running ? (
            <Button variant="fitness" size="lg" onClick={() => setRunning(true)}>
              <Play className="h-4 w-4 mr-2" /> Start Step
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={() => setRunning(false)}>
              <Pause className="h-4 w-4 mr-2" /> Pause
            </Button>
          )}
          <Button variant="ghost" onClick={advance}>
            <SkipForward className="h-4 w-4 mr-2" /> Skip
          </Button>
          {onExit && (
            <Button variant="ghost" onClick={onExit}>Exit</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
