'use client';

import { BreathingTimer } from '@/components/pillars/BreathingTimer';
import { DailyCheckIn } from '@/components/pillars/DailyCheckIn';
import { UnlockButton } from '@/components/UnlockButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPillarWins } from '@/lib/pillarLog';

export function MindPage() {
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'mind')
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mind & Recovery</h1>
        <p className="text-muted-foreground mt-1">
          Free breathing timer and daily check-in. Premium unlocks guided meditations and sleep tools (Super Bundle).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreathingTimer />
        <DailyCheckIn />
      </div>

      {recentWins.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Mind Wins</CardTitle></CardHeader>
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
          <CardTitle className="text-base">Premium — Calm / Waking Up depth</CardTitle>
          <CardDescription>Guided sessions, sleep stories, expert lessons on building resilience.</CardDescription>
        </CardHeader>
        <CardContent>
          <UnlockButton productId="mind-premium" price="7" title="Mind & Recovery Premium" isSubscription />
        </CardContent>
      </Card>
    </div>
  );
}
