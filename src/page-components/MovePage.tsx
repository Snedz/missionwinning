'use client';
/**
 * Page: /move — mobility pillar
 * See: app/INDEX.md, src/page-components/INDEX.md
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import type { MobilityFlow } from '@/data/mobilityFlows';
import { TimedFlowRunner } from '@/components/pillars/TimedFlowRunner';
import { MoveLockedPreview } from '@/components/move/MoveLockedPreview';
import { QuietMoveLogCard } from '@/components/move/QuietMoveLogCard';
import { usePremium } from '@/hooks/usePremium';
import { PillarPageShell } from '@/components/layout/PillarPageShell';
import { getPillarWins } from '@/lib/pillarLog';
import { Wind, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/hooks/use-toast';
import { fetchPremiumCatalogJson } from '@/lib/premiumCatalogCache';
import { getContentInventory } from '@/lib/contentInventory';
import {
  filterFlowsByCollection,
  MOVE_COLLECTIONS,
  parseMoveCollectionParam,
  parseMoveFlowParam,
  type MoveCollectionId,
} from '@/lib/move/filterFlows';
import { cn } from '@/lib/utils';
import { isFreeBeta } from '@/lib/freeBeta';

type MovePageProps = {
  initialCollection?: string;
  initialFlow?: string;
};

export function MovePage({ initialCollection, initialFlow }: MovePageProps = {}) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const { toast } = useToast();
  const { premium, loading: premiumLoading } = usePremium();
  const freeBeta = isFreeBeta();
  const [premiumFlows, setPremiumFlows] = useState<MobilityFlow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(() =>
    parseMoveFlowParam(initialFlow ?? null, MOBILITY_FLOWS)
  );
  const skipUrlFlow = useRef(false);
  const [refresh, setRefresh] = useState(0);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumFetchError, setPremiumFetchError] = useState(false);
  const [premiumRetry, setPremiumRetry] = useState(0);
  const [collectionId, setCollectionId] = useState<MoveCollectionId>(() =>
    parseMoveCollectionParam(initialCollection ?? null)
  );
  const inv = getContentInventory();

  useEffect(() => {
    setCollectionId(parseMoveCollectionParam(initialCollection ?? null));
  }, [initialCollection]);

  useEffect(() => {
    if (skipUrlFlow.current) return;
    const id = parseMoveFlowParam(initialFlow ?? null, MOBILITY_FLOWS);
    if (id) setActiveFlowId(id);
  }, [initialFlow]);

  useEffect(() => {
    const apply = (search: string) => {
      const sp = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
      setCollectionId(parseMoveCollectionParam(sp.get('collection')));
      if (skipUrlFlow.current) return;
      const id = parseMoveFlowParam(sp.get('flow'), MOBILITY_FLOWS);
      if (id) setActiveFlowId(id);
    };
    const onPop = () => apply(window.location.search);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
          title: freeBeta
            ? t('movePremiumFetchFailedOpenBeta', {
                defaultValue: 'Could not load extra recovery flows',
              })
            : t('movePremiumFetchFailed', {
                defaultValue: 'Could not load premium flows',
              }),
          description: t('movePremiumFetchFailedDesc', {
            defaultValue: 'Free flows still work. Check your connection and try again.',
          }),
          variant: 'destructive',
        });
      });
  }, [premium, premiumRetry, t, toast, freeBeta]);

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
          onExit={() => {
            skipUrlFlow.current = true;
            setActiveFlowId(null);
          }}
        />
      </div>
    );
  }

  const renderFlowGrid = (flows: MobilityFlow[], label: string) => (
    <div className="space-y-3">
      {label ? <p className="house-kicker">{label}</p> : null}
      {flows.length === 0 ? (
        <div className="space-y-3">
          <p className="house-lede">
            {t('moveCollectionEmpty', {
              defaultValue: 'No flows in this collection.',
            })}
          </p>
          {collectionId !== 'all' ? (
            <button
              type="button"
              className="house-btn house-btn-ghost min-h-[44px] tap-target"
              onClick={() => setCollectionId('all')}
            >
              {t('moveCollectionShowAll', { defaultValue: 'Show all flows' })}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="house-flow-list">
          {flows.map((flow) => (
            <article key={flow.id} className="house-card house-flow">
              <h3 className="house-flow-name">{flow.name}</h3>
              <p className="house-lede">{flow.focus}</p>
              <div className="house-row">
                <span className="house-lede tabular-nums">
                  {flow.durationMin} min · {flow.steps.length} steps
                </span>
                <button
                  type="button"
                  className="house-btn house-btn-ghost min-h-[44px] tap-target"
                  onClick={() => setActiveFlowId(flow.id)}
                >
                  {t('moveStartFlow', { defaultValue: 'Start Flow' })}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PillarPageShell
      className="house-move"
      icon={Wind}
      eyebrow={t('moveEyebrow', { defaultValue: 'Move' })}
      title={t('moveTitle', { defaultValue: 'Move & Mobility' })}
      subtitle={
        freeBeta
          ? t('moveSubtitleBriefOpenBeta', {
              defaultValue:
                'Pick a free flow. Timers and bodyweight — recovery depth open in Alpha.',
            })
          : t('moveSubtitleBrief', {
              defaultValue:
                'Pick a free flow. Timers and bodyweight — premium later if you want.',
            })
      }
    >
      <QuietMoveLogCard />

      <div
        id="move-flows"
        className="scroll-mt-20 space-y-6"
      >
      <div
        className="house-collections"
        role="tablist"
        aria-label={t('moveCollections', { defaultValue: 'Collections' })}
      >
        {MOVE_COLLECTIONS.map((c) => {
          const selected = collectionId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn('house-state shrink-0 tap-target', selected && 'is-on')}
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
        <details className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            <span>
              {t('movePremiumFlowsCount', {
                count: filteredPremium.length,
                defaultValue: `More recovery flows (${filteredPremium.length})`,
              })}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t-2 border-border p-4">
            {renderFlowGrid(filteredPremium, '')}
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
          title={
            freeBeta
              ? t('movePremiumFetchFailedOpenBeta', {
                  defaultValue: 'Could not load extra recovery flows',
                })
              : t('movePremiumFetchFailed', {
                  defaultValue: 'Could not load premium flows',
                })
          }
          description={
            freeBeta
              ? t('movePremiumOfflineOpenBeta', {
                  defaultValue:
                    'Extra recovery flows unavailable offline — free flows above still work.',
                })
              : t('movePremiumOffline', {
                  defaultValue:
                    'Premium recovery flows unavailable offline — free flows below still work.',
                })
          }
        />
      )}

      {!premium && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 border-2 border-border bg-card px-4 py-3 text-sm min-h-[44px]"
            onClick={() => setPremiumOpen((v) => !v)}
          >
            <span className="font-semibold text-muted-foreground">
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
        <details className="house-card group">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center px-4 py-3 text-sm font-semibold text-muted-foreground [&::-webkit-details-marker]:hidden">
            {t('moveRecentWins', { defaultValue: 'Recent Move Wins' })}
          </summary>
          <div className="space-y-1 border-t-2 border-border px-4 py-3 text-sm text-muted-foreground">
            {recentWins.map((w) => (
              <div key={w.id}>
                {fmt.date(w.completedAt)} — {w.title}
              </div>
            ))}
          </div>
        </details>
      ) : (
        <EmptyState
          className="house-empty"
          icon={Wind}
          title={t('moveEmptyTitle', { defaultValue: 'No Move sessions logged yet' })}
          description={t('moveEmptyDesc', {
            defaultValue: 'Start a free mobility flow — your first win shows here.',
          })}
          actionLabel={t('moveEmptyCta', { defaultValue: 'Browse free flows' })}
          href="#move-flows"
        />
      )}
    </PillarPageShell>
  );
}
