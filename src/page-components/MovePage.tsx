'use client';
/**
 * Page: /move — mobility pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { getContentInventory } from '@/lib/contentInventory';
import {
  filterFlowsByCollection,
  MOVE_COLLECTIONS,
  parseMoveCollectionParam,
  type MoveCollectionId,
} from '@/lib/move/filterFlows';
import { cn } from '@/lib/utils';

export function MovePage() {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { premium, loading: premiumLoading } = usePremium();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [premiumRetry, setPremiumRetry] = useState(0);
  const [collectionId, setCollectionId] = useState<MoveCollectionId>(() =>
    parseMoveCollectionParam(
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('collection')
        : null
    )
  );
  const inv = getContentInventory();

  useEffect(() => {
    setCollectionId(parseMoveCollectionParam(searchParams.get('collection')));
  }, [searchParams]);

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

  const freeFlows = useMemo(
    () => filterFlowsByCollection(MOBILITY_FLOWS, collectionId),
    [collectionId]
  );
  const filteredPremium = useMemo(
    () => filterFlowsByCollection(premiumFlows, collectionId),
    [premiumFlows, collectionId]
  );
  const activeFlow = [...MOBILITY_FLOWS, ...premiumFlows].find((f) => f.id === activeFlowId);
  const recentWins =
    typeof window !== 'undefined' ? getPillarWins(5).filter((w) => w.pillar === 'move') : [];

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
      {flows.length === 0 ? (
        <div className="border-y-2 border-border py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('moveCollectionEmpty', {
              defaultValue: 'No flows in this collection.',
            })}
          </p>
          {collectionId !== 'all' ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px] tap-target"
              onClick={() => setCollectionId('all')}
            >
              {t('moveCollectionShowAll', { defaultValue: 'Show all flows' })}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((flow) => (
            <Card
              key={flow.id}
              className="content-card border-2 border-border hover:border-primary transition-colors"
            >
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
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] tap-target"
                  onClick={() => setActiveFlowId(flow.id)}
                >
                  {t('moveStartFlow', { defaultValue: 'Start' })}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PillarPageShell
      icon={Wind}
      eyebrow={t('moveEyebrow', { defaultValue: 'Move' })}
      title={t('moveTitle', { defaultValue: 'Mobility' })}
      subtitle={t('moveSubtitleDepth', {
        free: inv.move.free,
        premium: inv.move.premium,
        defaultValue: isFreeBeta()
          ? `${inv.move.free} free flows · ${inv.unlockedTotal.move} unlocked in open beta (timers, mostly bodyweight).`
          : `${inv.move.free} free flows · Super Bundle adds ${inv.move.premium} longer recovery flows.`,
      })}
    >
      <div
        id="move-flows"
        className="scroll-mt-20 space-y-6"
      >
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label={t('moveCollections', { defaultValue: 'Collections' })}>
        {MOVE_COLLECTIONS.map((c) => {
          const selected = collectionId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                'shrink-0 min-h-[44px] border-2 px-3 text-sm font-medium transition-colors tap-target',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary'
              )}
              onClick={() => setCollectionId(c.id)}
            >
              {t(c.titleKey, { defaultValue: c.titleDefault })}
            </button>
          );
        })}
      </div>

      {renderFlowGrid(
        freeFlows,
        t('moveFreeFlowsCount', {
          count: freeFlows.length,
          defaultValue: `Mobility flows (${freeFlows.length})`,
        })
      )}
      </div>

      {premium && filteredPremium.length > 0 && (
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 min-h-[44px] [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-semibold text-foreground">
              {t('movePremiumFlowsCount', {
                count: filteredPremium.length,
                defaultValue: `More recovery flows (${filteredPremium.length})`,
              })}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-2">{renderFlowGrid(filteredPremium, '', true)}</div>
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
            defaultValue: 'Premium recovery flows unavailable offline — free flows above still work.',
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
              {t('movePremiumPreviewCount', {
                count: inv.move.premium,
                defaultValue: `Premium recovery flows (${inv.move.premium})`,
              })}
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
              {t('moveRecentWins', { defaultValue: 'Recent sessions' })}
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
          title={t('moveEmptyTitle', { defaultValue: 'No mobility sessions yet' })}
          description={t('moveEmptyDesc', {
            defaultValue: 'Start a free flow — your first session shows here.',
          })}
          actionLabel={t('moveEmptyCta', { defaultValue: 'Browse free flows' })}
          href="#move-flows"
        />
      )}
    </PillarPageShell>
  );
}
