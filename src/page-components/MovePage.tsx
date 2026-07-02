'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import type { MobilityFlow } from '@/data/mobilityFlows';
import { TimedFlowRunner } from '@/components/pillars/TimedFlowRunner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageHeader } from '@/components/layout/PillarPageHeader';
import { StaggerGroup, StaggerItem } from '@/components/layout/StaggerReveal';
import { getPillarWins } from '@/lib/pillarLog';
import { usePremium } from '@/hooks/usePremium';
import { PREMIUM_MOVE_FLOW_COUNT } from '@/lib/movePremiumMeta';
import { Clock, Wind } from 'lucide-react';

function FlowCard({
  flow,
  onStart,
  startLabel,
}: {
  flow: MobilityFlow;
  onStart: () => void;
  startLabel: string;
}) {
  return (
    <Card className="content-card hover:border-emerald-500/40 transition-colors">
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
        <Button variant="fitness" size="sm" onClick={onStart}>
          {startLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function MovePage() {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'move')
    : [];

  useEffect(() => {
    if (!premium) {
      setPremiumFlows([]);
      return;
    }
    fetch('/api/premium/move-flows', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { flows: [] }))
      .then((data) => setPremiumFlows(data.flows ?? []))
      .catch(() => setPremiumFlows([]));
  }, [premium]);

  const allFlows = [...MOBILITY_FLOWS, ...premiumFlows];
  const activeFlow = allFlows.find((f) => f.id === activeFlowId);

  if (activeFlow) {
    return (
      <div className="space-y-4">
        <TimedFlowRunner flow={activeFlow} onExit={() => setActiveFlowId(null)} />
      </div>
    );
  }

  const startLabel = t('moveStartFlow', { defaultValue: 'Start Flow' });

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
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('moveFlowsFree', { defaultValue: 'Free mobility flows' })}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {MOBILITY_FLOWS.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                startLabel={startLabel}
                onStart={() => setActiveFlowId(flow.id)}
              />
            ))}
          </div>
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

      <StaggerItem index={recentWins.length > 0 ? 3 : 2}>
        {premium && !premiumLoading && premiumFlows.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('moveFlowsPremium', { defaultValue: 'Premium mobility flows (Super Bundle)' })}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {premiumFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  startLabel={startLabel}
                  onStart={() => setActiveFlowId(flow.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="content-card border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-base">
                {t('movePremiumLockedTitle', {
                  count: PREMIUM_MOVE_FLOW_COUNT,
                  defaultValue: `+${PREMIUM_MOVE_FLOW_COUNT} Premium Flows`,
                })}
              </CardTitle>
              <CardDescription>
                {t('movePremiumLockedBody', {
                  defaultValue:
                    'Unlock sports-specific mobility, prehab circuits, and advanced recovery protocols via the Super Bundle.',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="fitness" onClick={() => { window.location.href = '/bundle'; }}>
                {t('moveExploreBundle', { defaultValue: 'Explore Super Bundle' })}
              </Button>
            </CardContent>
          </Card>
        )}
      </StaggerItem>
    </StaggerGroup>
  );
}
