'use client';
/**
 * Page: /move — mobility pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
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
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/hooks/use-toast';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { isFreeBeta } from '@/lib/freeBeta';

export function MovePage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const { toast } = useToast();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  // `.241` — a retry trigger. ErrorState renders no action unless it is handed
  // one, so an unrecoverable error state was a dead end wearing a component.
  const [premiumRetry, setPremiumRetry] = useState(0);

  useEffect(() => {
    if (!premium) {
      setPremiumFlows([]);
      setPremiumFetchError(false);
      return;
    }
    setPremiumFetchError(false);
    fetchPremiumCatalogJson<{ flows?: MobilityFlow[] }>('/api/premium/mobility')
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
  }, [premium, premiumRetry, t, toast]);

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
      {label ? (
        <h3
          className={`text-sm font-semibold uppercase tracking-wide ${
            accent ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {label}
        </h3>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {flows.map((flow, i) => (
          <Card key={flow.id} className="content-card border-2 border-border hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4 text-primary" />
                {flow.name}
              </CardTitle>
              <CardDescription>{flow.focus}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground tabular-nums">
                {flow.durationMin} min · {flow.steps.length} steps
              </span>
              <Button
                variant={!accent && i === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFlowId(flow.id)}
              >
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
      title={t('moveTitle', { defaultValue: 'Mobility' })}
      subtitle={t('moveSubtitle', {
        defaultValue: isFreeBeta()
          ? 'Guided mobility flows with timers — mostly bodyweight.'
          : 'Guided mobility flows with timers. Super Bundle adds longer recovery flows when paid depth is on.',
      })}
    >
      {renderFlowGrid(freeFlows, t('moveFreeFlows', { defaultValue: 'Mobility flows' }))}

      {premium && premiumFlows.length > 0 && (
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-semibold text-foreground">
              {t('movePremiumFlows', { defaultValue: 'More recovery flows' })}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-2">
            {renderFlowGrid(premiumFlows, '', true)}
          </div>
        </details>
      )}

      {premiumLoading && premium && (
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {t('movePremiumLoading', { defaultValue: 'Loading recovery flows…' })}
        </p>
      )}

      {premiumFetchError && premium && (
        <ErrorState
          className="py-6"
          actionLabel={t('movePremiumRetry', { defaultValue: 'Try again' })}
          onAction={() => setPremiumRetry((n) => n + 1)}
          title={t('movePremiumFetchFailed', { defaultValue: 'Could not load premium flows' })}
          description={t('movePremiumOffline', {
            defaultValue: 'Premium recovery flows unavailable offline — free flows below still work.',
          })}
        />
      )}

      {!premium && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 border-2 border-border bg-card px-4 py-3 text-sm min-h-[44px]"
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
                {fmt.date(w.completedAt)} — {w.title}
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
