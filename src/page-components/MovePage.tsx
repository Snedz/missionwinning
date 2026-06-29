'use client';

import { useState } from 'react';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import { TimedFlowRunner } from '@/components/pillars/TimedFlowRunner';
import { UnlockButton } from '@/components/UnlockButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPillarWins } from '@/lib/pillarLog';
import { Clock } from 'lucide-react';

export function MovePage() {
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const activeFlow = MOBILITY_FLOWS.find((f) => f.id === activeFlowId);
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'move')
    : [];

  if (activeFlow) {
    return (
      <div className="space-y-4">
        <TimedFlowRunner flow={activeFlow} onExit={() => setActiveFlowId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Move & Mobility</h1>
        <p className="text-muted-foreground mt-1">
          Free guided flows with timers — bodyweight, global-friendly. Premium adds sports-specific depth (Super Bundle).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MOBILITY_FLOWS.map((flow) => (
          <Card key={flow.id} className="hover:border-emerald-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4 text-emerald-400" />
                {flow.name}
              </CardTitle>
              <CardDescription>{flow.focus}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{flow.durationMin} min · {flow.steps.length} steps</span>
              <Button variant="fitness" size="sm" onClick={() => setActiveFlowId(flow.id)}>
                Start Flow
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentWins.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Move Wins</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {recentWins.map((w) => (
              <div key={w.id} className="text-muted-foreground">
                {new Date(w.completedAt).toLocaleDateString()} — {w.title}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Premium — Pliability + Skill Yoga depth</CardTitle>
          <CardDescription>Sports-specific routines, guided yoga progressions, athletic longevity.</CardDescription>
        </CardHeader>
        <CardContent>
          <UnlockButton productId="move-premium" price="9" title="Move & Mobility Premium" />
        </CardContent>
      </Card>
    </div>
  );
}
