'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logPillarWin } from '@/lib/pillarLog';
import type { GuidedMindSession } from '@/data/guidedMindSessions';

type Props = {
  session: GuidedMindSession;
};

export function GuidedMindSessionRunner({ session }: Props) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(session.steps[0]?.durationSec ?? 20);
  const [done, setDone] = useState(false);

  const step = session.steps[stepIdx];

  useEffect(() => {
    if (!active || done || !step) return;
    if (remaining <= 0) {
      const next = stepIdx + 1;
      if (next >= session.steps.length) {
        setActive(false);
        setDone(true);
        logPillarWin('mind', session.title, { sessionId: session.id });
        return;
      }
      setStepIdx(next);
      setRemaining(session.steps[next].durationSec);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining, stepIdx, done, session, step]);

  const reset = () => {
    setActive(false);
    setStepIdx(0);
    setRemaining(session.steps[0]?.durationSec ?? 20);
    setDone(false);
  };

  return (
    <Card className="content-card border-emerald-500/15">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{session.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{session.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[88px] rounded-xl bg-muted/20 border border-border/40 p-4">
          <p className="text-sm leading-relaxed">{step?.text}</p>
          {active && (
            <p className="text-2xl font-bold tabular-nums text-emerald-400 mt-3">{remaining}s</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {!active && !done && (
            <Button variant="fitness" size="sm" onClick={() => setActive(true)}>
              Start
            </Button>
          )}
          {active && (
            <Button variant="outline" size="sm" onClick={() => setActive(false)}>
              Pause
            </Button>
          )}
          {(active || done) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
        {done && (
          <p className="text-sm text-emerald-400">Session complete — logged to Mind pillar.</p>
        )}
      </CardContent>
    </Card>
  );
}
