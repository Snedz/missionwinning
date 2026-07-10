'use client';
/**
 * Page: /move — mobility pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import type { MobilityFlow } from '@/data/mobilityFlows';
import { TimedFlowRunner } from '@/components/pillars/TimedFlowRunner';
import { MoveLockedPreview } from '@/components/move/MoveLockedPreview';
import { usePremium } from '@/hooks/usePremium';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { getPillarWins } from '@/lib/pillarLog';
import { Clock, Wind } from 'lucide-react';

export function MovePage() {
  const { t } = useTranslation();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!premium) {
      setPremiumFlows([]);
      return;
    }
    fetch('/api/premium/mobility')
      .then((r) => (r.ok ? r.json() : { flows: [] }))
      .then((d) => setPremiumFlows(d.flows ?? []))
      .catch(() => setPremiumFlows([]));
  }, [premium]);

  const freeFlows = MOBILITY_FLOWS;
  const activeFlow = [...freeFlows, ...premiumFlows].find((f) => f.id === activeFlowId);
  const recentWins = typeof window !== 'undefined'
    ? getPillarWins(5).filter((w) => w.pillar === 'move')
    : [];

  void refresh;

  if (activeFlow) {
    return (
      <div className="space-y-4">
        <TimedFlowRunner
          flow={activeFlow}
          onComplete={() => setRefresh((r) => r + 1)}
          onExit={() => setActiveFlowId(null)}
        />
      </div>
    );
  }

  const renderFlowGrid = (flows: MobilityFlow[], label: string, accent?: boolean) => (
    <div className="space-y-3">
      <h3
        className={`text-sm font-semibold uppercase tracking-wide ${
          accent ? 'text-emerald-400' : 'text-muted-foreground'
        }`}
      >
        {label}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {flows.map((flow) => (
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
    </div>
  );

  return (
    <PillarPageShell
      icon={Wind}
      eyebrow={t('moveEyebrow', { defaultValue: 'Move' })}
      title={t('moveTitle', { defaultValue: 'Move & Mobility' })}
      subtitle={t('moveSubtitle', {
        defaultValue:
          '10 free guided flows with timers — bodyweight, global-friendly. Premium adds 11 longer recovery flows (Super Bundle).',
      })}
    >
      {renderFlowGrid(freeFlows, t('moveFreeFlows', { defaultValue: 'Free mobility flows' }))}

      {premium && premiumFlows.length > 0 &&
        renderFlowGrid(
          premiumFlows,
          t('movePremiumFlows', { defaultValue: 'Premium recovery flows' }),
          true
        )}

      {premiumLoading && premium && (
        <p className="text-xs text-muted-foreground">{t('loading', { defaultValue: 'Loading premium flows…' })}</p>
      )}

      {!premium && <MoveLockedPreview />}

      {recentWins.length > 0 && (
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
      )}
    </PillarPageShell>
  );
}
