'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BetaFunnelAggregate } from '@/types/betaMetrics';

interface Props {
  enabled: boolean;
}

export function BetaAdminPanel({ enabled }: Props) {
  const [metrics, setMetrics] = useState<BetaFunnelAggregate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/beta/metrics', { credentials: 'include' });
      if (res.status === 403) {
        setMetrics(null);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load metrics');
      setMetrics(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) void load();
  }, [enabled]);

  if (!enabled) return null;
  if (!loading && !metrics && !error) return null;

  return (
    <Card className="border-amber-500/40 bg-amber-950/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Beta funnel (all users)</span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="text-xs font-normal text-emerald-400 hover:underline disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {metrics && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Total profiles" value={String(metrics.totalProfiles)} />
              <Stat label="Last 14 days" value={String(metrics.signedUpLast14Days)} />
              <Stat label="I-Day complete" value={`${metrics.iDayCompletionPct}%`} />
              <Stat label="BT 5/5 complete" value={`${metrics.basicCompletePct}%`} />
              <Stat label="Commissioned" value={`${metrics.commissionedPct}%`} />
              <Stat label="Phase events" value={String(metrics.phaseTransitionCount)} />
            </div>
            <div className="text-xs text-muted-foreground">
              Phases: I-Day {metrics.phaseCounts['i-day']} · Basic {metrics.phaseCounts.basic} · Readiness{' '}
              {metrics.phaseCounts.readiness} · Commissioned {metrics.phaseCounts.commissioned}
            </div>
            <div
              className={`rounded-lg border p-3 text-xs ${
                metrics.launchReady
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-950/10 text-amber-200/90'
              }`}
            >
              <div className="font-semibold mb-1">
                {metrics.launchReady
                  ? 'Launch gate: READY (consider PRIVATE_MODE=false after final PROTECTION pass)'
                  : 'Launch gate: not ready'}
              </div>
              {metrics.launchNotes.length === 0 ? (
                <p>All beta targets met.</p>
              ) : (
                <ul className="list-disc pl-4 space-y-1">
                  {metrics.launchNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
        <p className="text-[10px] text-muted-foreground">
          Requires <code className="text-[10px]">BETA_ADMIN_EMAILS</code> +{' '}
          <code className="text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold font-mono">{value}</div>
    </div>
  );
}
