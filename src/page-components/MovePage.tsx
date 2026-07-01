'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import { TimedFlowRunner } from '@/components/pillars/TimedFlowRunner';
import { UnlockButton } from '@/components/UnlockButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { getPillarWins } from '@/lib/pillarLog';
import { Clock, Wind } from 'lucide-react';

export function MovePage() {
  const { t } = useTranslation();
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
    <StaggerGroup className="space-y-6">
      <StaggerItem index={0}>
        <PillarPageHeader
          icon={Wind}
          title={t('moveTitle', { defaultValue: 'Move & Mobility' })}
          subtitle={t('moveSubtitle', {
            defaultValue:
              'Free guided flows with timers — bodyweight, global-friendly. Premium adds sports-specific depth (Super Bundle).',
          })}
        />
      </StaggerItem>

      <StaggerItem index={1}>
        <div className="grid gap-4 md:grid-cols-2">
          {MOBILITY_FLOWS.map((flow) => (
            <Card key={flow.id} className="content-card hover:border-emerald-500/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  {flow.name}
                </CardTitle>
                <CardDescription>{flow.focus}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {flow.durationMin} min · {flow.steps.length} steps
                </span>
                <Button variant="fitness" size="sm" onClick={() => setActiveFlowId(flow.id)}>
                  {t('moveStartFlow', { defaultValue: 'Start Flow' })}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </StaggerItem>

      {recentWins.length > 0 && (
        <StaggerItem index={2}>
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-base">
                {t('moveRecentWins', { defaultValue: 'Recent Move Wins' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {recentWins.map((w) => (
                <div key={w.id} className="text-muted-foreground">
                  {new Date(w.completedAt).toLocaleDateString()} — {w.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>
      )}

      <StaggerItem index={3}>
        <Card className="content-card border-white/10 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">
              {t('movePremiumTitle', { defaultValue: 'Premium — Pliability / Skill Yoga depth' })}
            </CardTitle>
            <CardDescription>
              {t('movePremiumDesc', {
                defaultValue: 'Sports-specific mobility, recovery protocols, and advanced flows.',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnlockButton
              productId="move-premium"
              price="6"
              title={t('movePremiumBtn', { defaultValue: 'Move Premium' })}
              isSubscription
            />
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerGroup>
  );
}
