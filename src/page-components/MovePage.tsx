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
import { Clock, Wind, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';

export function MovePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);

  useEffect(() => {
    if (!premium) {
      setPremiumFlows([]);
      setPremiumFetchError(false);
      return;
    }
    setPremiumFetchError(false);
    fetch('/api/premium/mobility')
      .then((r) => {
        if (!r.ok) throw new Error('premium mobility unavailable');
        return r.json();
      })
      .then((d) => setPremiumFlows(d.flows ?? []))
      .catch(() => {
        setPremiumFlows([]);
        setPremiumFetchError(true);
        toast({
          title: t('movePremiumFetchFailed', { defaultValue: 'Could not load premium flows' }),
          description: t('movePremiumFetchFailedDesc', {
            defaultValue: 'Free flows still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, t, toast]);

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

      {premium && premiumFlows.length > 0 && (
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              {t('movePremiumFlows', { defaultValue: 'Premium recovery flows' })}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-2">
            {renderFlowGrid(premiumFlows, '', true)}
          </div>
        </details>
      )}

      {premiumLoading && premium && (
        <p className="text-xs text-muted-foreground">{t('loading', { defaultValue: 'Loading premium flows…' })}</p>
      )}

      {premiumFetchError && premium && (
        <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border/50 px-3 py-2">
          {t('movePremiumOffline', {
            defaultValue: 'Premium recovery flows unavailable offline — free flows below still work.',
          })}
        </p>
      )}

      {!premium && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/50 px-4 py-3 text-sm min-h-[44px]"
            onClick={() => setPremiumOpen((v) => !v)}
          >
            <span className="font-medium text-muted-foreground">
              {t('movePremiumPreview', { defaultValue: 'Premium recovery flows' })}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${premiumOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {premiumOpen && <MoveLockedPreview />}
        </div>
      )}

      {recentWins.length > 0 ? (
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
      ) : (
        <EmptyState
          icon={Wind}
          title={t('moveEmptyTitle', { defaultValue: 'No Move sessions logged yet' })}
          description={t('moveEmptyDesc', {
            defaultValue: 'Start a free mobility flow — your first win shows here.',
          })}
          actionLabel={t('moveEmptyCta', { defaultValue: 'Browse free flows' })}
          onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      )}
    </PillarPageShell>
  );
}
